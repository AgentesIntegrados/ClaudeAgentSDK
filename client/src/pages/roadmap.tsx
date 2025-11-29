
import Layout from "@/components/layout";
import { CheckCircle2, Circle, Clock, Code, Database, Zap, Lock } from "lucide-react";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "planned";
  category: "feature" | "integration" | "improvement";
  technical_details?: string[];
}

const roadmapItems: RoadmapItem[] = [
  {
    id: "1",
    title: "Sistema de Análise Hardcoded",
    description: "Base de dados local com perfis pré-analisados de experts brasileiros",
    status: "completed",
    category: "feature",
    technical_details: [
      "Dicionário local em server/claude.ts",
      "Análise instantânea sem API externa",
      "Limitado aos perfis cadastrados manualmente"
    ]
  },
  {
    id: "2",
    title: "Integração com Instagram Graph API",
    description: "Buscar dados REAIS de perfis públicos do Instagram via API oficial do Meta",
    status: "planned",
    category: "integration",
    technical_details: [
      "Requer aprovação Meta Business (processo 2-4 semanas)",
      "Acesso a: seguidores, posts, engajamento, bio",
      "Rate limits: 200 chamadas/hora (tier gratuito)",
      "Custo: Gratuito (tier básico) | US$ 0.10/1000 requests (tier pago)",
      "Documentação: https://developers.facebook.com/docs/instagram-api"
    ]
  },
  {
    id: "3",
    title: "Integração com Social Blade API",
    description: "Métricas avançadas de crescimento e análise de influenciadores",
    status: "planned",
    category: "integration",
    technical_details: [
      "API paga - Planos a partir de US$ 3.99/mês",
      "Dados: histórico de seguidores, taxa de crescimento, ranking",
      "Suporta múltiplas plataformas (Instagram, YouTube, TikTok)",
      "Rate limits: 60 requests/hora (plano básico)",
      "Website: https://socialblade.com/api"
    ]
  },
  {
    id: "4",
    title: "Integração com HypeAuditor API",
    description: "Análise profissional de autenticidade e qualidade de audiência",
    status: "planned",
    category: "integration",
    technical_details: [
      "API empresarial - Contato comercial necessário",
      "Detecta seguidores falsos e bots",
      "Análise de engajamento real vs. inflado",
      "Estimativa de faturamento do influenciador",
      "Website: https://hypeauditor.com/api"
    ]
  },
  {
    id: "5",
    title: "Web Scraping de Perfis Públicos",
    description: "Extração automatizada de dados públicos do Instagram (ATENÇÃO: Violar ToS)",
    status: "planned",
    category: "integration",
    technical_details: [
      "⚠️ RISCO: Viola Termos de Serviço do Instagram",
      "Pode resultar em bloqueio de IP ou conta",
      "Alternativas: Puppeteer, Playwright, Selenium",
      "Proxies rotativos necessários para escala",
      "Não recomendado para produção"
    ]
  },
  {
    id: "6",
    title: "Sistema de Cache Inteligente",
    description: "Reduzir custos de API e melhorar performance com cache em memória",
    status: "completed",
    category: "improvement",
    technical_details: [
      "✅ Cache em memória (InMemoryCache) implementado",
      "✅ TTL de 24h para análises de experts",
      "✅ TTL de 24h para dados de contato",
      "✅ Invalidação por padrão (regex)",
      "✅ Limpeza automática a cada 10 minutos",
      "✅ Endpoints de gerenciamento (/api/cache/stats, /clear, /expert/:handle)",
      "✅ Interface visual em Settings com stats em tempo real",
      "✅ Logs detalhados de Cache HIT/MISS",
      "🔮 Upgrade futuro: Migrar para Redis Cloud se necessário (500MB gratuito)"
    ]
  },
  {
    id: "7",
    title: "Análise de Sentimento com IA",
    description: "Usar Claude para analisar comentários e bio do expert",
    status: "planned",
    category: "feature",
    technical_details: [
      "Extrair tom de voz da bio",
      "Analisar sentimento de comentários recentes",
      "Detectar autoridade baseada em linguagem"
    ]
  },
  {
    id: "8",
    title: "Webhook de Notificações",
    description: "Alertas automáticos quando novo expert qualificado é encontrado",
    status: "planned",
    category: "feature",
    technical_details: [
      "Integração com Slack/Discord/Telegram",
      "Email via SendGrid/Resend",
      "Push notifications via OneSignal"
    ]
  },
  {
    id: "9",
    title: "CRM de Leads Qualificados",
    description: "Sistema de gestão de relacionamento com experts prospectados",
    status: "planned",
    category: "feature",
    technical_details: [
      "Cadastro automático de leads após análise",
      "Status do funil: Novo → Contato Inicial → Reunião → Proposta → Fechado",
      "Histórico completo de interações",
      "Tags personalizadas (Urgente, VIP, Retornar em X dias)",
      "Integração com email para envio de propostas"
    ]
  },
  {
    id: "10",
    title: "Sequência de Emails Automatizada",
    description: "Cadência de follow-up automático para nurturing de leads",
    status: "planned",
    category: "feature",
    technical_details: [
      "Template de email personalizado por nicho",
      "Sequência: D0 (introdução) → D3 (case) → D7 (proposta)",
      "Rastreamento de abertura e cliques",
      "Integração com SendGrid/Resend/Brevo",
      "Pausa automática se lead responder"
    ]
  },
  {
    id: "11",
    title: "Agendamento de Reuniões",
    description: "Integração com calendário para agendamento automático de demos",
    status: "planned",
    category: "feature",
    technical_details: [
      "Integração com Google Calendar/Cal.com",
      "Link personalizado de agendamento no email",
      "Lembretes automáticos (24h e 1h antes)",
      "Sync bidirecional com CRM",
      "Timezone automático do prospect"
    ]
  },
  {
    id: "12",
    title: "Pipeline de Vendas Visual",
    description: "Dashboard Kanban para gestão visual do funil comercial",
    status: "planned",
    category: "feature",
    technical_details: [
      "Drag-and-drop entre estágios",
      "Métricas: Taxa de conversão por etapa",
      "Tempo médio em cada estágio",
      "Valor estimado do pipeline (forecast)",
      "Filtros por nicho, score, período"
    ]
  },
  {
    id: "13",
    title: "Gerador de Propostas Comerciais",
    description: "Templates de proposta personalizados por nicho com IA",
    status: "planned",
    category: "feature",
    technical_details: [
      "Claude gera proposta baseada no perfil do expert",
      "Calcula ROI estimado (com base em seguidores)",
      "Exporta em PDF profissional",
      "Versionamento de propostas",
      "Assinatura digital integrada (DocuSign)"
    ]
  },
  {
    id: "14",
    title: "Automação de Contratos",
    description: "Fluxo completo de assinatura e gestão de contratos",
    status: "planned",
    category: "feature",
    technical_details: [
      "Template de contrato editável",
      "Integração com DocuSign/PandaDoc",
      "Notificação de assinatura pendente",
      "Armazenamento seguro de contratos assinados",
      "Vencimento e renovação automática"
    ]
  },
  {
    id: "15",
    title: "Sistema de Comissionamento",
    description: "Controle de comissões da equipe de vendas",
    status: "planned",
    category: "feature",
    technical_details: [
      "Cálculo automático de comissão por fechamento",
      "Regras personalizáveis (% sobre valor, tiering)",
      "Dashboard de performance individual",
      "Exportação de relatório para RH/Financeiro",
      "Integração com ferramentas de pagamento"
    ]
  },
  {
    id: "16",
    title: "Integração com WhatsApp Business",
    description: "Contato direto com leads via WhatsApp automatizado",
    status: "planned",
    category: "integration",
    technical_details: [
      "API oficial do WhatsApp Business",
      "Templates de mensagem pré-aprovados",
      "Envio em massa (respeitando limites)",
      "Chatbot para qualificação inicial",
      "Histórico de conversas integrado ao CRM"
    ]
  },
  {
    id: "17",
    title: "Análise Preditiva de Fechamento",
    description: "IA prevê probabilidade de conversão de cada lead",
    status: "planned",
    category: "feature",
    technical_details: [
      "Machine Learning com histórico de vendas",
      "Score preditivo (0-100%) de fechamento",
      "Sugestão de melhor momento para contato",
      "Identificação de leads 'frios' para remarketing",
      "Dashboard de leads com maior probabilidade"
    ]
  },
  {
    id: "18",
    title: "Sistema de Tarefas e Follow-ups",
    description: "Gestão de ações comerciais com lembretes inteligentes",
    status: "planned",
    category: "feature",
    technical_details: [
      "Tarefas automáticas (ex: 'Ligar em 3 dias')",
      "Lembretes via email/push/Slack",
      "Integração com calendário",
      "Priorização baseada em score do lead",
      "Reatribuição automática se não cumprida"
    ]
  }
];

export default function Roadmap() {
  const getStatusIcon = (status: RoadmapItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />;
      case "planned":
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: RoadmapItem["status"]) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "in_progress":
        return "Em Progresso";
      case "planned":
        return "Planejado";
    }
  };

  const getCategoryIcon = (category: RoadmapItem["category"]) => {
    switch (category) {
      case "integration":
        return <Zap className="w-4 h-4" />;
      case "feature":
        return <Code className="w-4 h-4" />;
      case "improvement":
        return <Database className="w-4 h-4" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Roadmap de Implementações</h1>
          <p className="text-muted-foreground">
            Evolução do sistema: de análise hardcoded para integração real com APIs do Instagram
          </p>
        </div>

        {/* Legend */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm text-muted-foreground">Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-muted-foreground">Em Progresso</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-muted-foreground">Planejado</span>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="space-y-4">
          {roadmapItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">{getStatusIcon(item.status)}</div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                      item.status === "completed" ? "bg-green-500/20 text-green-400" :
                      item.status === "in_progress" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {getCategoryIcon(item.category)}
                      {item.category === "integration" ? "Integração" :
                       item.category === "feature" ? "Funcionalidade" : "Melhoria"}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {item.description}
                  </p>

                  {item.technical_details && (
                    <details className="mt-3">
                      <summary className="text-xs font-medium text-primary cursor-pointer hover:underline flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Detalhes Técnicos
                      </summary>
                      <div className="mt-3 pl-4 border-l-2 border-border space-y-1">
                        {item.technical_details.map((detail, i) => (
                          <p
                            key={i}
                            className={`text-xs font-mono ${
                              detail.includes("⚠️") ? "text-red-400" :
                              detail.includes("Custo:") || detail.includes("US$") ? "text-yellow-400" :
                              "text-muted-foreground"
                            }`}
                          >
                            {detail}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-medium text-muted-foreground">
                    {getStatusLabel(item.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-primary/10 border border-primary/30 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Roadmap por Fases
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✅ <strong>Fase 1 (Atual):</strong> Sistema funcional com base hardcoded + Analytics</li>
            <li>🔄 <strong>Fase 2 (Q2 2025):</strong> Integração Instagram Graph API + CRM Básico</li>
            <li>⏳ <strong>Fase 3 (Q3 2025):</strong> Pipeline de Vendas + Automação de Emails</li>
            <li>🚀 <strong>Fase 4 (Q4 2025):</strong> Propostas com IA + Análise Preditiva + WhatsApp</li>
          </ul>
        </div>

        {/* Categorias */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-blue-400">🔗 Integrações (5)</h4>
            <p className="text-xs text-muted-foreground">Instagram API, Social Blade, HypeAuditor, Web Scraping, WhatsApp</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-green-400">⚡ Funcionalidades (11)</h4>
            <p className="text-xs text-muted-foreground">CRM, Pipeline, Propostas, Contratos, Tarefas, Análise Preditiva</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-yellow-400">🎯 Melhorias (2)</h4>
            <p className="text-xs text-muted-foreground">Cache Inteligente, IA para Sentimento</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
