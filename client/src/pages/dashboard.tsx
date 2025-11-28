import Layout from "@/components/layout";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Activity, ShieldCheck, Code2, Terminal, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDefaultAgentConfig, fetchMessages, createConversation, sendChatMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UIMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  toolUse?: {
    tool: string;
    input: string;
    status: "running" | "completed";
    result?: any;
  };
}

export default function Dashboard() {
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch default agent config
  const { data: agentConfig } = useQuery({
    queryKey: ["agent-config", "default"],
    queryFn: fetchDefaultAgentConfig,
  });

  // Fetch messages for current conversation
  const { data: dbMessages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => conversationId ? fetchMessages(conversationId) : Promise.resolve([]),
    enabled: !!conversationId,
  });

  // Convert DB messages to UI format
  const messages: UIMessage[] = dbMessages.map(msg => ({
    id: msg.id,
    role: msg.role as "user" | "agent",
    content: msg.content,
    timestamp: new Date(msg.createdAt),
    toolUse: msg.toolUse as any,
  }));

  // Add initial greeting if no messages
  const displayMessages: UIMessage[] = messages.length === 0 ? [
    {
      id: "greeting",
      role: "agent",
      content: "Olá! Sou o QualifyBot, seu Agente SDR. Posso ajudar a analisar empresas e encontrar tomadores de decisão. Qual empresa devo investigar hoje?",
      timestamp: new Date()
    }
  ] : messages;

  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (data) => {
      setConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const chatMutation = useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) => 
      sendChatMessage(conversationId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao enviar mensagem",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages]);

  const handleSend = async () => {
    if (!input.trim() || !agentConfig) return;

    const userInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // Create conversation if needed
      let convId = conversationId;
      if (!convId) {
        const conv = await createConversationMutation.mutateAsync({
          agentConfigId: agentConfig.id,
          title: userInput.substring(0, 50),
        });
        convId = conv.id;
      }

      // Send message to Claude API
      await chatMutation.mutateAsync({
        conversationId: convId,
        message: userInput,
      });

    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetSession = () => {
    setConversationId(null);
    queryClient.removeQueries({ queryKey: ["messages"] });
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        
        {/* Left Column: Status & Metrics */}
        <div className="space-y-6 lg:col-span-1">
          {/* Status Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Bot className="w-24 h-24" />
            </div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Status do Agente
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estado</span>
                <span className="flex items-center text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 animate-pulse" />
                  Ativo
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Modelo</span>
                <span className="font-mono text-sm">{agentConfig?.model || "carregando..."}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mensagens</span>
                <span className="font-mono text-sm">{messages.length}</span>
              </div>
            </div>
          </div>

          {/* Tools Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Code2 className="w-5 h-5 mr-2 text-primary" />
              Ferramentas Ativas
            </h2>
            <div className="space-y-3">
              {(agentConfig?.allowedTools || ["analyze_company_fit", "get_decision_maker"]).map((tool) => (
                <div key={tool} className="flex items-center justify-between bg-background/50 p-2 rounded border border-border/50">
                  <span className="font-mono text-xs">{tool}</span>
                  <div className="w-2 h-2 rounded-full bg-blue-400/50" />
                </div>
              ))}
            </div>
          </div>

          {/* Safety Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-primary" />
              Segurança & Limites
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modo de Permissão</span>
                <span className="capitalize">{agentConfig?.permissionMode || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Máx. Turnos</span>
                <span>{agentConfig?.maxTurns || "-"}</span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full mt-2">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all" 
                  style={{ width: `${Math.min((messages.length / (agentConfig?.maxTurns || 10)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right pt-1">
                {messages.length}/{agentConfig?.maxTurns || 10} turnos usados
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Interface */}
        <div className="lg:col-span-2 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-card/50 backdrop-blur">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mr-3">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{agentConfig?.name || "QualifyBot"}</h3>
                <p className="text-xs text-muted-foreground">Powered by Claude Agent SDK</p>
              </div>
            </div>
            <button 
              onClick={handleResetSession}
              className="text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded transition-colors"
              data-testid="button-reset-session"
            >
              Reiniciar Sessão
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {displayMessages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === "user" ? "bg-primary" : "bg-secondary"
                )}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className="space-y-2">
                  <div className={cn(
                    "p-3 rounded-lg text-sm leading-relaxed shadow-sm",
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-secondary text-secondary-foreground rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>

                  {/* Tool Execution Visualization */}
                  {msg.toolUse && (
                    <div className="bg-background border border-border rounded-md p-3 text-xs font-mono space-y-2 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center text-muted-foreground">
                        <Terminal className="w-3 h-3 mr-2" />
                        <span>Executou: {msg.toolUse.tool}</span>
                      </div>
                      <div className="opacity-70 pl-5 border-l-2 border-border/50">
                        input: {msg.toolUse.input}
                      </div>
                      <div className="text-green-400 pl-5 border-l-2 border-green-500/30 flex items-center gap-2">
                        <Check className="w-3 h-3" />
                        Concluído
                      </div>
                      {msg.toolUse.result && (
                        <div className="text-muted-foreground pl-5 border-l-2 border-border/50 mt-1">
                          <details className="cursor-pointer">
                            <summary className="text-xs hover:text-foreground">Ver resultado</summary>
                            <pre className="mt-2 text-xs overflow-auto max-h-32 bg-background/50 p-2 rounded">
                              {JSON.stringify(msg.toolUse.result, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-secondary p-3 rounded-lg rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-background">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Peça ao QualifyBot para analisar uma empresa..."
                className="w-full bg-secondary/50 border border-input hover:border-primary/50 focus:border-primary rounded-lg py-3 pl-4 pr-12 outline-none transition-colors"
                disabled={isTyping}
                data-testid="input-message"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                data-testid="button-send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Pressione Enter para enviar • Powered by Claude
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
