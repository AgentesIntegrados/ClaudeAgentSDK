import Anthropic from '@anthropic-ai/sdk';

// Integration: blueprint:javascript_anthropic
// The newest Anthropic model is "claude-sonnet-4-20250514"
const DEFAULT_MODEL = "claude-sonnet-4-20250514";

// Default client using environment variable
const defaultApiKey = process.env.ANTHROPIC_API_KEY;

function getAnthropicClient(customApiKey?: string | null): Anthropic {
  const apiKey = customApiKey || defaultApiKey;
  if (!apiKey) {
    throw new Error("Nenhuma chave de API configurada. Configure ANTHROPIC_API_KEY ou insira uma chave personalizada.");
  }
  return new Anthropic({ apiKey });
}

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

// SDR Agent Tools
const sdrTools: ToolDefinition[] = [
  {
    name: "analyze_company_fit",
    description: "Analyzes a company's public data to check if it fits the ICP (Ideal Customer Profile). Returns qualification score and reasons.",
    input_schema: {
      type: "object",
      properties: {
        company_domain: {
          type: "string",
          description: "The website domain of the company (e.g., 'example.com')"
        },
        criteria: {
          type: "array",
          items: { type: "string" },
          description: "List of qualification criteria (e.g., ['B2B', 'Series B+', 'US-based'])"
        }
      },
      required: ["company_domain"]
    }
  },
  {
    name: "get_decision_maker",
    description: "Finds the likely decision maker for a specific role at a company.",
    input_schema: {
      type: "object",
      properties: {
        company_domain: {
          type: "string",
          description: "The website domain of the company"
        },
        role: {
          type: "string",
          description: "The role to search for (e.g., 'VP of Engineering', 'CTO')"
        }
      },
      required: ["company_domain", "role"]
    }
  }
];

// Simulate tool execution (in production, this would call real APIs)
function executeToolCall(toolName: string, toolInput: any): any {
  if (toolName === "analyze_company_fit") {
    // Simulated company analysis
    const domain = toolInput.company_domain || "unknown";
    const score = Math.floor(Math.random() * 30) + 70; // 70-100
    return {
      company: domain,
      score: score,
      qualified: score >= 75,
      match_reasons: [
        "Stack tecnológico compatível: Python/Node.js detectado",
        "Estágio de financiamento: Series B identificado",
        "Localização: Região alvo confirmada"
      ],
      risk_factors: score < 80 ? ["Possível redução de equipe recente"] : []
    };
  }
  
  if (toolName === "get_decision_maker") {
    const domain = toolInput.company_domain || "unknown";
    const role = toolInput.role || "Engineering Lead";
    return {
      name: "Ana Silva",
      title: role,
      linkedin: `linkedin.com/in/ana-silva-${domain.split('.')[0]}`,
      email_pattern: `nome.sobrenome@${domain}`
    };
  }
  
  return { error: "Tool not found" };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AgentResponse {
  content: string;
  toolUse?: {
    tool: string;
    input: string;
    status: "completed";
    result: any;
  };
}

export async function processAgentMessage(
  userMessage: string,
  systemPrompt: string,
  conversationHistory: ChatMessage[],
  model?: string,
  customApiKey?: string | null
): Promise<AgentResponse> {
  const anthropic = getAnthropicClient(customApiKey);
  
  const messages = [
    ...conversationHistory,
    { role: "user" as const, content: userMessage }
  ];

  try {
    // First API call - may request tool use
    const response = await anthropic.messages.create({
      model: model || DEFAULT_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      tools: sdrTools,
      messages: messages,
    });

    // Check if Claude wants to use a tool
    const toolUseBlock = response.content.find(block => block.type === "tool_use");
    
    if (toolUseBlock && toolUseBlock.type === "tool_use") {
      const toolName = toolUseBlock.name;
      const toolInput = toolUseBlock.input;
      
      // Execute the tool
      const toolResult = executeToolCall(toolName, toolInput);
      
      // Continue conversation with tool result
      const followUpMessages = [
        ...messages,
        { role: "assistant" as const, content: response.content },
        { 
          role: "user" as const, 
          content: [{
            type: "tool_result" as const,
            tool_use_id: toolUseBlock.id,
            content: JSON.stringify(toolResult)
          }]
        }
      ];

      const finalResponse = await anthropic.messages.create({
        model: model || DEFAULT_MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        tools: sdrTools,
        messages: followUpMessages as any,
      });

      const textContent = finalResponse.content.find(block => block.type === "text");
      
      return {
        content: textContent?.type === "text" ? textContent.text : "Análise concluída.",
        toolUse: {
          tool: toolName,
          input: JSON.stringify(toolInput),
          status: "completed",
          result: toolResult
        }
      };
    }

    // No tool use, just return text response
    const textBlock = response.content.find(block => block.type === "text");
    return {
      content: textBlock?.type === "text" ? textBlock.text : "Desculpe, não consegui processar sua solicitação."
    };

  } catch (error: any) {
    console.error("Claude API error:", error);
    throw new Error(`Erro ao processar mensagem: ${error.message}`);
  }
}
