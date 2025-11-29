import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

const analyzeCompanyFit = tool(
  'analyze_company_fit',
  'Analyzes a company\'s public data to check if it fits the ICP (Ideal Customer Profile). Returns qualification score and reasons based on company size, industry, technology stack, and funding stage.',
  {
    company_domain: z.string().describe("The website domain of the company (e.g., 'example.com')"),
    criteria: z.array(z.string()).optional().describe("List of qualification criteria to check (e.g., ['B2B', 'Series B+', 'US-based'])")
  },
  async (args) => {
    const timestamp = new Date().toISOString();
    const domain = args.company_domain || "unknown.com";
    const criteria = args.criteria || ["B2B SaaS", "Tech Stack Moderno", "Equipe de Engenharia"];
    
    const companyData: Record<string, { industry: string; size: string; techStack: string[]; funding: string; score: number }> = {
      "replit.com": {
        industry: "Developer Tools / IDE",
        size: "100-500 funcionários",
        techStack: ["Python", "Node.js", "Go", "TypeScript"],
        funding: "Series B - $97.4M",
        score: 92
      },
      "stripe.com": {
        industry: "Fintech / Payments",
        size: "5000+ funcionários",
        techStack: ["Ruby", "Python", "Go", "Scala"],
        funding: "Series I - $600M+",
        score: 88
      },
      "vercel.com": {
        industry: "Developer Tools / Cloud",
        size: "200-500 funcionários",
        techStack: ["TypeScript", "Node.js", "Go", "Rust"],
        funding: "Series D - $150M",
        score: 95
      }
    };

    const company = companyData[domain] || {
      industry: "Tecnologia",
      size: "50-200 funcionários",
      techStack: ["Python", "JavaScript"],
      funding: "Seed/Series A",
      score: Math.floor(Math.random() * 20) + 70
    };

    const result = {
      _metadata: {
        source: "simulated",
        note: "Dados de demonstração. Em produção, conectar a APIs como Clearbit, LinkedIn Sales Navigator, ou CRM."
      },
      timestamp,
      company_domain: domain,
      analysis: {
        score: company.score,
        qualified: company.score >= 75,
        industry: company.industry,
        company_size: company.size,
        tech_stack: company.techStack,
        funding_stage: company.funding,
        criteria_checked: criteria
      },
      match_reasons: [
        `Indústria compatível: ${company.industry}`,
        `Stack tecnológico: ${company.techStack.join(", ")}`,
        `Estágio de funding: ${company.funding}`,
        company.score >= 85 ? "Alta probabilidade de conversão" : "Potencial moderado de conversão"
      ],
      risk_factors: company.score < 85 ? [
        "Pode requerer ciclo de vendas mais longo",
        "Verificar orçamento disponível"
      ] : [],
      recommendation: company.score >= 75 
        ? "QUALIFICADO - Prosseguir com outreach" 
        : "NÃO QUALIFICADO - Arquivar para nurturing"
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }]
    };
  }
);

const getDecisionMaker = tool(
  'get_decision_maker',
  'Finds the likely decision maker for a specific role at a company. Returns name, title, and contact information patterns.',
  {
    company_domain: z.string().describe("The website domain of the company"),
    role: z.string().describe("The role to search for (e.g., 'VP of Engineering', 'CTO', 'Head of Product')")
  },
  async (args) => {
    const timestamp = new Date().toISOString();
    const domain = args.company_domain || "unknown.com";
    const role = args.role || "Engineering Lead";
    
    const decisionMakers: Record<string, Record<string, { name: string; title: string; linkedin: string }>> = {
      "replit.com": {
        "CTO": { name: "Amjad Masad", title: "CEO & Co-founder", linkedin: "linkedin.com/in/amjadmasad" },
        "VP of Engineering": { name: "Faris Masad", title: "Co-founder", linkedin: "linkedin.com/in/masadfaris" },
        "Head of Product": { name: "Product Lead", title: "Head of Product", linkedin: "linkedin.com/company/replit" }
      },
      "stripe.com": {
        "CTO": { name: "David Singleton", title: "CTO", linkedin: "linkedin.com/in/dps" },
        "VP of Engineering": { name: "Engineering VP", title: "VP of Engineering", linkedin: "linkedin.com/company/stripe" }
      },
      "vercel.com": {
        "CTO": { name: "Guillermo Rauch", title: "CEO & Founder", linkedin: "linkedin.com/in/rauchg" },
        "VP of Engineering": { name: "Engineering Lead", title: "VP of Engineering", linkedin: "linkedin.com/company/vercel" }
      }
    };

    const companyContacts = decisionMakers[domain] || {};
    const contact = companyContacts[role] || {
      name: `${role} Contact`,
      title: role,
      linkedin: `linkedin.com/company/${domain.split('.')[0]}`
    };

    const result = {
      _metadata: {
        source: "simulated",
        note: "Dados de demonstração. Em produção, conectar a APIs como LinkedIn Sales Navigator, Apollo.io, ou ZoomInfo."
      },
      timestamp,
      company_domain: domain,
      role_searched: role,
      decision_maker: {
        name: contact.name,
        title: contact.title,
        linkedin_url: contact.linkedin,
        email_pattern: `nome.sobrenome@${domain}`,
        confidence: companyContacts[role] ? "Alta" : "Média"
      },
      outreach_suggestions: [
        "Mencionar stack tecnológico em comum",
        "Referenciar case studies do setor",
        "Propor demo técnica de 15 minutos"
      ]
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }]
    };
  }
);

const sdrMcpServer = createSdkMcpServer({
  name: 'sdr',
  version: '1.0.0',
  tools: [analyzeCompanyFit, getDecisionMaker]
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
    description: 'Pesquisa informações detalhadas sobre empresas e mercados',
    prompt: 'Você é um pesquisador especializado em análise de empresas B2B. Utilize as ferramentas disponíveis para coletar dados sobre empresas alvo, identificar padrões de mercado e fornecer insights acionáveis para a equipe de vendas.',
    tools: ['mcp__sdr__analyze_company_fit'],
    model: 'sonnet'
  },
  outreach_specialist: {
    description: 'Especialista em estratégias de outreach e contato com decisores',
    prompt: 'Você é um especialista em outreach B2B. Seu objetivo é identificar os tomadores de decisão corretos nas empresas qualificadas e sugerir abordagens personalizadas baseadas no contexto da empresa e do contato.',
    tools: ['mcp__sdr__get_decision_maker'],
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
