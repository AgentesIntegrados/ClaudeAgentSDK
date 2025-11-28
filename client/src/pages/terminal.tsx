import Layout from "@/components/layout";
import { Trash2, Download, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "AGENT" | "TOOL" | "ERROR" | "WARN";
  message: string;
  details?: unknown;
}

export default function LiveLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isConnected, setIsConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((log: LogEntry) => {
    setLogs(prev => [...prev, log].slice(-200));
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/logs`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        addLog({
          id: `system-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: "INFO",
          message: "Conectado ao servidor de logs em tempo real"
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "log") {
            addLog({
              id: data.id,
              timestamp: data.timestamp,
              level: data.level as LogEntry["level"],
              message: data.message,
              details: data.details
            });
          } else if (data.type === "connected") {
            addLog({
              id: `welcome-${Date.now()}`,
              timestamp: data.timestamp,
              level: "INFO",
              message: data.message
            });
          }
        } catch (e) {
          console.error("Erro ao parsear mensagem:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        addLog({
          id: `disconnect-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: "WARN",
          message: "Desconectado do servidor. Reconectando..."
        });
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (error) {
      console.error("Erro ao conectar WebSocket:", error);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  }, [addLog]);

  useEffect(() => {
    setLogs([
      {
        id: "init-1",
        timestamp: new Date().toISOString(),
        level: "INFO",
        message: "Inicializando conexão com servidor de logs..."
      }
    ]);
    
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

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
      id: `clear-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: "Logs limpos pelo usuário"
    }]);
  };

  const downloadLogs = () => {
    const content = logs.map(log => {
      const time = new Date(log.timestamp).toLocaleString("pt-BR");
      const details = log.details ? `\n    ${JSON.stringify(log.details)}` : "";
      return `${time} [${log.level}] ${log.message}${details}`;
    }).join("\n");
    
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("pt-BR", { 
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
              Monitore as ações do agente e saídas do sistema em tempo real via WebSocket.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isConnected 
                ? "bg-green-500/20 text-green-400" 
                : "bg-red-500/20 text-red-400"
            }`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? "Conectado" : "Desconectado"}
            </div>
            
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
              <option value="WARN">WARN</option>
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
          className="flex-1 bg-[#0d1117] rounded-lg border border-border shadow-sm p-4 font-mono text-sm overflow-y-auto"
        >
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="group hover:bg-white/5 px-2 py-0.5 rounded">
                <div className="flex items-start gap-2">
                  <span className="text-zinc-600 shrink-0 tabular-nums">{formatTime(log.timestamp)}</span>
                  <span className={`shrink-0 font-semibold w-14 ${getLevelColor(log.level)}`}>
                    [{log.level}]
                  </span>
                  <span className={getLevelColor(log.level)}>{log.message}</span>
                </div>
                {log.details && (
                  <div className="pl-28 text-zinc-500 text-xs mt-0.5 font-mono whitespace-pre-wrap">
                    {String(typeof log.details === "string" 
                      ? log.details 
                      : JSON.stringify(log.details, null, 2))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center text-green-500">
            <span className="animate-pulse">▌</span>
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
