import Layout from "@/components/layout";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Activity, ShieldCheck, Code2, Terminal, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "agent",
      content: "Olá! Sou o QualifyBot, seu Agente SDR. Posso ajudar a analisar empresas e encontrar tomadores de decisão. Qual empresa devo investigar hoje?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate Agent Thinking & Tool Use
    setTimeout(() => {
      // 1. Agent decides to use a tool
      const toolMsgId = Date.now().toString() + "-tool";
      setMessages(prev => [...prev, {
        id: toolMsgId,
        role: "agent",
        content: "Deixe-me verificar os detalhes da empresa...",
        timestamp: new Date(),
        toolUse: {
          tool: "analyze_company_fit",
          input: `{ "domain": "${input}" }`,
          status: "running"
        }
      }]);

      // 2. Tool completes
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === toolMsgId 
            ? { 
                ...m, 
                toolUse: { 
                  ...m.toolUse!, 
                  status: "completed",
                  result: { qualified: true, score: 85, match: "Series B, Python Stack" } 
                } 
              } 
            : m
        ));

        // 3. Final response
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + "-final",
            role: "agent",
            content: `Com base na minha análise de ${userMsg.content}, eles têm um forte alinhamento (Pontuação: 85/100). Eles usam Python e estão no nosso estágio de financiamento alvo. Gostaria que eu encontrasse um tomador de decisão?`,
            timestamp: new Date()
          }]);
          setIsTyping(false);
        }, 800);

      }, 1500);
    }, 600);
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
                <span className="font-mono text-sm">claude-3-5-sonnet</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tempo Ativo</span>
                <span className="font-mono text-sm">4h 12m</span>
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
              {["analyze_company_fit", "get_decision_maker", "web_search"].map((tool) => (
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
                <span>Perguntar ao Usuário</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Máx. Turnos</span>
                <span>10</span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full mt-2">
                <div className="bg-primary h-1.5 rounded-full w-[30%]" />
              </div>
              <p className="text-xs text-muted-foreground text-right pt-1">30% do Contexto Usado</p>
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
                <h3 className="font-semibold">QualifyBot</h3>
                <p className="text-xs text-muted-foreground">Powered by Claude Agent SDK</p>
              </div>
            </div>
            <button className="text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded transition-colors">
              Reiniciar Sessão
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((msg) => (
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
                        <span>Executando: {msg.toolUse.tool}</span>
                      </div>
                      <div className="opacity-70 pl-5 border-l-2 border-border/50">
                        input: {msg.toolUse.input}
                      </div>
                      {msg.toolUse.status === "completed" ? (
                        <div className="text-green-400 pl-5 border-l-2 border-green-500/30 flex items-center gap-2">
                          <Check className="w-3 h-3" />
                          Concluído (230ms)
                        </div>
                      ) : (
                        <div className="text-blue-400 pl-5 border-l-2 border-blue-500/30 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                          Processando...
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
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Peça ao QualifyBot para analisar uma empresa..."
                className="w-full bg-secondary/50 border border-input hover:border-primary/50 focus:border-primary rounded-lg py-3 pl-4 pr-12 outline-none transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Pressione Enter para enviar • IA pode cometer erros.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
