import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertAgentConfigSchema, insertConversationSchema, insertMessageSchema, insertExpertRankingSchema } from "@shared/schema";
import { z } from "zod";
import { processAgentMessage, type ChatMessage } from "./claude";
import { broadcastLog } from "./logger";
import { cache } from "./cache";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Agent Configs
  app.get("/api/agent-configs", async (req, res) => {
    try {
      const configs = await storage.getAllAgentConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent configs" });
    }
  });

  app.get("/api/agent-configs/default", async (req, res) => {
    try {
      const config = await storage.getDefaultAgentConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch default config" });
    }
  });

  app.get("/api/agent-configs/:id", async (req, res) => {
    try {
      const config = await storage.getAgentConfig(req.params.id);
      if (!config) {
        return res.status(404).json({ error: "Config not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });

  app.post("/api/agent-configs", async (req, res) => {
    try {
      const validated = insertAgentConfigSchema.parse(req.body);
      const config = await storage.createAgentConfig(validated);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create config" });
    }
  });

  app.patch("/api/agent-configs/:id", async (req, res) => {
    try {
      const partial = insertAgentConfigSchema.partial().parse(req.body);
      const config = await storage.updateAgentConfig(req.params.id, partial);
      if (!config) {
        return res.status(404).json({ error: "Config not found" });
      }
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update config" });
    }
  });

  // Conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const convs = await storage.getAllConversations();
      res.json(convs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validated = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validated);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.patch("/api/conversations/:id", async (req, res) => {
    try {
      const partial = insertConversationSchema.partial().parse(req.body);
      const conversation = await storage.updateConversation(req.params.id, partial);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update conversation" });
    }
  });

  // Messages
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const msgs = await storage.getMessagesByConversation(req.params.conversationId);
      res.json(msgs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validated = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validated);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.patch("/api/messages/:id", async (req, res) => {
    try {
      const partial = insertMessageSchema.partial().parse(req.body);
      const message = await storage.updateMessage(req.params.id, partial);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update message" });
    }
  });

  // Chat with Claude Agent - Real API Integration
  const chatRequestSchema = z.object({
    conversationId: z.string(),
    message: z.string(),
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { conversationId, message } = chatRequestSchema.parse(req.body);
      
      broadcastLog("INFO", "Nova mensagem recebida do usuário", { preview: message.substring(0, 50) });
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        broadcastLog("ERROR", "Conversa não encontrada", { conversationId });
        return res.status(404).json({ error: "Conversation not found" });
      }

      const agentConfig = await storage.getAgentConfig(conversation.agentConfigId);
      if (!agentConfig) {
        broadcastLog("ERROR", "Configuração do agente não encontrada");
        return res.status(404).json({ error: "Agent config not found" });
      }

      broadcastLog("AGENT", `Processando com ${agentConfig.name}`, { model: agentConfig.model });

      const userMessage = await storage.createMessage({
        conversationId,
        role: "user",
        content: message,
        toolUse: null,
      });

      const allMessages = await storage.getMessagesByConversation(conversationId);
      const history: ChatMessage[] = allMessages
        .filter(m => m.id !== userMessage.id)
        .map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      broadcastLog("AGENT", "Enviando requisição para Claude API...");
      
      const agentResponse = await processAgentMessage(
        message,
        agentConfig.systemPrompt,
        history,
        agentConfig.model,
        agentConfig.customApiKey
      );

      if (agentResponse.toolUse) {
        broadcastLog("TOOL", `Executando ferramenta: ${agentResponse.toolUse.tool}`, {
          input: agentResponse.toolUse.input
        });
        broadcastLog("TOOL", `Ferramenta ${agentResponse.toolUse.tool} concluída com sucesso`);
      }

      const agentMessage = await storage.createMessage({
        conversationId,
        role: "agent",
        content: agentResponse.content,
        toolUse: agentResponse.toolUse || null,
      });

      broadcastLog("AGENT", "Resposta gerada com sucesso", { 
        preview: agentResponse.content.substring(0, 50) + "..." 
      });

      // AUTO-SAVE: Salvar automaticamente no ranking após análise
      let savedToRanking = false;
      if (agentResponse.toolUse && agentResponse.toolUse.tool.endsWith("analyze_expert_fit")) {
        try {
          const toolResult = agentResponse.toolUse.result as any;
          if (toolResult && toolResult.analysis) {
            const analysis = toolResult.analysis as { 
              nome: string; 
              nicho: string; 
              score: number; 
              qualified?: boolean;
            };
            // Normaliza o handle: remove @ e espaços, lowercase
            const rawHandle = String(toolResult.instagram_handle || analysis.nome);
            const instagramHandle = rawHandle.replace('@', '').trim().toLowerCase();
            
            // Verifica se já existe no ranking
            const existing = await storage.getExpertRankingByHandle(instagramHandle);
            if (!existing) {
              await storage.createExpertRanking({
                instagramHandle,
                nome: analysis.nome,
                nicho: analysis.nicho || "Não identificado",
                score: analysis.score,
                qualified: (analysis.qualified ?? (analysis.score >= 70)) ? "SIM" : "NAO",
                analysisData: toolResult,
              });
              savedToRanking = true;
              broadcastLog("RANKING", `Expert ${instagramHandle} salvo automaticamente no ranking (Score: ${analysis.score})`);
            } else {
              savedToRanking = true; // Already exists, also flag as in ranking
              broadcastLog("RANKING", `Expert ${instagramHandle} já existe no ranking`);
            }
          }
        } catch (rankingError) {
          console.error("Auto-save ranking error:", rankingError);
          broadcastLog("ERROR", "Falha ao salvar automaticamente no ranking");
        }
      }

      res.json({
        userMessage,
        agentMessage,
        toolUse: agentResponse.toolUse,
        savedToRanking, // Flag para frontend saber que precisa atualizar rankings
      });

    } catch (error: any) {
      console.error("Chat error:", error);
      broadcastLog("ERROR", `Erro no processamento: ${error.message}`);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to process chat" });
    }
  });

  // Expert Rankings
  app.get("/api/rankings", async (req, res) => {
    try {
      const rankings = await storage.getAllExpertRankings();
      res.json(rankings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rankings" });
    }
  });

  app.post("/api/rankings", async (req, res) => {
    try {
      // Normaliza o handle antes de validar
      const body = {
        ...req.body,
        instagramHandle: req.body.instagramHandle?.replace('@', '').trim().toLowerCase() || req.body.instagramHandle
      };
      const validated = insertExpertRankingSchema.parse(body);
      const existing = await storage.getExpertRankingByHandle(validated.instagramHandle);
      if (existing) {
        return res.status(409).json({ error: "Expert já existe no ranking", existing });
      }
      const ranking = await storage.createExpertRanking(validated);
      res.status(201).json(ranking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create ranking" });
    }
  });

  app.delete("/api/rankings/:id", async (req, res) => {
    try {
      await storage.deleteExpertRanking(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ranking" });
    }
  });

  // Cache Management
  app.get("/api/cache/stats", async (req, res) => {
    try {
      const stats = cache.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get cache stats" });
    }
  });

  app.delete("/api/cache/clear", async (req, res) => {
    try {
      cache.clear();
      broadcastLog("CACHE", "Cache limpo manualmente");
      res.json({ message: "Cache cleared successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cache" });
    }
  });

  app.delete("/api/cache/expert/:handle", async (req, res) => {
    try {
      const handle = req.params.handle.toLowerCase();
      cache.invalidatePattern(`expert:.*:${handle}`);
      broadcastLog("CACHE", `Cache invalidado para expert: ${handle}`);
      res.json({ message: `Cache invalidated for ${handle}` });
    } catch (error) {
      res.status(500).json({ error: "Failed to invalidate cache" });
    }
  });

  return httpServer;
}
