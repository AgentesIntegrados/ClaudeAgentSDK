import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertAgentConfigSchema, insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { processAgentMessage, type ChatMessage } from "./claude";

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
      
      // Get conversation and agent config
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const agentConfig = await storage.getAgentConfig(conversation.agentConfigId);
      if (!agentConfig) {
        return res.status(404).json({ error: "Agent config not found" });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId,
        role: "user",
        content: message,
        toolUse: null,
      });

      // Get conversation history
      const allMessages = await storage.getMessagesByConversation(conversationId);
      const history: ChatMessage[] = allMessages
        .filter(m => m.id !== userMessage.id)
        .map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      // Process with Claude
      const agentResponse = await processAgentMessage(
        message,
        agentConfig.systemPrompt,
        history,
        agentConfig.model
      );

      // Save agent response
      const agentMessage = await storage.createMessage({
        conversationId,
        role: "agent",
        content: agentResponse.content,
        toolUse: agentResponse.toolUse || null,
      });

      res.json({
        userMessage,
        agentMessage,
        toolUse: agentResponse.toolUse,
      });

    } catch (error: any) {
      console.error("Chat error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to process chat" });
    }
  });

  return httpServer;
}
