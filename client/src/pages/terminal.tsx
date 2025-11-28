import Layout from "@/components/layout";
import { Terminal, AlertCircle } from "lucide-react";

export default function LiveLogs() {
  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Logs em Tempo Real</h1>
          <p className="text-muted-foreground">
            Monitore as ações do agente e saídas do sistema em tempo real.
          </p>
        </div>

        <div className="flex-1 bg-[#1e1e1e] rounded-lg border border-border shadow-sm p-4 font-mono text-sm overflow-y-auto relative">
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-zinc-400">Conectado</span>
          </div>
          
          <div className="space-y-2">
            <div className="text-zinc-500">2025-11-28 14:30:01 [INFO] Sistema iniciado com sucesso</div>
            <div className="text-zinc-500">2025-11-28 14:30:02 [INFO] Carregando configurações do agente...</div>
            <div className="text-blue-400">2025-11-28 14:30:02 [AGENT] QualifyBot inicializado (modelo: claude-3-5-sonnet)</div>
            <div className="text-zinc-500">2025-11-28 14:30:05 [INFO] Aguardando entrada do usuário...</div>
            <div className="text-green-400">2025-11-28 14:30:15 [TOOL] Executando 'analyze_company_fit' para 'replit.com'</div>
            <div className="text-zinc-400 pl-4">Input: &#123; "domain": "replit.com" &#125;</div>
            <div className="text-green-400">2025-11-28 14:30:18 [TOOL] Sucesso (320ms)</div>
            <div className="text-blue-400">2025-11-28 14:30:19 [AGENT] Gerando resposta final...</div>
          </div>
          
          <div className="mt-4 flex items-center text-zinc-600 animate-pulse">
            <span className="mr-2">_</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
