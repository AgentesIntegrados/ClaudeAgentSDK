import Layout from "@/components/layout";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Terminal, Check, Menu, X, Trophy, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDefaultAgentConfig, fetchMessages, createConversation, sendChatMessage, fetchRankings, createRanking, deleteRanking } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ExpertRanking } from "@shared/schema";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch default agent config
  const { data: agentConfig } = useQuery({
    queryKey: ["agent-config", "default"],
    queryFn: fetchDefaultAgentConfig,
  });

  // Fetch rankings
  const { data: rankings = [] } = useQuery({
    queryKey: ["rankings"],
    queryFn: fetchRankings,
  });

  // Create ranking mutation
  const createRankingMutation = useMutation({
    mutationFn: createRanking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rankings"] });
      toast({ title: "Salvo!", description: "Expert adicionado ao ranking" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  // Delete ranking mutation
  const deleteRankingMutation = useMutation({
    mutationFn: deleteRanking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rankings"] });
      toast({ title: "Removido", description: "Expert removido do ranking" });
    },
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
      content: "Olá! Sou o ExpertBot, especialista em qualificar experts e mentores high ticket. Analiso infoprodutos, comunidade, ticket médio e autoridade. Qual expert devo analisar?",
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      // Auto-refresh rankings se expert foi salvo automaticamente
      if (data?.savedToRanking) {
        queryClient.invalidateQueries({ queryKey: ["rankings"] });
      }
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

  // Extract expert data from tool result and save to ranking
  const handleSaveToRanking = (toolResult: any) => {
    if (!toolResult?.analysis) return;
    
    const { analysis } = toolResult;
    // Normaliza handle: remove @, trim, lowercase
    const rawHandle = String(toolResult.instagram_handle || analysis.nome);
    const normalizedHandle = rawHandle.replace('@', '').trim().toLowerCase();
    // Deriva qualified de forma consistente: score >= 70
    const isQualified = analysis.qualified ?? (analysis.score >= 70);
    
    createRankingMutation.mutate({
      instagramHandle: normalizedHandle,
      nome: analysis.nome,
      nicho: analysis.nicho,
      publicoAlvo: analysis.publicoAlvo,
      seguidores: analysis.seguidores,
      score: analysis.score,
      qualified: isQualified ? "SIM" : "NAO",
      infoprodutos: analysis.infoprodutos,
      comunidade: analysis.comunidade,
      autoridade: analysis.autoridade,
      estruturaVendas: analysis.estruturaVendas,
      analysisData: toolResult,
    });
  };

  // Check if expert is already in ranking (normaliza ambos para comparação)
  const isInRanking = (handle: string) => {
    const normalized = handle.replace('@', '').trim().toLowerCase();
    return rankings.some(r => r.instagramHandle.replace('@', '').trim().toLowerCase() === normalized);
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] relative">
        {/* Ranking Sidebar */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 flex flex-col"
              >
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h2 className="font-bold text-lg">Ranking de Experts</h2>
                  </div>
                  <button 
                    onClick={() => setMenuOpen(false)}
                    className="p-1 hover:bg-secondary rounded"
                    data-testid="button-close-menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {rankings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum expert salvo ainda. Experts são salvos automaticamente após análise.
                    </p>
                  ) : (
                    <>
                      {/* QUALIFICADOS Section */}
                      {rankings.filter(r => r.score >= 70).length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold text-green-400 flex items-center gap-2">
                            <Check className="w-3 h-3" />
                            QUALIFICADOS ({rankings.filter(r => r.score >= 70).length})
                          </h3>
                          {rankings
                            .filter(r => r.score >= 70)
                            .sort((a, b) => b.score - a.score)
                            .map((expert, index) => (
                            <div 
                              key={expert.id} 
                              className="p-3 rounded-lg border border-green-500/30 bg-green-500/5"
                              data-testid={`ranking-item-${expert.id}`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-green-400">#{index + 1}</span>
                                  <div>
                                    <p className="font-semibold text-sm">{expert.instagramHandle}</p>
                                    <p className="text-xs text-muted-foreground">{expert.nicho || "Nicho não identificado"}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => deleteRankingMutation.mutate(expert.id)}
                                  className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive"
                                  data-testid={`button-delete-ranking-${expert.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="text-xs font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                                  {expert.score}/100
                                </div>
                                <span className="text-xs text-green-400">QUALIFICADO</span>
                              </div>
                              {expert.seguidores && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {expert.seguidores.toLocaleString()} seguidores
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* DESQUALIFICADOS Section */}
                      {rankings.filter(r => r.score < 70).length > 0 && (
                        <div className="space-y-2 mt-4">
                          <h3 className="text-xs font-bold text-red-400 flex items-center gap-2">
                            <X className="w-3 h-3" />
                            DESQUALIFICADOS ({rankings.filter(r => r.score < 70).length})
                          </h3>
                          {rankings
                            .filter(r => r.score < 70)
                            .sort((a, b) => b.score - a.score)
                            .map((expert) => (
                            <div 
                              key={expert.id} 
                              className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 opacity-75"
                              data-testid={`ranking-item-${expert.id}`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <div>
                                    <p className="font-semibold text-sm">{expert.instagramHandle}</p>
                                    <p className="text-xs text-muted-foreground">{expert.nicho || "Nicho não identificado"}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => deleteRankingMutation.mutate(expert.id)}
                                  className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive"
                                  data-testid={`button-delete-ranking-${expert.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                                  {expert.score}/100
                                </div>
                                <span className="text-xs text-red-400">NÃO QUALIFICADO</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="p-4 border-t border-border text-center">
                  <p className="text-xs text-muted-foreground">
                    {rankings.length} expert{rankings.length !== 1 ? "s" : ""} | 
                    <span className="text-green-400"> {rankings.filter(r => r.score >= 70).length} qualificado{rankings.filter(r => r.score >= 70).length !== 1 ? "s" : ""}</span> |
                    <span className="text-red-400"> {rankings.filter(r => r.score < 70).length} desqualificado{rankings.filter(r => r.score < 70).length !== 1 ? "s" : ""}</span>
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Chat Interface */}
        <div className="h-full flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-card/50 backdrop-blur">
            <div className="flex items-center">
              <button 
                onClick={() => setMenuOpen(true)}
                className="p-2 hover:bg-secondary rounded-lg mr-2 relative"
                data-testid="button-open-menu"
              >
                <Menu className="w-5 h-5" />
                {rankings.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {rankings.length}
                  </span>
                )}
              </button>
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mr-3">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{agentConfig?.name || "ExpertBot"}</h3>
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
                      {/* Save to Ranking button */}
                      {msg.toolUse.tool?.includes("analyze_expert_fit") && msg.toolUse.result?.analysis && (
                        <div className="pt-2 border-t border-border/50 mt-2">
                          {isInRanking(msg.toolUse.result.instagram_handle || msg.toolUse.result.analysis?.nome) ? (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Check className="w-3 h-3 text-green-400" /> Já está no ranking
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSaveToRanking(msg.toolUse?.result)}
                              disabled={createRankingMutation.isPending}
                              className="flex items-center gap-1 text-xs bg-primary/20 hover:bg-primary/30 text-primary px-2 py-1 rounded transition-colors disabled:opacity-50"
                              data-testid="button-save-ranking"
                            >
                              <Plus className="w-3 h-3" />
                              Salvar no Ranking
                            </button>
                          )}
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
                placeholder="Digite o @ de um expert/mentor para analisar..."
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
