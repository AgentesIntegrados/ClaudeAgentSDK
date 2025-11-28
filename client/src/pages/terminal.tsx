import Layout from "@/components/layout";
import { Terminal, Trash2, Download, Filter } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchConversations, fetchMessages } from "@/lib/api";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: "INFO" | "AGENT" | "TOOL" | "ERROR" | "WARN";
  message: string;
  details?: string;
}

export default function LiveLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    refetchInterval: 3000,
  });

  const latestConversationId = conversations?.[0]?.id;

  const { data: messages } = useQuery({
    queryKey: ["messages", latestConversationId],
    queryFn: () => latestConversationId ? fetchMessages(latestConversationId) : Promise.resolve([]),
    enabled: !!latestConversationId,
    refetchInterval: 2000,
  });

  useEffect(() => {
    const initialLogs: LogEntry[] = [
      {
        id: "init-1",
        timestamp: new Date(),
        level: "INFO",
        message: "Sistema iniciado com sucesso",
      },
      {
        id: "init-2",
        timestamp: new Date(),
        level: "INFO",
        message: "Carregando configurações do agente...",
      },
      {
        id: "init-3",
        timestamp: new Date(),
        level: "AGENT",
        message: "QualifyBot inicializado (modelo: claude-sonnet-4)",
      },
      {
        id: "init-4",
        timestamp: new Date(),
        level: "INFO",
        message: "Aguardando entrada do usuário...",
      },
    ];
    setLogs(initialLogs);
  }, []);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const newLogs: LogEntry[] = [];
      
      messages.forEach((msg) => {
        const timestamp = new Date(msg.createdAt);
        
        if (msg.role === "user") {
          newLogs.push({
            id: `user-${msg.id}`,
            timestamp,
            level: "INFO",
            message: `Mensagem recebida do usuário`,
            details: msg.content.substring(0, 100) + (msg.content.length > 100 ? "..." : ""),
          });
        } else {
          if (msg.toolUse) {
            const toolUse = msg.toolUse as any;
            newLogs.push({
              id: `tool-${msg.id}`,
              timestamp,
              level: "TOOL",
              message: `Executando '${toolUse.tool}'`,
              details: `Input: ${toolUse.input}`,
            });
            newLogs.push({
              id: `tool-result-${msg.id}`,
              timestamp: new Date(timestamp.getTime() + 500),
              level: "TOOL",
              message: `Ferramenta '${toolUse.tool}' concluída com sucesso`,
            });
          }
          
          newLogs.push({
            id: `agent-${msg.id}`,
            timestamp: new Date(timestamp.getTime() + 1000),
            level: "AGENT",
            message: "Resposta gerada pelo agente",
            details: msg.content.substring(0, 100) + (msg.content.length > 100 ? "..." : ""),
          });
        }
      });

      setLogs(prev => {
        const existingIds = new Set(prev.map(l => l.id));
        const uniqueNewLogs = newLogs.filter(l => !existingIds.has(l.id));
        if (uniqueNewLogs.length > 0) {
          return [...prev, ...uniqueNewLogs].slice(-100);
        }
        return prev;
      });
    }
  }, [messages]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  const clearLogs = () => {
    setLogs([{
      id: "clear-" + Date.now(),
      timestamp: new Date(),
      level: "INFO",
      message: "Logs limpos pelo usuário",
    }]);
  };

  const downloadLogs = () => {
    const content = logs.map(log => 
      `${log.timestamp.toISOString()} [${log.level}] ${log.message}${log.details ? `\n    ${log.details}` : ""}`
    ).join("\n");
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-logs-${new Date().toISOString().split("T")[0]}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = filter === "all" 
    ? logs 
    : logs.filter(log => log.level === filter);

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "INFO": return "text-zinc-400";
      case "AGENT": return "text-blue-400";
      case "TOOL": return "text-green-400";
      case "ERROR": return "text-red-400";
      case "WARN": return "text-yellow-400";
      default: return "text-zinc-400";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit" 
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Logs em Tempo Real</h1>
            <p className="text-muted-foreground">
              Monitore as ações do agente e saídas do sistema em tempo real.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-secondary border border-border rounded-md px-3 py-2 text-sm"
              data-testid="select-log-filter"
            >
              <option value="all">Todos os Logs</option>
              <option value="INFO">INFO</option>
              <option value="AGENT">AGENT</option>
              <option value="TOOL">TOOL</option>
              <option value="ERROR">ERROR</option>
            </select>
            
            <button
              onClick={downloadLogs}
              className="p-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              title="Baixar logs"
              data-testid="button-download-logs"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={clearLogs}
              className="p-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              title="Limpar logs"
              data-testid="button-clear-logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 bg-[#1e1e1e] rounded-lg border border-border shadow-sm p-4 font-mono text-sm overflow-y-auto relative"
        >
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-[#1e1e1e]/80 px-2 py-1 rounded">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-zinc-400">Conectado</span>
          </div>
          
          <div className="space-y-1 pt-6">
            {filteredLogs.map((log) => (
              <div key={log.id} className="group">
                <div className="flex items-start gap-2">
                  <span className="text-zinc-600 shrink-0">{formatTime(log.timestamp)}</span>
                  <span className={`shrink-0 font-semibold ${getLevelColor(log.level)}`}>
                    [{log.level}]
                  </span>
                  <span className={getLevelColor(log.level)}>{log.message}</span>
                </div>
                {log.details && (
                  <div className="pl-24 text-zinc-500 text-xs mt-0.5">
                    {log.details}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center text-zinc-600 animate-pulse">
            <span className="mr-2">_</span>
          </div>
        </div>

        {!autoScroll && (
          <button
            onClick={() => {
              setAutoScroll(true);
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }
            }}
            className="fixed bottom-8 right-8 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors text-sm"
            data-testid="button-scroll-to-bottom"
          >
            ↓ Ir para o final
          </button>
        )}
      </div>
    </Layout>
  );
}
