import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Agent Configurations
export const agentConfigs = pgTable("agent_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  model: text("model").notNull().default("claude-sonnet-4-20250514"),
  systemPrompt: text("system_prompt").notNull(),
  permissionMode: text("permission_mode").notNull().default("allow"),
  maxTurns: integer("max_turns").notNull().default(10),
  allowedTools: text("allowed_tools").array().notNull().default(sql`ARRAY[]::text[]`),
  customApiKey: text("custom_api_key"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAgentConfigSchema = createInsertSchema(agentConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAgentConfig = z.infer<typeof insertAgentConfigSchema>;
export type AgentConfig = typeof agentConfigs.$inferSelect;

// Conversations
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentConfigId: varchar("agent_config_id").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  role: text("role").notNull(), // 'user' | 'agent'
  content: text("content").notNull(),
  toolUse: jsonb("tool_use"), // { tool: string, input: string, status: string, result?: any }
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Expert Rankings
export const expertRankings = pgTable("expert_rankings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instagramHandle: text("instagram_handle").notNull(),
  nome: text("nome").notNull(),
  nicho: text("nicho"),
  publicoAlvo: text("publico_alvo"),
  seguidores: integer("seguidores"),
  score: integer("score").notNull(),
  qualified: text("qualified").notNull(),
  infoprodutos: jsonb("infoprodutos"),
  comunidade: jsonb("comunidade"),
  autoridade: jsonb("autoridade"),
  estruturaVendas: jsonb("estrutura_vendas"),
  analysisData: jsonb("analysis_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertExpertRankingSchema = createInsertSchema(expertRankings).omit({
  id: true,
  createdAt: true,
});

export type InsertExpertRanking = z.infer<typeof insertExpertRankingSchema>;
export type ExpertRanking = typeof expertRankings.$inferSelect;

// MCP Servers - External MCP server connections
export const mcpServers = pgTable("mcp_servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  transportType: text("transport_type").notNull(), // 'stdio' | 'http' | 'websocket'
  endpoint: text("endpoint"), // URL for http/websocket (without auth params)
  command: text("command"), // Command for stdio (e.g., "npx", "node")
  args: text("args").array(), // Arguments for stdio command
  env: jsonb("env"), // Environment variables for stdio
  authMode: text("auth_mode").notNull().default("none"), // 'none' | 'bearer' | 'header' | 'query'
  secretRef: text("secret_ref"), // Reference to env var name (e.g., "SMITHERY_API_KEY")
  authConfig: jsonb("auth_config"), // Additional auth config (header name, query param name, etc.)
  enabled: boolean("enabled").notNull().default(true),
  status: text("status").notNull().default("disconnected"), // 'connected' | 'disconnected' | 'error'
  lastError: text("last_error"),
  discoveredTools: jsonb("discovered_tools"), // Array of tool definitions from server
  lastConnected: timestamp("last_connected"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMcpServerSchema = createInsertSchema(mcpServers).omit({
  id: true,
  status: true,
  lastError: true,
  discoveredTools: true,
  lastConnected: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMcpServer = z.infer<typeof insertMcpServerSchema>;
export type McpServer = typeof mcpServers.$inferSelect;
