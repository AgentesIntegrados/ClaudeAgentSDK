import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

const analyzeInfluencerFit = tool(
  'analyze_influencer_fit',
  'Analisa o perfil de um influenciador para verificar se ele se encaixa no ICP (Perfil de Cliente Ideal). Avalia: número de seguidores (mín 10k), taxa de engajamento, se vende infoprodutos, nicho de atuação. Retorna score de qualificação e motivos.',
  {
    instagram_handle: z.string().describe("O @ do Instagram do influenciador (ex: '@fulano' ou 'fulano')"),
    criteria: z.array(z.string()).optional().describe("Critérios adicionais de qualificação (ex: ['nicho fitness', 'engajamento alto', 'vende curso'])")
  },
  async (args) => {
    const timestamp = new Date().toISOString();
    const handle = (args.instagram_handle || "unknown").replace('@', '');
    const criteria = args.criteria || ["Vende infoprodutos", "Engajamento > 3%", "Seguidores > 10k"];
    
    const influencerData: Record<string, { 
      nome: string;
      nicho: string; 
      seguidores: number; 
      engajamento: number; 
      infoprodutos: string[];
      plataformas: string[];
      score: number 
    }> = {
      "nfranca": {
        nome: "Nathalia França",
        nicho: "Finanças Pessoais",
        seguidores: 2500000,
        engajamento: 4.2,
        infoprodutos: ["Curso Liberdade Financeira", "Mentoria VIP", "Ebook Investimentos"],
        plataformas: ["Instagram", "YouTube", "Hotmart"],
        score: 95
      },
      "virginiaramos": {
        nome: "Virginia Fonseca",
        nicho: "Lifestyle / Maternidade",
        seguidores: 48000000,
        engajamento: 3.8,
        infoprodutos: ["Marca própria WePink"],
        plataformas: ["Instagram", "YouTube", "TikTok"],
        score: 72
      },
      "pfranca": {
        nome: "Pablo Marçal",
        nicho: "Empreendedorismo / Mindset",
        seguidores: 12000000,
        engajamento: 5.1,
        infoprodutos: ["Método IP", "Mentorias em grupo", "Curso de Oratória", "Imersão presencial"],
        plataformas: ["Instagram", "YouTube", "Kiwify"],
        score: 98
      },
      "thalissonsoares": {
        nome: "Thalisson Soares",
        nicho: "Marketing Digital",
        seguidores: 850000,
        engajamento: 4.5,
        infoprodutos: ["Curso Tráfego Pago", "Mentoria Marketing"],
        plataformas: ["Instagram", "Hotmart"],
        score: 92
      },
      "belabelinha": {
        nome: "Bela Gil",
        nicho: "Alimentação Saudável",
        seguidores: 3200000,
        engajamento: 3.2,
        infoprodutos: ["Curso de Culinária Natural", "Ebooks de Receitas"],
        plataformas: ["Instagram", "YouTube"],
        score: 88
      },
      "caborato": {
        nome: "Caio Carneiro",
        nicho: "Vendas / Empreendedorismo",
        seguidores: 1800000,
        engajamento: 4.0,
        infoprodutos: ["Livro Seja Foda", "Palestras", "Mentorias"],
        plataformas: ["Instagram", "YouTube"],
        score: 90
      }
    };

    const influencer = influencerData[handle.toLowerCase()] || {
      nome: handle,
      nicho: "Não identificado",
      seguidores: Math.floor(Math.random() * 50000) + 5000,
      engajamento: Math.random() * 3 + 1,
      infoprodutos: [],
      plataformas: ["Instagram"],
      score: Math.floor(Math.random() * 30) + 40
    };

    const formatFollowers = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
      return n.toString();
    };

    const qualificationReasons: string[] = [];
    const riskFactors: string[] = [];

    if (influencer.seguidores >= 10000) {
      qualificationReasons.push(`Base de seguidores sólida: ${formatFollowers(influencer.seguidores)}`);
    } else {
      riskFactors.push(`Seguidores abaixo do mínimo (10k): apenas ${formatFollowers(influencer.seguidores)}`);
    }

    if (influencer.engajamento >= 3) {
      qualificationReasons.push(`Excelente taxa de engajamento: ${influencer.engajamento.toFixed(1)}%`);
    } else if (influencer.engajamento >= 2) {
      qualificationReasons.push(`Taxa de engajamento razoável: ${influencer.engajamento.toFixed(1)}%`);
    } else {
      riskFactors.push(`Engajamento baixo: ${influencer.engajamento.toFixed(1)}%`);
    }

    if (influencer.infoprodutos.length > 0) {
      qualificationReasons.push(`Já vende infoprodutos: ${influencer.infoprodutos.join(", ")}`);
    } else {
      riskFactors.push("Não possui infoprodutos identificados");
    }

    qualificationReasons.push(`Nicho: ${influencer.nicho}`);
    qualificationReasons.push(`Presente em: ${influencer.plataformas.join(", ")}`);

    const result = {
      _metadata: {
        source: "simulated",
        note: "Dados de demonstração. Em produção, conectar a APIs como Social Blade, HypeAuditor, ou Instagram Graph API."
      },
      timestamp,
      instagram_handle: `@${handle}`,
      analysis: {
        score: influencer.score,
        qualified: influencer.score >= 75,
        nome: influencer.nome,
        nicho: influencer.nicho,
        seguidores: influencer.seguidores,
        seguidores_formatado: formatFollowers(influencer.seguidores),
        engajamento: `${influencer.engajamento.toFixed(1)}%`,
        infoprodutos: influencer.infoprodutos,
        plataformas: influencer.plataformas,
        criteria_checked: criteria
      },
      match_reasons: qualificationReasons,
      risk_factors: riskFactors,
      recommendation: influencer.score >= 75 
        ? "QUALIFICADO - Prosseguir com abordagem" 
        : "NÃO QUALIFICADO - Não atende critérios mínimos"
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }]
    };
  }
);

const getInfluencerContact = tool(
  'get_influencer_contact',
  'Busca informações de contato de um influenciador para abordagem comercial. Retorna email comercial, assessoria, e sugestões de abordagem personalizada.',
  {
    instagram_handle: z.string().describe("O @ do Instagram do influenciador"),
    approach_type: z.enum(["parceria", "afiliado", "licenciamento", "collab"]).optional().describe("Tipo de abordagem pretendida")
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
    }> = {
      "nfranca": {
        nome: "Nathalia França",
        email_comercial: "comercial@nathaliafranca.com.br",
        assessoria: "Agência XYZ",
        whatsapp_comercial: null,
        tempo_resposta: "3-5 dias úteis",
        melhor_abordagem: "Email com proposta detalhada e números"
      },
      "virginiaramos": {
        nome: "Virginia Fonseca",
        email_comercial: "parcerias@wepink.com.br",
        assessoria: "WePink Assessoria",
        whatsapp_comercial: null,
        tempo_resposta: "7-14 dias úteis",
        melhor_abordagem: "Via assessoria apenas"
      },
      "pfranca": {
        nome: "Pablo Marçal",
        email_comercial: "negocios@pfranca.com.br",
        assessoria: "Equipe Marçal",
        whatsapp_comercial: null,
        tempo_resposta: "5-7 dias úteis",
        melhor_abordagem: "Email objetivo com proposta de valor clara"
      },
      "thalissonsoares": {
        nome: "Thalisson Soares",
        email_comercial: "contato@thalissonsoares.com",
        assessoria: null,
        whatsapp_comercial: "(11) 9xxxx-xxxx",
        tempo_resposta: "1-3 dias úteis",
        melhor_abordagem: "DM ou WhatsApp comercial"
      },
      "belabelinha": {
        nome: "Bela Gil",
        email_comercial: "comercial@belagil.com.br",
        assessoria: "Assessoria pessoal",
        whatsapp_comercial: null,
        tempo_resposta: "5-7 dias úteis",
        melhor_abordagem: "Email com alinhamento de valores"
      },
      "caborato": {
        nome: "Caio Carneiro",
        email_comercial: "parcerias@caiocarneiro.com.br",
        assessoria: "Seja Foda Assessoria",
        whatsapp_comercial: null,
        tempo_resposta: "3-5 dias úteis",
        melhor_abordagem: "Email com case de sucesso similar"
      }
    };

    const contact = contactData[handle.toLowerCase()] || {
      nome: handle,
      email_comercial: `contato@${handle.toLowerCase()}.com.br`,
      assessoria: null,
      whatsapp_comercial: null,
      tempo_resposta: "Variável",
      melhor_abordagem: "DM no Instagram ou email"
    };

    const approachSuggestions: Record<string, string[]> = {
      parceria: [
        "Apresente o valor que você trará para a audiência dele",
        "Mostre cases de parcerias anteriores bem-sucedidas",
        "Seja específico sobre entregas e contrapartidas",
        "Mencione o alinhamento com o nicho dele"
      ],
      afiliado: [
        "Destaque as comissões e modelo de pagamento",
        "Apresente materiais de divulgação prontos",
        "Mostre conversão média de outros afiliados",
        "Ofereça período de teste do produto"
      ],
      licenciamento: [
        "Apresente proposta de royalties clara",
        "Mostre potencial de escala do produto",
        "Detalhe suporte e produção que você oferece",
        "Inclua projeção de faturamento"
      ],
      collab: [
        "Proponha conteúdo que beneficie ambas as audiências",
        "Seja flexível sobre formatos (lives, reels, stories)",
        "Sugira datas e cronograma realista",
        "Mostre como as audiências se complementam"
      ]
    };

    const result = {
      _metadata: {
        source: "simulated",
        note: "Dados de demonstração. Em produção, conectar a APIs de prospecção e bases de contatos verificados."
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
        confidence: contactData[handle.toLowerCase()] ? "Alta" : "Média"
      },
      outreach_suggestions: approachSuggestions[approachType] || approachSuggestions.parceria,
      template_abordagem: `Olá ${contact.nome}! Acompanho seu trabalho no Instagram e admiro como você [mencione algo específico]. Gostaria de propor uma ${approachType} que pode ser muito interessante para sua audiência. Posso enviar mais detalhes?`
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }]
    };
  }
);

const sdrMcpServer = createSdkMcpServer({
  name: 'sdr',
  version: '1.0.0',
  tools: [analyzeInfluencerFit, getInfluencerContact]
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
    description: 'Pesquisa e analisa perfis de influenciadores',
    prompt: 'Você é um pesquisador especializado em análise de influenciadores digitais brasileiros que vendem infoprodutos. Utilize as ferramentas disponíveis para avaliar o perfil, engajamento, nicho e potencial de cada influenciador.',
    tools: ['mcp__sdr__analyze_influencer_fit'],
    model: 'sonnet'
  },
  outreach_specialist: {
    description: 'Especialista em abordagem e contato com influenciadores',
    prompt: 'Você é um especialista em outreach para influenciadores. Seu objetivo é identificar os melhores canais de contato e sugerir abordagens personalizadas baseadas no perfil e nicho do influenciador.',
    tools: ['mcp__sdr__get_influencer_contact'],
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
