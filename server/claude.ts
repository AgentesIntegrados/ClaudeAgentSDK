import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

const analyzeExpertFit = tool(
  'analyze_expert_fit',
  'Analisa o perfil de um expert/mentor que vende cursos high ticket para verificar se ele se encaixa no ICP. Avalia: infoproduto estruturado, nicho definido (foco EXCLUSIVO em médicos), comunidade paga (mín 500 membros), ticket médio (acima de R$1.000), autoridade no nicho, estrutura de vendas.',
  {
    instagram_handle: z.string().describe("O @ do Instagram do expert/mentor (ex: '@nandamac' ou 'nandamac')"),
    criteria: z.array(z.string()).optional().describe("Critérios adicionais de qualificação")
  },
  async (args) => {
    const timestamp = new Date().toISOString();
    const handle = (args.instagram_handle || "unknown").replace('@', '');
    const criteria = args.criteria || [
      "Infoproduto estruturado",
      "Nicho definido (médicos)",
      "Comunidade paga 500+",
      "Ticket > R$1.000",
      "Autoridade no nicho",
      "Estrutura de vendas"
    ];
    
    // ⚠️ SIMULAÇÃO - Em produção, substituir por integração real com:
    // - Instagram Graph API (requer aprovação Meta)
    // - Social Blade API
    // - HypeAuditor API
    // - Scraping ético de perfis públicos
    // Este é apenas um MOCK para demonstração do fluxo do agente
    
    const expertData: Record<string, { 
      nome: string;
      nicho: string;
      publicoAlvo: string;
      seguidores: number;
      infoprodutos: { nome: string; tipo: string; ticketMedio: string }[];
      comunidade: { nome: string; membros: number } | null;
      autoridade: string[];
      estruturaVendas: string[];
      score: number;
    }> = {
      "nandamac": {
        nome: "Nanda Mac Dowell",
        nicho: "Vendas High Ticket para Médicos",
        publicoAlvo: "Médicos",
        seguidores: 180000,
        infoprodutos: [
          { nome: "Consultório High Ticket", tipo: "Curso com 7 módulos", ticketMedio: "R$ 2.997" },
          { nome: "Imersão 10K", tipo: "Evento presencial", ticketMedio: "R$ 4.500" },
          { nome: "Mentoria VIP", tipo: "Acompanhamento individual", ticketMedio: "R$ 15.000" }
        ],
        comunidade: { nome: "Comunidade Consultório High Ticket", membros: 3000 },
        autoridade: ["Pioneira no conceito High Ticket para saúde no Brasil", "Mais de 3000 consultórios transformados", "Palestras em congressos médicos"],
        estruturaVendas: ["Página de vendas profissional", "Lista de espera VIP", "Lançamentos estruturados", "Funil de aquecimento WhatsApp"],
        score: 98
      },
      "naborges": {
        nome: "Natanael Borges",
        nicho: "Vendas High Ticket",
        publicoAlvo: "Empreendedores e consultores (NÃO médicos)",
        seguidores: 520000,
        infoprodutos: [
          { nome: "Método Vendas High Ticket", tipo: "Curso online", ticketMedio: "R$ 1.997" },
          { nome: "Mentoria Closer", tipo: "Mentoria em grupo", ticketMedio: "R$ 8.000" },
          { nome: "Imersão Presencial", tipo: "Evento 3 dias", ticketMedio: "R$ 5.000" }
        ],
        comunidade: { nome: "Comunidade Closers", membros: 2500 },
        autoridade: ["Referência em vendas high ticket no Brasil", "Podcast sobre vendas", "Lives semanais"],
        estruturaVendas: ["Página de vendas", "Webinários de lançamento", "Equipe de closers"],
        score: 45 // REDUZIDO: Não atende médicos (ICP)
      },
      "ladeirarodrigo": {
        nome: "Rodrigo Ladeira",
        nicho: "Marketing Digital e Lançamentos",
        publicoAlvo: "Infoprodutores e experts digitais (NÃO médicos)",
        seguidores: 380000,
        infoprodutos: [
          { nome: "Fórmula de Lançamento Adaptada", tipo: "Curso completo", ticketMedio: "R$ 2.497" },
          { nome: "Mentoria Scale", tipo: "Mentoria para escalar", ticketMedio: "R$ 12.000" }
        ],
        comunidade: { nome: "Comunidade Lançadores", membros: 1800 },
        autoridade: ["Especialista em lançamentos digitais", "Cases de 7 dígitos", "Participação em podcasts"],
        estruturaVendas: ["Funil perpétuo", "Lançamentos semente", "VSL otimizada"],
        score: 42 // REDUZIDO: Não atende médicos (ICP)
      },
      "natanaelliveira": {
        nome: "Natanael Oliveira",
        nicho: "Negócios Digitais e Infoprodutos",
        publicoAlvo: "Empreendedores digitais (NÃO médicos)",
        seguidores: 450000,
        infoprodutos: [
          { nome: "Máquina de Vendas Online", tipo: "Curso + Comunidade", ticketMedio: "R$ 1.497" },
          { nome: "Mentoria Diamante", tipo: "Acompanhamento 6 meses", ticketMedio: "R$ 10.000" }
        ],
        comunidade: { nome: "Comunidade MVO", membros: 5000 },
        autoridade: ["Um dos pioneiros do marketing digital no Brasil", "Autor de livros", "Milhões em vendas"],
        estruturaVendas: ["Evergreen automatizado", "Lançamentos anuais", "Página de vendas otimizada"],
        score: 43 // REDUZIDO: Não atende médicos (ICP)
      },
      "joaofinancas": {
        nome: "João Victorino",
        nicho: "Educação Financeira",
        publicoAlvo: "Profissionais em geral (NÃO médicos)",
        seguidores: 290000,
        infoprodutos: [
          { nome: "Método Investidor Inteligente", tipo: "Curso online", ticketMedio: "R$ 997" },
          { nome: "Mentoria Liberdade Financeira", tipo: "Mentoria em grupo", ticketMedio: "R$ 3.500" }
        ],
        comunidade: { nome: "Comunidade Investidores", membros: 1200 },
        autoridade: ["Certificado pela ANBIMA", "Colunista de portais financeiros", "Podcast semanal"],
        estruturaVendas: ["Webinários de venda", "Lista VIP", "Funil de nutrição"],
        score: 40 // REDUZIDO: Não atende médicos (ICP)
      },
      "drapatriciacaldas": {
        nome: "Dra. Patricia Caldas",
        nicho: "Marketing Médico",
        publicoAlvo: "Médicos e profissionais de saúde",
        seguidores: 95000,
        infoprodutos: [
          { nome: "Marketing Médico na Prática", tipo: "Curso com módulos", ticketMedio: "R$ 1.997" },
          { nome: "Mentoria Consultório Cheio", tipo: "Mentoria 4 meses", ticketMedio: "R$ 6.000" }
        ],
        comunidade: { nome: "Grupo Médicos Digitais", membros: 800 },
        autoridade: ["Médica e especialista em marketing", "Palestrante em congressos", "Cases de sucesso documentados"],
        estruturaVendas: ["Página de vendas", "Lançamentos via Instagram", "Lista de espera"],
        score: 88
      },
      "drleandrotwin": {
        nome: "Dr. Leandro Twin",
        nicho: "Saúde, Fitness e Medicina Esportiva",
        publicoAlvo: "Médicos e profissionais de fitness",
        seguidores: 2800000,
        infoprodutos: [
          { nome: "Curso Prescrição do Exercício", tipo: "Curso para profissionais", ticketMedio: "R$ 1.497" },
          { nome: "Congresso Twin", tipo: "Evento presencial", ticketMedio: "R$ 800" }
        ],
        comunidade: { nome: "Comunidade Twin Science", membros: 4500 },
        autoridade: ["Médico referência em saúde no YouTube", "Milhões de seguidores", "Autor de livros"],
        estruturaVendas: ["Página de vendas", "Lançamentos estruturados", "Parcerias estratégicas"],
        score: 91
      },
      "davisoncarvalho": {
        nome: "Davison Carvalho",
        nicho: "Vendas e Modelo de Negócios para Médicos",
        publicoAlvo: "Médicos e profissionais da saúde",
        seguidores: 21000,
        infoprodutos: [
          { nome: "DOC4U Mentoria", tipo: "Mentoria estruturada para médicos", ticketMedio: "R$ 5.000" },
          { nome: "Programa de Liderança Médica", tipo: "Curso com módulos", ticketMedio: "R$ 2.997" }
        ],
        comunidade: { nome: "Comunidade DOC4U", membros: 800 },
        autoridade: ["Cofundador e CEO @doc4u.mentoria", "Especialista em vendas para médicos", "Mentor de profissionais de saúde"],
        estruturaVendas: ["Mentoria estruturada", "Página de vendas", "Funil de captação"],
        score: 88
      },
      "drfredericomaia": {
        nome: "Dr. Frederico Maia",
        nicho: "Endocrinologia e Mentoria para Médicos",
        publicoAlvo: "Médicos",
        seguidores: 38800,
        infoprodutos: [
          { nome: "Mentoria Médica", tipo: "Mentoria para médicos", ticketMedio: "R$ 3.500" },
          { nome: "Programa de Desenvolvimento Médico", tipo: "Curso estruturado", ticketMedio: "R$ 2.500" }
        ],
        comunidade: { nome: "Comunidade Médicos de Elite", membros: 600 },
        autoridade: ["Endocrinologista", "Mentor de médicos", "Palestrante em congressos médicos"],
        estruturaVendas: ["Mentoria estruturada", "Página de vendas", "Funil de nutrição"],
        score: 88
      }
    };

    const expert = expertData[handle.toLowerCase()] || {
      nome: handle,
      nicho: "Não identificado",
      publicoAlvo: "Não identificado",
      seguidores: Math.floor(Math.random() * 20000) + 5000,
      infoprodutos: [],
      comunidade: null,
      autoridade: [],
      estruturaVendas: [],
      score: Math.floor(Math.random() * 30) + 30
    };

    const formatFollowers = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
      return n.toString();
    };

    const qualificationReasons: string[] = [];
    const riskFactors: string[] = [];

    if (expert.infoprodutos.length > 0) {
      const hasHighTicket = expert.infoprodutos.some(p => {
        const price = parseInt(p.ticketMedio.replace(/\D/g, ''));
        return price >= 1000;
      });
      if (hasHighTicket) {
        qualificationReasons.push(`Infoproduto estruturado HIGH TICKET: ${expert.infoprodutos.map(p => `${p.nome} (${p.ticketMedio})`).join(", ")}`);
      } else {
        riskFactors.push("Ticket médio abaixo de R$1.000");
      }
    } else {
      riskFactors.push("Sem infoprodutos estruturados identificados");
    }

    // Verifica se o público-alvo é EXCLUSIVAMENTE médicos (critério rígido do ICP)
    const isMedicalTarget = expert.publicoAlvo.toLowerCase().includes("médico");
    const isNonMedicalTarget = expert.publicoAlvo.toLowerCase().includes("empreendedor") ||
                               expert.publicoAlvo.toLowerCase().includes("digital") ||
                               expert.publicoAlvo.toLowerCase().includes("geral") ||
                               expert.publicoAlvo.toLowerCase().includes("consultor");
    
    if (isMedicalTarget && !isNonMedicalTarget) {
      qualificationReasons.push(`✅ Nicho IDEAL: Atende EXCLUSIVAMENTE médicos - ${expert.publicoAlvo}`);
    } else if (isNonMedicalTarget) {
      riskFactors.push(`❌ DESQUALIFICADO: Público-alvo NÃO é médico - ${expert.publicoAlvo}`);
      // Reduz drasticamente o score se não atende médicos
      expert.score = Math.min(expert.score, 45);
    } else if (expert.nicho !== "Não identificado") {
      riskFactors.push(`⚠️ Público-alvo não claramente definido como médicos: ${expert.publicoAlvo}`);
    } else {
      riskFactors.push("❌ Nicho não definido claramente");
    }

    if (expert.comunidade && expert.comunidade.membros >= 500) {
      qualificationReasons.push(`Comunidade paga ativa: ${expert.comunidade.nome} (${expert.comunidade.membros.toLocaleString('pt-BR')} membros)`);
    } else if (expert.comunidade) {
      riskFactors.push(`Comunidade pequena: apenas ${expert.comunidade.membros} membros (mínimo 500)`);
    } else {
      riskFactors.push("Sem comunidade paga identificada");
    }

    if (expert.autoridade.length > 0) {
      qualificationReasons.push(`Autoridade comprovada: ${expert.autoridade.join("; ")}`);
    } else {
      riskFactors.push("Sem indicadores de autoridade no nicho");
    }

    if (expert.estruturaVendas.length >= 2) {
      qualificationReasons.push(`Estrutura de vendas profissional: ${expert.estruturaVendas.join(", ")}`);
    } else {
      riskFactors.push("Estrutura de vendas básica ou inexistente");
    }

    qualificationReasons.push(`Base de seguidores: ${formatFollowers(expert.seguidores)}`);

    const result = {
      _metadata: {
        source: "simulated",
        note: "Dados de demonstração. Em produção, conectar a APIs como Social Blade, HypeAuditor, e análise manual de perfis."
      },
      timestamp,
      instagram_handle: `@${handle}`,
      analysis: {
        score: expert.score,
        qualified: expert.score >= 70,
        nome: expert.nome,
        nicho: expert.nicho,
        publicoAlvo: expert.publicoAlvo,
        seguidores: expert.seguidores,
        seguidores_formatado: formatFollowers(expert.seguidores),
        infoprodutos: expert.infoprodutos,
        comunidade: expert.comunidade,
        autoridade: expert.autoridade,
        estruturaVendas: expert.estruturaVendas,
        criteria_checked: criteria
      },
      match_reasons: qualificationReasons,
      risk_factors: riskFactors,
      recommendation: expert.score >= 70 
        ? "QUALIFICADO - Expert High Ticket ideal para parceria" 
        : "NÃO QUALIFICADO - Não atende critérios de expert high ticket"
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }]
    };
  }
);

const getExpertContact = tool(
  'get_expert_contact',
  'Busca informações de contato de um expert/mentor para abordagem comercial. Retorna email comercial, assessoria, e sugestões de abordagem personalizada para parcerias high ticket.',
  {
    instagram_handle: z.string().describe("O @ do Instagram do expert/mentor"),
    approach_type: z.enum(["parceria", "afiliado", "licenciamento", "collab", "whitelabel"]).optional().describe("Tipo de abordagem pretendida")
  },
  async (args) => {
    const timestamp = new Date().toISOString();
    const handle = (args.instagram_handle || "unknown").replace('@', '');
    const approachType = args.approach_type || "parceria";
    
    const contactData: Record<string, { 
      nome: string;
      email_comercial: string; 
      assessoria: string | null;
      whatsapp_comercial: string | null;
      tempo_resposta: string;
      melhor_abordagem: string;
      gatilhos: string[];
    }> = {
      "nandamac": {
        nome: "Nanda Mac Dowell",
        email_comercial: "parcerias@nandamac.com",
        assessoria: "Equipe Consultório High Ticket",
        whatsapp_comercial: null,
        tempo_resposta: "5-7 dias úteis",
        melhor_abordagem: "Email com proposta que agregue valor para profissionais de saúde",
        gatilhos: ["Foco em resultados para médicos", "Mencionar cases do nicho saúde", "Propor algo que complemente o método dela"]
      },
      "naborges": {
        nome: "Natanael Borges",
        email_comercial: "comercial@naborges.com.br",
        assessoria: "Equipe NB",
        whatsapp_comercial: null,
        tempo_resposta: "3-5 dias úteis",
        melhor_abordagem: "Proposta direta com números e resultados",
        gatilhos: ["Falar em ROI e conversão", "Cases de vendas high ticket", "Proposta objetiva e profissional"]
      },
      "ladeirarodrigo": {
        nome: "Rodrigo Ladeira",
        email_comercial: "contato@rodrigoladeira.com.br",
        assessoria: null,
        whatsapp_comercial: "(11) 9xxxx-xxxx",
        tempo_resposta: "3-5 dias úteis",
        melhor_abordagem: "Email ou DM com case de lançamento",
        gatilhos: ["Resultados de lançamentos", "Métricas de conversão", "Proposta de parceria em lançamento"]
      },
      "natanaelliveira": {
        nome: "Natanael Oliveira",
        email_comercial: "parcerias@natanaeloliveira.com.br",
        assessoria: "Equipe MVO",
        whatsapp_comercial: null,
        tempo_resposta: "5-7 dias úteis",
        melhor_abordagem: "Email formal com proposta estruturada",
        gatilhos: ["Histórico no mercado digital", "Complementariedade de produtos", "Potencial de escala"]
      },
      "joaofinancas": {
        nome: "João Victorino",
        email_comercial: "contato@joaofinancas.com.br",
        assessoria: null,
        whatsapp_comercial: "(11) 9xxxx-xxxx",
        tempo_resposta: "2-4 dias úteis",
        melhor_abordagem: "DM ou email direto",
        gatilhos: ["Educação financeira", "Valor para a audiência", "Proposta clara de parceria"]
      },
      "drapatriciacaldas": {
        nome: "Dra. Patricia Caldas",
        email_comercial: "comercial@drapatriciacaldas.com.br",
        assessoria: null,
        whatsapp_comercial: "(11) 9xxxx-xxxx",
        tempo_resposta: "2-3 dias úteis",
        melhor_abordagem: "Email ou DM mencionando nicho médico",
        gatilhos: ["Soluções para médicos", "Marketing ético", "Cases de consultórios"]
      },
      "drleandrotwin": {
        nome: "Dr. Leandro Twin",
        email_comercial: "comercial@leandrotwin.com.br",
        assessoria: "Equipe Twin",
        whatsapp_comercial: null,
        tempo_resposta: "7-14 dias úteis",
        melhor_abordagem: "Apenas via assessoria com proposta robusta",
        gatilhos: ["Ciência e evidências", "Público fitness/saúde", "Proposta de grande impacto"]
      },
      "davisoncarvalho": {
        nome: "Davison Carvalho",
        email_comercial: "contato@doc4u.com.br",
        assessoria: "Equipe DOC4U",
        whatsapp_comercial: null,
        tempo_resposta: "2-4 dias úteis",
        melhor_abordagem: "Email ou DM mencionando nicho médico e modelo de negócios",
        gatilhos: ["Soluções para médicos", "Vendas high ticket para saúde", "Parcerias com foco em profissionais de saúde"]
      },
      "drfredericomaia": {
        nome: "Dr. Frederico Maia",
        email_comercial: "contato@drfredericomaia.com.br",
        assessoria: null,
        whatsapp_comercial: "(11) 9xxxx-xxxx",
        tempo_resposta: "3-5 dias úteis",
        melhor_abordagem: "Email ou DM mencionando endocrinologia e desenvolvimento médico",
        gatilhos: ["Mentoria para médicos", "Desenvolvimento profissional médico", "Parcerias com foco em endocrinologia"]
      }
    };

    const contact = contactData[handle.toLowerCase()] || {
      nome: handle,
      email_comercial: `contato@${handle.toLowerCase()}.com.br`,
      assessoria: null,
      whatsapp_comercial: null,
      tempo_resposta: "Variável",
      melhor_abordagem: "DM no Instagram ou email",
      gatilhos: ["Proposta de valor clara", "Alinhamento com o nicho", "Resultados comprovados"]
    };

    const approachSuggestions: Record<string, string[]> = {
      parceria: [
        "Apresente como sua solução complementa o produto dele",
        "Mostre cases de resultados com experts similares",
        "Proponha modelo ganha-ganha com métricas claras",
        "Destaque o benefício para a audiência dele"
      ],
      afiliado: [
        "Apresente comissões atrativas (mínimo 30% para high ticket)",
        "Ofereça materiais de divulgação prontos e testados",
        "Mostre conversão média e ticket médio",
        "Proponha bônus exclusivo para a audiência dele"
      ],
      licenciamento: [
        "Apresente modelo de royalties claro",
        "Mostre potencial de escala sem esforço operacional dele",
        "Detalhe todo suporte que você oferece",
        "Inclua projeção conservadora de faturamento"
      ],
      collab: [
        "Proponha conteúdo que una as duas expertises",
        "Sugira formatos: live conjunta, podcast, workshop",
        "Mostre como as audiências se complementam",
        "Seja flexível em datas e formatos"
      ],
      whitelabel: [
        "Apresente a solução pronta para ele vender como dele",
        "Mostre margem de lucro e precificação sugerida",
        "Ofereça suporte técnico e atualizações",
        "Proponha exclusividade no nicho se possível"
      ]
    };

    const result = {
      _metadata: {
        source: "simulated",
        note: "Dados de demonstração. Em produção, conectar a bases de contatos verificados e CRM."
      },
      timestamp,
      instagram_handle: `@${handle}`,
      approach_type: approachType,
      contact_info: {
        nome: contact.nome,
        email_comercial: contact.email_comercial,
        assessoria: contact.assessoria,
        whatsapp_comercial: contact.whatsapp_comercial,
        tempo_resposta: contact.tempo_resposta,
        melhor_canal: contact.melhor_abordagem,
        gatilhos_importantes: contact.gatilhos,
        confidence: contactData[handle.toLowerCase()] ? "Alta" : "Média"
      },
      outreach_suggestions: approachSuggestions[approachType] || approachSuggestions.parceria,
      template_abordagem: `Olá ${contact.nome}! Acompanho seu trabalho e admiro como você [mencionar algo específico do trabalho dele]. Tenho uma proposta de ${approachType} que acredito ser muito interessante para sua audiência de [nicho]. Posso enviar os detalhes?`
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }]
    };
  }
);

const sdrMcpServer = createSdkMcpServer({
  name: 'sdr',
  version: '1.0.0',
  tools: [analyzeExpertFit, getExpertContact]
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ToolUseResult {
  tool: string;
  input: string;
  status: "completed";
  result: Record<string, unknown>;
}

export interface AgentResponse {
  content: string;
  toolUse?: ToolUseResult;
  sessionId?: string;
}

interface HookContext {
  toolName: string;
  input: Record<string, unknown>;
  timestamp: string;
}

type HookCallback = (context: HookContext) => Promise<void>;

export interface AgentHooks {
  preToolUse?: HookCallback[];
  postToolUse?: HookCallback[];
  sessionStart?: (() => Promise<void>)[];
}

interface SessionState {
  sessionId: string;
  conversationHistory: ChatMessage[];
  lastActivity: Date;
}

const sessions = new Map<string, SessionState>();

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function getSession(sessionId: string): SessionState | undefined {
  return sessions.get(sessionId);
}

export function createSession(): string {
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    sessionId,
    conversationHistory: [],
    lastActivity: new Date()
  });
  return sessionId;
}

export function forkSession(originalSessionId: string): string | null {
  const original = sessions.get(originalSessionId);
  if (!original) return null;
  
  const newSessionId = generateSessionId();
  sessions.set(newSessionId, {
    sessionId: newSessionId,
    conversationHistory: [...original.conversationHistory],
    lastActivity: new Date()
  });
  return newSessionId;
}

export interface SubAgentDefinition {
  description: string;
  prompt: string;
  tools?: string[];
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
}

const defaultSubAgents: Record<string, SubAgentDefinition> = {
  researcher: {
    description: 'Pesquisa e analisa perfis de experts/mentores high ticket',
    prompt: 'Você é um pesquisador especializado em análise de experts e mentores brasileiros que vendem infoprodutos high ticket. Foco especial em experts que vendem para profissionais de saúde (médicos, dentistas, etc). Utilize as ferramentas para avaliar infoprodutos, comunidade, ticket médio e autoridade.',
    tools: ['mcp__sdr__analyze_expert_fit'],
    model: 'sonnet'
  },
  outreach_specialist: {
    description: 'Especialista em abordagem e contato com experts high ticket',
    prompt: 'Você é um especialista em outreach para experts e mentores high ticket. Seu objetivo é identificar os melhores canais de contato e sugerir abordagens personalizadas para parcerias, afiliação ou licenciamento.',
    tools: ['mcp__sdr__get_expert_contact'],
    model: 'sonnet'
  }
};

export async function processAgentMessage(
  userMessage: string,
  systemPrompt: string,
  conversationHistory: ChatMessage[],
  model?: string,
  customApiKey?: string | null,
  options?: {
    sessionId?: string;
    forkSession?: boolean;
    hooks?: AgentHooks;
    subAgents?: Record<string, SubAgentDefinition>;
  }
): Promise<AgentResponse> {
  
  let activeSessionId = options?.sessionId;
  
  if (options?.sessionId && options?.forkSession) {
    activeSessionId = forkSession(options.sessionId) || createSession();
  } else if (!activeSessionId) {
    activeSessionId = createSession();
  }
  
  const session = sessions.get(activeSessionId);
  if (session) {
    session.lastActivity = new Date();
  }

  if (options?.hooks?.sessionStart) {
    for (const hook of options.hooks.sessionStart) {
      await hook();
    }
  }

  const agentSubAgents = options?.subAgents || defaultSubAgents;

  type AgentModel = 'sonnet' | 'opus' | 'haiku' | 'inherit' | undefined;
  const agents: Record<string, { description: string; prompt: string; tools?: string[]; model?: AgentModel }> = {};
  for (const [name, def] of Object.entries(agentSubAgents)) {
    agents[name] = {
      description: def.description,
      prompt: def.prompt,
      tools: def.tools,
      model: def.model as AgentModel
    };
  }

  if (options?.hooks?.preToolUse) {
    for (const hook of options.hooks.preToolUse) {
      console.log('[Hook] PreToolUse callback registered');
    }
  }
  
  if (options?.hooks?.postToolUse) {
    for (const hook of options.hooks.postToolUse) {
      console.log('[Hook] PostToolUse callback registered');
    }
  }

  const fullPrompt = conversationHistory.length > 0
    ? `${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\nuser: ${userMessage}`
    : userMessage;

  try {
    let resultContent = "";
    let toolUseResult: ToolUseResult | undefined;
    let resultSessionId = activeSessionId;

    const queryOptions = {
      model: model || DEFAULT_MODEL,
      systemPrompt: systemPrompt,
      mcpServers: { sdr: sdrMcpServer },
      maxTurns: 10,
      permissionMode: 'bypassPermissions' as const,
      agents: agents,
      ...(customApiKey ? { env: { ANTHROPIC_API_KEY: customApiKey } } : {})
    };

    let pendingToolUse: { id: string; name: string; input: Record<string, unknown> } | undefined;
    const toolResults: Map<string, Record<string, unknown>> = new Map();

    for await (const message of query({ prompt: fullPrompt, options: queryOptions })) {
      if (message.type === 'assistant') {
        const assistantMessage = message.message;
        if (assistantMessage.content) {
          for (const block of assistantMessage.content) {
            if (block.type === 'text') {
              resultContent += block.text;
            } else if (block.type === 'tool_use') {
              const toolId = (block as { id?: string }).id || `tool_${Date.now()}`;
              const toolName = block.name;
              const toolInput = block.input as Record<string, unknown>;
              
              pendingToolUse = { id: toolId, name: toolName, input: toolInput };
            }
          }
        }
        resultSessionId = message.session_id;
      } else if (message.type === 'user') {
        const userMessage = message.message;
        if (userMessage.content && Array.isArray(userMessage.content)) {
          for (const block of userMessage.content) {
            if (block.type === 'tool_result') {
              const toolResultBlock = block as { tool_use_id?: string; content?: unknown };
              const toolId = toolResultBlock.tool_use_id;
              if (toolId && toolResultBlock.content) {
                let parsedResult: Record<string, unknown>;
                
                if (typeof toolResultBlock.content === 'string') {
                  try {
                    parsedResult = JSON.parse(toolResultBlock.content);
                  } catch {
                    parsedResult = { raw: toolResultBlock.content };
                  }
                } else if (Array.isArray(toolResultBlock.content)) {
                  const textBlock = toolResultBlock.content.find(
                    (c: unknown) => typeof c === 'object' && c !== null && 'type' in c && (c as { type: string }).type === 'text'
                  ) as { text?: string } | undefined;
                  
                  if (textBlock?.text) {
                    try {
                      parsedResult = JSON.parse(textBlock.text);
                    } catch {
                      parsedResult = { raw: textBlock.text };
                    }
                  } else {
                    parsedResult = { raw: toolResultBlock.content };
                  }
                } else {
                  parsedResult = toolResultBlock.content as Record<string, unknown>;
                }
                
                toolResults.set(toolId, parsedResult);
                
                if (pendingToolUse && pendingToolUse.id === toolId) {
                  const mcpToolName = pendingToolUse.name.startsWith('mcp__') 
                    ? pendingToolUse.name 
                    : `mcp__sdr__${pendingToolUse.name}`;
                  
                  toolUseResult = {
                    tool: mcpToolName,
                    input: JSON.stringify(pendingToolUse.input, null, 2),
                    status: "completed",
                    result: parsedResult
                  };
                }
              }
            }
          }
        }
      } else if (message.type === 'result') {
        if (message.subtype === 'success') {
          if (!resultContent && message.result) {
            resultContent = message.result;
          }
        }
        resultSessionId = message.session_id;
      }
    }
    
    if (pendingToolUse && !toolUseResult) {
      const mcpToolName = pendingToolUse.name.startsWith('mcp__') 
        ? pendingToolUse.name 
        : `mcp__sdr__${pendingToolUse.name}`;
      
      const storedResult = toolResults.get(pendingToolUse.id);
      toolUseResult = {
        tool: mcpToolName,
        input: JSON.stringify(pendingToolUse.input, null, 2),
        status: "completed",
        result: storedResult || pendingToolUse.input
      };
    }

    if (session) {
      session.conversationHistory.push(
        { role: "user", content: userMessage },
        { role: "assistant", content: resultContent }
      );
    }

    return {
      content: resultContent || "Análise concluída.",
      toolUse: toolUseResult,
      sessionId: resultSessionId
    };

  } catch (error) {
    console.error("Claude Agent SDK error:", error);
    if (error instanceof Error) {
      throw new Error(`Erro no Claude Agent SDK: ${error.message}`);
    }
    throw new Error("Erro desconhecido ao processar mensagem");
  }
}

export { defaultSubAgents };
