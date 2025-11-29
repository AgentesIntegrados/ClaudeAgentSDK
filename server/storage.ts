import { 
  type User, 
  type InsertUser,
  type AgentConfig,
  type InsertAgentConfig,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type ExpertRanking,
  type InsertExpertRanking,
  users,
  agentConfigs,
  conversations,
  messages,
  expertRankings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Agent Configs
  getAgentConfig(id: string): Promise<AgentConfig | undefined>;
  getDefaultAgentConfig(): Promise<AgentConfig | undefined>;
  getAllAgentConfigs(): Promise<AgentConfig[]>;
  createAgentConfig(config: InsertAgentConfig): Promise<AgentConfig>;
  updateAgentConfig(id: string, config: Partial<InsertAgentConfig>): Promise<AgentConfig | undefined>;
  
  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined>;
  
  // Messages
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, updates: Partial<InsertMessage>): Promise<Message | undefined>;
  
  // Expert Rankings
  getAllExpertRankings(): Promise<ExpertRanking[]>;
  getExpertRankingByHandle(handle: string): Promise<ExpertRanking | undefined>;
  createExpertRanking(ranking: InsertExpertRanking): Promise<ExpertRanking>;
  deleteExpertRanking(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Agent Configs
  async getAgentConfig(id: string): Promise<AgentConfig | undefined> {
    const result = await db.select().from(agentConfigs).where(eq(agentConfigs.id, id)).limit(1);
    return result[0];
  }

  async getDefaultAgentConfig(): Promise<AgentConfig | undefined> {
    const result = await db.select().from(agentConfigs).orderBy(desc(agentConfigs.createdAt)).limit(1);
    return result[0];
  }

  async getAllAgentConfigs(): Promise<AgentConfig[]> {
    return db.select().from(agentConfigs).orderBy(desc(agentConfigs.createdAt));
  }

  async createAgentConfig(config: InsertAgentConfig): Promise<AgentConfig> {
    const result = await db.insert(agentConfigs).values(config).returning();
    return result[0];
  }

  async updateAgentConfig(id: string, config: Partial<InsertAgentConfig>): Promise<AgentConfig | undefined> {
    const result = await db
      .update(agentConfigs)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(agentConfigs.id, id))
      .returning();
    return result[0];
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return result[0];
  }

  async getAllConversations(): Promise<Conversation[]> {
    return db.select().from(conversations).orderBy(desc(conversations.updatedAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const result = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return result[0];
  }

  // Messages
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async updateMessage(id: string, updates: Partial<InsertMessage>): Promise<Message | undefined> {
    const result = await db
      .update(messages)
      .set(updates)
      .where(eq(messages.id, id))
      .returning();
    return result[0];
  }

  // Expert Rankings
  async getAllExpertRankings(): Promise<ExpertRanking[]> {
    return db.select().from(expertRankings).orderBy(desc(expertRankings.score));
  }

  // Helper para normalizar handles de forma consistente
  private normalizeHandle(handle: string): string {
    return handle.replace(/@/g, '').trim().toLowerCase();
  }

  async getExpertRankingByHandle(handle: string): Promise<ExpertRanking | undefined> {
    const normalizedHandle = this.normalizeHandle(handle);
    const result = await db.select().from(expertRankings)
      .where(eq(expertRankings.instagramHandle, normalizedHandle))
      .limit(1);
    return result[0];
  }

  async createExpertRanking(ranking: InsertExpertRanking): Promise<ExpertRanking> {
    const normalizedRanking = {
      ...ranking,
      instagramHandle: this.normalizeHandle(ranking.instagramHandle)
    };
    const result = await db.insert(expertRankings).values(normalizedRanking).returning();
    return result[0];
  }

  async deleteExpertRanking(id: string): Promise<void> {
    await db.delete(expertRankings).where(eq(expertRankings.id, id));
  }
}

export const storage = new DatabaseStorage();
