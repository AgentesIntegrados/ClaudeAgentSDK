
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
    description: "Reduzir custos de API e melhorar performance com cache Redis",
    status: "planned",
    category: "improvement",
    technical_details: [
      "Cache de 24h para dados de perfis",
      "Invalidação automática em mudanças críticas",
      "Redis Cloud: US$ 0.00/mês (500MB gratuito)"
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
    title: "Sequência de Follow-up Automático",
    description: "Emails automáticos personalizados baseados no score e nicho do expert",
    status: "planned",
    category: "feature",
    technical_details: [
      "3 templates de email por faixa de score (70-80, 80-90, 90+)",
      "Personalização com dados do expert (nicho, infoprodutos, autoridade)",
      "Agendamento inteligente: Dia 1, Dia 3, Dia 7, Dia 14",
      "Tracking de abertura e cliques (via Resend/SendGrid)",
      "Stop automático se houver resposta"
    ]
  },
  {
    id: "10",
    title: "Pipeline de Qualificação (BANT)",
    description: "Sistema de scoring baseado em Budget, Authority, Need, Timing",
    status: "planned",
    category: "feature",
    technical_details: [
      "Budget: Ticket médio dos infoprodutos (R$ 2k+, R$ 5k+, R$ 10k+)",
      "Authority: Seguidores, engajamento, menções em mídia",
      "Need: Nicho alinhado (médicos), gaps identificados",
      "Timing: Lançamentos recentes, crescimento de seguidores",
      "Score final: 0-100 com recomendação de abordagem"
    ]
  },
  {
    id: "11",
    title: "CRM Integrado com Histórico de Interações",
    description: "Registro completo de conversas, emails enviados e status de negociação",
    status: "planned",
    category: "feature",
    technical_details: [
      "Status: Novo Lead → Qualificado → Em Negociação → Ganho/Perdido",
      "Timeline de interações: emails, DMs, ligações, reuniões",
      "Notas do SDR sobre cada contato",
      "Tags personalizadas (Ex: 'Aguardando proposta', 'Interesse alto')",
      "Exportação para Pipedrive/HubSpot/Salesforce"
    ]
  },
  {
    id: "12",
    title: "Templates de Proposta Comercial",
    description: "Geração automática de propostas personalizadas com IA",
    status: "planned",
    category: "feature",
    technical_details: [
      "Claude gera proposta baseada nos dados do expert",
      "3 modelos: Parceria, Afiliação, White Label",
      "Cálculo automático de ROI e projeção de faturamento",
      "Exportação em PDF com design profissional",
      "Assinatura eletrônica via DocuSign/ClickSign"
    ]
  },
  {
    id: "13",
    title: "Dashboard de Conversão e Métricas",
    description: "Análise de funil comercial com KPIs de SDR em tempo real",
    status: "planned",
    category: "improvement",
    technical_details: [
      "Taxa de conversão por etapa do funil",
      "Tempo médio de fechamento",
      "Ticket médio por parceria fechada",
      "ROI de cada campanha de outreach",
      "Gráficos de tendência e comparativo mensal"
    ]
  },
  {
    id: "14",
    title: "Automação de Agendamento de Reuniões",
    description: "Integração com Calendly/Google Calendar para agendar calls",
    status: "planned",
    category: "feature",
    technical_details: [
      "Link de agendamento único por lead",
      "Sincronização automática com Google Calendar",
      "Lembrete automático 24h e 1h antes da reunião",
      "Preparação de briefing da call com dados do expert",
      "Registro automático da reunião no CRM"
    ]
  },
  {
    id: "15",
    title: "Sistema de Pontos de Gatilho (Triggers)",
    description: "Alertas quando expert realiza ação que indica momento de compra",
    status: "planned",
    category: "feature",
    technical_details: [
      "Gatilho 1: Expert lançou novo produto (momento quente)",
      "Gatilho 2: Crescimento anormal de seguidores (>20%/mês)",
      "Gatilho 3: Menção em mídia ou prêmio recebido",
      "Gatilho 4: Expert abriu vaga na equipe (expansão)",
      "Notificação instantânea ao SDR com sugestão de abordagem"
    ]
  },
  {
    id: "16",
    title: "Script de Cold Call com IA",
    description: "Claude gera roteiro personalizado de ligação baseado no perfil do expert",
    status: "planned",
    category: "feature",
    technical_details: [
      "Análise prévia do tom de voz do expert (bio, posts)",
      "Objeções previstas e respostas personalizadas",
      "Gatilhos emocionais específicos do nicho",
      "Perguntas de descoberta (Discovery Questions)",
      "Script adaptável em tempo real durante a call"
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
            Roadmap de Evolução
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✅ <strong>Fase 1 (Atual - Q1 2025):</strong> Sistema funcional com base hardcoded + Cache inteligente</li>
            <li>🔄 <strong>Fase 2 (Q2 2025):</strong> Integração Instagram Graph API + Analytics avançado</li>
            <li>⏳ <strong>Fase 3 (Q3 2025):</strong> Fluxo comercial completo (CRM, Follow-up, Propostas)</li>
            <li>🚀 <strong>Fase 4 (Q4 2025):</strong> Automação SDR full stack (Gatilhos, Cold Call IA, Agendamento)</li>
            <li>🎯 <strong>Fase 5 (2026):</strong> Integração Social Blade/HypeAuditor + Análise preditiva com ML</li>
          </ul>
        </div>

        {/* Commercial Flow Summary */}
        <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-3 text-green-400">🎯 Funcionalidades de Fluxo Comercial</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Automação de Outreach</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Sequências de email personalizadas</li>
                <li>Follow-up automático inteligente</li>
                <li>Templates de proposta com IA</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gestão de Pipeline</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>CRM integrado com histórico</li>
                <li>Qualificação BANT automatizada</li>
                <li>Dashboard de conversão em tempo real</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gatilhos de Vendas</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Alertas de momento de compra</li>
                <li>Monitoramento de lançamentos</li>
                <li>Crescimento anormal de seguidores</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Ferramentas de Conversão</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Agendamento automático de calls</li>
                <li>Scripts de cold call com IA</li>
                <li>Assinatura eletrônica de contratos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
