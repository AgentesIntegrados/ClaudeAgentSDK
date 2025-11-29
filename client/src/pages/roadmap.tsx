import { useState, useMemo } from "react";
import Layout from "@/components/layout";
import { CheckCircle2, Circle, Clock, Code, Database, Zap, Lock, Filter, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "planned";
  category: "feature" | "integration" | "improvement";
  complexity: "simple" | "medium" | "complex";
  technical_details?: string[];
}

const roadmapItems: RoadmapItem[] = [
  {
    id: "mcp-real",
    title: "MCP Client Sistema Completo",
    description: "Sistema de conexão com MCP Servers externos já implementado e funcionando",
    status: "completed",
    category: "integration",
    complexity: "complex",
    technical_details: [
      "✅ IMPLEMENTADO: Sistema MCP Client funcional",
      "✅ Sequential Thinking (Smithery AI) - Conectado",
      "Suporta transportes: HTTP, WebSocket, stdio",
      "Autenticação: Bearer, Header, Query params",
      "Gerenciamento de secrets via Replit Secrets",
      "Descoberta automática de ferramentas",
      "🔧 server/mcp-manager.ts: Gerencia conexões",
      "🔧 server/seed-mcp.ts: Servers padrão",
      "📋 Ferramenta disponível: mcp__sequential_thinking__sequentialthinking"
    ]
  },
  {
    id: "mock-tools",
    title: "Ferramentas SDR (MOCK/SIMULAÇÃO)",
    description: "⚠️ analyze_expert_fit e get_expert_contact são SIMULAÇÕES - NÃO são MCPs reais",
    status: "in_progress",
    category: "feature",
    complexity: "medium",
    technical_details: [
      "🟡 STATUS: MOCK - Dados simulados em server/claude.ts",
      "⚠️ mcp__sdr__analyze_expert_fit: Usa dicionário hardcoded",
      "⚠️ mcp__sdr__get_expert_contact: Retorna dados fictícios",
      "📍 Localização: server/claude.ts (linhas 14-350)",
      "🎯 PRÓXIMO PASSO: Substituir por API real",
      "Opções: Instagram Graph API, HypeAuditor, Social Blade",
      "Ver itens 'Integração com Instagram Graph API' abaixo"
    ]
  },
  {
    id: "1",
    title: "Sistema de Análise Hardcoded (PROVISÓRIO)",
    description: "Base de dados local temporária - será removida quando o agente estiver 100% validado",
    status: "in_progress",
    category: "feature",
    complexity: "simple",
    technical_details: [
      "🟢 Complexidade: SIMPLES (1-2 dias)",
      "⚠️ PROVISÓRIO: Usado enquanto validamos o agente",
      "Dicionário local em server/claude.ts",
      "Análise instantânea sem API externa",
      "Limitado aos perfis cadastrados manualmente",
      "➡️ Use 'Validação do Agente' no menu para testar",
      "🎯 Objetivo: Remover quando todos os testes passarem"
    ]
  },
  {
    id: "2",
    title: "Integração com Instagram Graph API",
    description: "Buscar dados REAIS de perfis públicos do Instagram via API oficial do Meta",
    status: "planned",
    category: "integration",
    complexity: "complex",
    technical_details: [
      "🔴 Complexidade: COMPLEXA (3-4 semanas)",
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
    complexity: "medium",
    technical_details: [
      "🟡 Complexidade: MÉDIA (3-5 dias)",
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
    complexity: "complex",
    technical_details: [
      "🔴 Complexidade: COMPLEXA (2-3 semanas)",
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
    complexity: "complex",
    technical_details: [
      "🔴 Complexidade: COMPLEXA (2-3 semanas)",
      "⚠️ RISCO: Viola Termos de Serviço do Instagram",
      "Pode resultar em bloqueio de IP ou conta",
      "Alternativas: Puppeteer, Playwright, Selenium",
      "Proxies rotativos necessários para escala",
      "Não recomendado para produção"
    ]
  },
  {
    id: "6",
    title: "Refatoração de Código Claude.ts",
    description: "Reduzir a complexidade e melhorar a legibilidade do arquivo claude.ts",
    status: "planned",
    category: "improvement",
    complexity: "simple",
    technical_details: [
      "🟢 Complexidade: SIMPLES (1 dia)",
      "Dividir funções grandes em menores",
      "Adicionar comentários explicativos",
      "Melhorar a nomenclatura de variáveis e funções",
      "Testes unitários para garantir a funcionalidade"
    ]
  },
  {
    id: "7",
    title: "Melhoria na Arquitetura de Componentes",
    description: "Otimizar a estrutura dos componentes React para melhor performance e manutenibilidade",
    status: "planned",
    category: "improvement",
    complexity: "simple",
    technical_details: [
      "🟢 Complexidade: SIMPLES (2 dias)",
      "Revisar e simplificar a hierarquia de componentes",
      "Utilizar React.memo e useCallback onde apropriado",
      "Implementar lazy loading para componentes não essenciais",
      "Padronizar o uso de props"
    ]
  },
  {
    id: "8",
    title: "Análise de Sentimento com IA",
    description: "Usar Claude para analisar comentários e bio do expert",
    status: "planned",
    category: "feature",
    complexity: "medium",
    technical_details: [
      "🟡 Complexidade: MÉDIA (3-5 dias)",
      "Extrair tom de voz da bio",
      "Analisar sentimento de comentários recentes",
      "Detectar autoridade baseada em linguagem"
    ]
  },
  {
    id: "9",
    title: "Webhook de Notificações",
    description: "Alertas automáticos quando novo expert qualificado é encontrado",
    status: "planned",
    category: "feature",
    complexity: "medium",
    technical_details: [
      "🟡 Complexidade: MÉDIA (4-6 dias)",
      "Integração com Slack/Discord/Telegram",
      "Email via SendGrid/Resend",
      "Push notifications via OneSignal"
    ]
  },
  {
    id: "10",
    title: "CRM de Leads Qualificados",
    description: "Sistema de gestão de relacionamento com experts prospectados",
    status: "planned",
    category: "feature",
    complexity: "complex",
    technical_details: [
      "🔴 Complexidade: COMPLEXA (2-3 semanas)",
      "Cadastro automático de leads após análise",
      "Status do funil: Novo → Contato Inicial → Reunião → Proposta → Fechado",
      "Histórico completo de interações",
      "Tags personalizadas (Urgente, VIP, Retornar em X dias)",
      "Integração com email para envio de propostas"
    ]
  },
  {
    id: "11",
    title: "Sequência de Emails Automatizada",
    description: "Cadência de follow-up automático para nurturing de leads",
    status: "planned",
    category: "feature",
    complexity: "medium",
    technical_details: [
      "🟡 Complexidade: MÉDIA (5-7 dias)",
      "Template de email personalizado por nicho",
      "Sequência: D0 (introdução) → D3 (case) → D7 (proposta)",
      "Rastreamento de abertura e cliques",
      "Integração com SendGrid/Resend/Brevo",
      "Pausa automática se lead responder"
    ]
  },
  {
    id: "12",
    title: "Agendamento de Reuniões",
    description: "Integração com calendário para agendamento automático de demos",
    status: "planned",
    category: "feature",
    complexity: "medium",
    technical_details: [
      "🟡 Complexidade: MÉDIA (3-5 dias)",
      "Integração com Google Calendar/Cal.com",
      "Link personalizado de agendamento no email",
      "Lembretes automáticos (24h e 1h antes)",
      "Sync bidirecional com CRM",
      "Timezone automático do prospect"
    ]
  },
  {
    id: "13",
    title: "Pipeline de Vendas Visual",
    description: "Dashboard Kanban para gestão visual do funil comercial",
    status: "planned",
    category: "feature",
    complexity: "complex",
    technical_details: [
      "🔴 Complexidade: COMPLEXA (2-3 semanas)",
      "Drag-and-drop entre estágios",
      "Métricas: Taxa de conversão por etapa",
      "Tempo médio em cada estágio",
      "Valor estimado do pipeline (forecast)",
      "Filtros por nicho, score, período"
    ]
  },
  {
    id: "14",
    title: "Gerador de Propostas Comerciais",
    description: "Templates de proposta personalizados por nicho com IA",
    status: "planned",
    category: "feature",
    complexity: "medium",
    technical_details: [
      "🟡 Complexidade: MÉDIA (5-7 dias)",
      "Claude gera proposta baseada no perfil do expert",
      "Calcula ROI estimado (com base em seguidores)",
      "Exporta em PDF profissional",
      "Versionamento de propostas",
      "Assinatura digital integrada (DocuSign)"
    ]
  },
  {
    id: "15",
    title: "Automação de Contratos",
    description: "Fluxo completo de assinatura e gestão de contratos",
    status: "planned",
    category: "feature",
    complexity: "complex",
    technical_details: [
      "🔴 Complexidade: COMPLEXA (1-2 semanas)",
      "Template de contrato editável",
      "Integração com DocuSign/PandaDoc",
      "Notificação de assinatura pendente",
      "Armazenamento seguro de contratos assinados",
      "Vencimento e renovação automática"
    ]
  },
  {
    id: "16",
    title: "Sistema de Comissionamento",
    description: "Controle de comissões da equipe de vendas",
    status: "planned",
    category: "feature",
    complexity: "medium",
    technical_details: [
      "🟡 Complexidade: MÉDIA (4-6 dias)",
      "Cálculo automático de comissão por fechamento",
      "Regras personalizáveis (% sobre valor, tiering)",
      "Dashboard de performance individual",
      "Exportação de relatório para RH/Financeiro",
      "Integração com ferramentas de pagamento"
    ]
  },
  {
    id: "17",
    title: "Integração com WhatsApp Business",
    description: "Contato direto com leads via WhatsApp automatizado",
    status: "planned",
    category: "integration",
    complexity: "complex",
    technical_details: [
      "🔴 Complexidade: COMPLEXA (2-3 semanas)",
      "API oficial do WhatsApp Business",
      "Templates de mensagem pré-aprovados",
      "Envio em massa (respeitando limites)",
      "Chatbot para qualificação inicial",
      "Histórico de conversas integrado ao CRM"
    ]
  },
  {
    id: "18",
    title: "Análise Preditiva de Fechamento",
    description: "IA prevê probabilidade de conversão de cada lead",
    status: "planned",
    category: "feature",
    complexity: "complex",
    technical_details: [
      "🔴 Complexidade: COMPLEXA (3-4 semanas)",
      "Machine Learning com histórico de vendas",
      "Score preditivo (0-100%) de fechamento",
      "Sugestão de melhor momento para contato",
      "Identificação de leads 'frios' para remarketing",
      "Dashboard de leads com maior probabilidade"
    ]
  },
  {
    id: "19",
    title: "Sistema de Tarefas e Follow-ups",
    description: "Gestão de ações comerciais com lembretes inteligentes",
    status: "planned",
    category: "feature",
    complexity: "medium",
    technical_details: [
      "🟡 Complexidade: MÉDIA (4-6 dias)",
      "Tarefas automáticas (ex: 'Ligar em 3 dias')",
      "Lembretes via email/push/Slack",
      "Integração com calendário",
      "Priorização baseada em score do lead",
      "Reatribuição automática se não cumprida"
    ]
  }
];

type StatusFilter = "all" | "completed" | "in_progress" | "planned";
type ComplexityFilter = "all" | "simple" | "medium" | "complex";
type CategoryFilter = "all" | "feature" | "integration" | "improvement";

export default function Roadmap() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [complexityFilter, setComplexityFilter] = useState<ComplexityFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [quickWinsMode, setQuickWinsMode] = useState(false);

  const counts = useMemo(() => {
    const simple = roadmapItems.filter(i => i.complexity === "simple" && i.status !== "completed").length;
    const medium = roadmapItems.filter(i => i.complexity === "medium" && i.status !== "completed").length;
    const complex = roadmapItems.filter(i => i.complexity === "complex" && i.status !== "completed").length;
    const completed = roadmapItems.filter(i => i.status === "completed").length;
    const inProgress = roadmapItems.filter(i => i.status === "in_progress").length;
    const planned = roadmapItems.filter(i => i.status === "planned").length;
    return { simple, medium, complex, completed, inProgress, planned, total: roadmapItems.length };
  }, []);

  const filteredItems = useMemo(() => {
    let items = [...roadmapItems];

    if (quickWinsMode) {
      items = items.filter(i => i.complexity === "simple" && i.status !== "completed");
    } else {
      if (statusFilter !== "all") {
        items = items.filter(i => i.status === statusFilter);
      }
      if (complexityFilter !== "all") {
        items = items.filter(i => i.complexity === complexityFilter);
      }
      if (categoryFilter !== "all") {
        items = items.filter(i => i.category === categoryFilter);
      }
    }

    items.sort((a, b) => {
      const statusOrder = { in_progress: 0, planned: 1, completed: 2 };
      const complexityOrder = { simple: 0, medium: 1, complex: 2 };
      
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return complexityOrder[a.complexity] - complexityOrder[b.complexity];
    });

    return items;
  }, [statusFilter, complexityFilter, categoryFilter, quickWinsMode]);

  const hasActiveFilters = statusFilter !== "all" || complexityFilter !== "all" || categoryFilter !== "all" || quickWinsMode;

  const clearFilters = () => {
    setStatusFilter("all");
    setComplexityFilter("all");
    setCategoryFilter("all");
    setQuickWinsMode(false);
  };

  const toggleQuickWins = () => {
    if (quickWinsMode) {
      setQuickWinsMode(false);
    } else {
      setQuickWinsMode(true);
      setStatusFilter("all");
      setComplexityFilter("all");
      setCategoryFilter("all");
    }
  };

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

        {/* Summary Counts */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <div className="bg-card border border-border rounded-lg p-3 text-center" data-testid="count-simple">
            <div className="text-2xl font-bold text-green-400">{counts.simple}</div>
            <div className="text-xs text-muted-foreground">🟢 Simples restantes</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center" data-testid="count-medium">
            <div className="text-2xl font-bold text-yellow-400">{counts.medium}</div>
            <div className="text-xs text-muted-foreground">🟡 Médio restantes</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center" data-testid="count-complex">
            <div className="text-2xl font-bold text-red-400">{counts.complex}</div>
            <div className="text-xs text-muted-foreground">🔴 Complexo restantes</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center" data-testid="count-completed">
            <div className="text-2xl font-bold text-green-500">{counts.completed}</div>
            <div className="text-xs text-muted-foreground">Concluídos</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center" data-testid="count-in-progress">
            <div className="text-2xl font-bold text-yellow-500">{counts.inProgress}</div>
            <div className="text-xs text-muted-foreground">Em Progresso</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center" data-testid="count-planned">
            <div className="text-2xl font-bold text-gray-400">{counts.planned}</div>
            <div className="text-xs text-muted-foreground">Planejados</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros</span>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="ml-auto h-7 px-2 text-xs"
                data-testid="button-clear-filters"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Quick Wins Button */}
            <Button
              variant={quickWinsMode ? "default" : "outline"}
              size="sm"
              onClick={toggleQuickWins}
              className={quickWinsMode ? "bg-green-600 hover:bg-green-700" : ""}
              data-testid="button-quick-wins"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Quick Wins ({counts.simple})
            </Button>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Status:</span>
              {(["all", "in_progress", "planned", "completed"] as StatusFilter[]).map((status) => (
                <Badge
                  key={status}
                  variant={statusFilter === status && !quickWinsMode ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${quickWinsMode ? "opacity-50" : ""}`}
                  onClick={() => !quickWinsMode && setStatusFilter(status)}
                  data-testid={`filter-status-${status}`}
                >
                  {status === "all" ? "Todos" : 
                   status === "completed" ? "Concluído" :
                   status === "in_progress" ? "Em Progresso" : "Planejado"}
                </Badge>
              ))}
            </div>

            {/* Complexity Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Complexidade:</span>
              {(["all", "simple", "medium", "complex"] as ComplexityFilter[]).map((complexity) => (
                <Badge
                  key={complexity}
                  variant={complexityFilter === complexity && !quickWinsMode ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${quickWinsMode ? "opacity-50" : ""}`}
                  onClick={() => !quickWinsMode && setComplexityFilter(complexity)}
                  data-testid={`filter-complexity-${complexity}`}
                >
                  {complexity === "all" ? "Todos" :
                   complexity === "simple" ? "🟢 Simples" :
                   complexity === "medium" ? "🟡 Médio" : "🔴 Complexo"}
                </Badge>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Categoria:</span>
              {(["all", "feature", "integration", "improvement"] as CategoryFilter[]).map((category) => (
                <Badge
                  key={category}
                  variant={categoryFilter === category && !quickWinsMode ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${quickWinsMode ? "opacity-50" : ""}`}
                  onClick={() => !quickWinsMode && setCategoryFilter(category)}
                  data-testid={`filter-category-${category}`}
                >
                  {category === "all" ? "Todos" :
                   category === "feature" ? "Funcionalidade" :
                   category === "integration" ? "Integração" : "Melhoria"}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Mostrando {filteredItems.length} de {counts.total} itens
            {quickWinsMode && <span className="ml-2 text-green-400 font-medium">(Quick Wins)</span>}
          </span>
        </div>

        {/* Roadmap Timeline */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center" data-testid="empty-state">
              <p className="text-muted-foreground">Nenhum item encontrado com os filtros selecionados.</p>
              <Button variant="link" onClick={clearFilters} className="mt-2" data-testid="button-empty-clear-filters">
                Limpar filtros
              </Button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-card border rounded-lg p-6 hover:border-primary/50 transition-colors ${
                  item.complexity === "simple" ? "border-green-500/20" :
                  item.complexity === "medium" ? "border-yellow-500/20" :
                  "border-red-500/20"
                }`}
                data-testid={`roadmap-item-${item.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1">{getStatusIcon(item.status)}</div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
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
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        item.complexity === "simple" ? "bg-green-500/20 text-green-400" :
                        item.complexity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {item.complexity === "simple" ? "🟢 Simples" :
                         item.complexity === "medium" ? "🟡 Médio" : "🔴 Complexo"}
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
            ))
          )}
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
            <p className="text-xs text-muted-foreground">Refatoração Claude.ts, Arquitetura de Componentes</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
