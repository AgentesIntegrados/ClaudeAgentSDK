import type { AgentConfig, InsertAgentConfig, Conversation, InsertConversation, Message, InsertMessage } from "@shared/schema";

const API_BASE = "/api";

// Agent Configs
export async function fetchAgentConfigs(): Promise<AgentConfig[]> {
  const res = await fetch(`${API_BASE}/agent-configs`);
  if (!res.ok) throw new Error("Failed to fetch agent configs");
  return res.json();
}

export async function fetchDefaultAgentConfig(): Promise<AgentConfig> {
  const res = await fetch(`${API_BASE}/agent-configs/default`);
  if (!res.ok) throw new Error("Failed to fetch default config");
  return res.json();
}

export async function fetchAgentConfig(id: string): Promise<AgentConfig> {
  const res = await fetch(`${API_BASE}/agent-configs/${id}`);
  if (!res.ok) throw new Error("Failed to fetch config");
  return res.json();
}

export async function createAgentConfig(config: InsertAgentConfig): Promise<AgentConfig> {
  const res = await fetch(`${API_BASE}/agent-configs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error("Failed to create config");
  return res.json();
}

export async function updateAgentConfig(id: string, updates: Partial<InsertAgentConfig>): Promise<AgentConfig> {
  const res = await fetch(`${API_BASE}/agent-configs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update config");
  return res.json();
}

// Conversations
export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/conversations`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function fetchConversation(id: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/conversations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch conversation");
  return res.json();
}

export async function createConversation(conversation: InsertConversation): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(conversation),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

// Messages
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function createMessage(message: InsertMessage): Promise<Message> {
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error("Failed to create message");
  return res.json();
}

export async function updateMessage(id: string, updates: Partial<InsertMessage>): Promise<Message> {
  const res = await fetch(`${API_BASE}/messages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update message");
  return res.json();
}
