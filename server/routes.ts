import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertAgentConfigSchema, insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

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

  return httpServer;
}
