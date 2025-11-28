import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, ContentBlock, ToolUseBlock, TextBlock, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages';

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const defaultApiKey = process.env.ANTHROPIC_API_KEY;

function getAnthropicClient(customApiKey?: string | null): Anthropic {
  const apiKey = customApiKey || defaultApiKey;
  if (!apiKey) {
    throw new Error("Nenhuma chave de API configurada. Configure ANTHROPIC_API_KEY ou insira uma chave personalizada.");
  }
  return new Anthropic({ apiKey });
}

const MCP_SERVER_NAME = "sdr";

const sdrTools: Anthropic.Tool[] = [
  {
    name: `mcp__${MCP_SERVER_NAME}__analyze_company_fit`,
    description: "Analyzes a company's public data to check if it fits the ICP (Ideal Customer Profile). Returns qualification score and reasons based on company size, industry, technology stack, and funding stage.",
    input_schema: {
      type: "object" as const,
      properties: {
        company_domain: {
          type: "string",
          description: "The website domain of the company (e.g., 'example.com')"
        },
        criteria: {
          type: "array",
          items: { type: "string" },
          description: "List of qualification criteria to check (e.g., ['B2B', 'Series B+', 'US-based'])"
        }
      },
      required: ["company_domain"]
    }
  },
  {
    name: `mcp__${MCP_SERVER_NAME}__get_decision_maker`,
    description: "Finds the likely decision maker for a specific role at a company. Returns name, title, and contact information patterns.",
    input_schema: {
      type: "object" as const,
      properties: {
        company_domain: {
          type: "string",
          description: "The website domain of the company"
        },
        role: {
          type: "string",
          description: "The role to search for (e.g., 'VP of Engineering', 'CTO', 'Head of Product')"
        }
      },
      required: ["company_domain", "role"]
    }
  }
];

function extractToolName(mcpToolName: string): string {
  const parts = mcpToolName.split("__");
  return parts.length === 3 ? parts[2] : mcpToolName;
}

function executeToolCall(toolName: string, toolInput: Record<string, unknown>): Record<string, unknown> {
  const timestamp = new Date().toISOString();
  const baseTool = extractToolName(toolName);
  
  if (baseTool === "analyze_company_fit") {
    const domain = (toolInput.company_domain as string) || "unknown.com";
    const criteria = (toolInput.criteria as string[]) || ["B2B SaaS", "Tech Stack Moderno", "Equipe de Engenharia"];
    
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

    return {
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
  }
  
  if (baseTool === "get_decision_maker") {
    const domain = (toolInput.company_domain as string) || "unknown.com";
    const role = (toolInput.role as string) || "Engineering Lead";
    
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

    return {
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
  }
  
  return { 
    error: "Ferramenta não encontrada",
    available_tools: ["analyze_company_fit", "get_decision_maker"]
  };
}

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
}

export async function processAgentMessage(
  userMessage: string,
  systemPrompt: string,
  conversationHistory: ChatMessage[],
  model?: string,
  customApiKey?: string | null
): Promise<AgentResponse> {
  const anthropic = getAnthropicClient(customApiKey);
  
  const messages: MessageParam[] = [
    ...conversationHistory.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content
    })),
    { role: "user" as const, content: userMessage }
  ];

  try {
    const response = await anthropic.messages.create({
      model: model || DEFAULT_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      tools: sdrTools,
      messages: messages,
    });

    const toolUseBlock = response.content.find(
      (block): block is ToolUseBlock => block.type === "tool_use"
    );
    
    if (toolUseBlock) {
      const toolName = toolUseBlock.name;
      const toolInput = toolUseBlock.input as Record<string, unknown>;
      
      const toolResult = executeToolCall(toolName, toolInput);
      
      const assistantContent: ContentBlock[] = response.content;
      
      const toolResultBlock: ToolResultBlockParam = {
        type: "tool_result",
        tool_use_id: toolUseBlock.id,
        content: JSON.stringify(toolResult)
      };

      const followUpMessages: MessageParam[] = [
        ...messages,
        { role: "assistant" as const, content: assistantContent },
        { role: "user" as const, content: [toolResultBlock] }
      ];

      const finalResponse = await anthropic.messages.create({
        model: model || DEFAULT_MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        tools: sdrTools,
        messages: followUpMessages,
      });

      const textContent = finalResponse.content.find(
        (block): block is TextBlock => block.type === "text"
      );
      
      return {
        content: textContent?.text || "Análise concluída com sucesso.",
        toolUse: {
          tool: toolName,
          input: JSON.stringify(toolInput, null, 2),
          status: "completed",
          result: toolResult
        }
      };
    }

    const textBlock = response.content.find(
      (block): block is TextBlock => block.type === "text"
    );
    
    return {
      content: textBlock?.text || "Desculpe, não consegui processar sua solicitação."
    };

  } catch (error) {
    console.error("Claude API error:", error);
    if (error instanceof Error) {
      throw new Error(`Erro na API Claude: ${error.message}`);
    }
    throw new Error("Erro desconhecido ao processar mensagem");
  }
}
