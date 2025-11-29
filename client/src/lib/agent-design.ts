
export const PROJECT_STRUCTURE = [
  {
    name: "client",
    type: "folder",
    children: [
      {
        name: "src",
        type: "folder",
        children: [
          {
            name: "pages",
            type: "folder",
            children: [
              { name: "dashboard.tsx", type: "file", language: "typescript" },
              { name: "analytics.tsx", type: "file", language: "typescript" },
              { name: "roadmap.tsx", type: "file", language: "typescript" },
              { name: "settings.tsx", type: "file", language: "typescript" },
              { name: "architecture.tsx", type: "file", language: "typescript" },
              { name: "terminal.tsx", type: "file", language: "typescript" },
            ]
          },
          {
            name: "components",
            type: "folder",
            children: [
              { name: "layout.tsx", type: "file", language: "typescript" },
            ]
          },
          {
            name: "lib",
            type: "folder",
            children: [
              { name: "api.ts", type: "file", language: "typescript" },
              { name: "queryClient.ts", type: "file", language: "typescript" },
            ]
          },
          { name: "App.tsx", type: "file", language: "typescript" },
          { name: "main.tsx", type: "file", language: "typescript" },
        ]
      }
    ]
  },
  {
    name: "server",
    type: "folder",
    children: [
      { name: "index.ts", type: "file", language: "typescript" },
      { name: "routes.ts", type: "file", language: "typescript" },
      { name: "claude.ts", type: "file", language: "typescript" },
      { name: "cache.ts", type: "file", language: "typescript" },
      { name: "logger.ts", type: "file", language: "typescript" },
      { name: "storage.ts", type: "file", language: "typescript" },
      { name: "db.ts", type: "file", language: "typescript" },
      { name: "seed.ts", type: "file", language: "typescript" },
    ]
  },
  {
    name: "shared",
    type: "folder",
    children: [
      { name: "schema.ts", type: "file", language: "typescript" },
    ]
  },
  { name: "package.json", type: "file", language: "json" },
  { name: "tsconfig.json", type: "file", language: "json" },
  { name: "README.md", type: "file", language: "markdown" },
];

export const FILE_CONTENTS: Record<string, string> = {
  "server/index.ts": `import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { addLogClient, removeLogClient, broadcastLog } from "./logger";
import { storage } from "./storage";
import { seedDatabase } from "./seed";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const httpServer = createServer(app);

// WebSocket Server for Real-time Logs
const wss = new WebSocketServer({ server: httpServer, path: "/ws/logs" });

wss.on("connection", (ws) => {
  addLogClient(ws);
  broadcastLog("INFO", "Nova conexão WebSocket estabelecida");

  ws.on("close", () => {
    removeLogClient(ws);
    broadcastLog("INFO", "Conexão WebSocket encerrada");
  });
});

async function startServer() {
  await seedDatabase();
  
  const server = await registerRoutes(httpServer, app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    broadcastLog("INFO", \`🚀 Servidor rodando em http://0.0.0.0:\${PORT}\`);
  });
}

startServer();
`,

  "server/claude.ts": `import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { broadcastLog } from "./logger";
import { cache, CacheKeys, CacheTTL } from "./cache";

const analyzeExpertFit = tool(
  'analyze_expert_fit',
  'Analisa perfil de expert que vende cursos high ticket. Foco EXCLUSIVO em médicos.',
  {
    instagram_handle: z.string().describe("@ do Instagram do expert"),
    criteria: z.array(z.string()).optional()
  },
  async (args) => {
    const handle = (args.instagram_handle || "unknown").replace('@', '');
    
    // Check cache first
    const cacheKey = CacheKeys.expertAnalysis(handle);
    const cachedResult = cache.get<any>(cacheKey);

    if (cachedResult) {
      broadcastLog("CACHE", \`✅ Cache HIT: \${handle}\`);
      return { ...cachedResult, _metadata: { ...cachedResult._metadata, cached: true } };
    }

    broadcastLog("CACHE", \`❌ Cache MISS: \${handle}\`);
    broadcastLog("TOOL", \`Analisando expert: \${handle}\`);

    // Simulação - Em produção: Instagram API, Social Blade, HypeAuditor
    const expertData = {
      // Base hardcoded de experts conhecidos
      nandamac: { nome: "Nanda Mac Dowell", nicho: "Vendas High Ticket para Médicos", score: 98 },
      davisoncarvalho: { nome: "Davison Carvalho", nicho: "Modelo de Negócios para Médicos", score: 88 },
      // ... outros experts
    };

    const expert = expertData[handle.toLowerCase()] || { 
      nome: handle, 
      nicho: "Não identificado", 
      score: Math.floor(Math.random() * 30) + 30 
    };

    const result = {
      _metadata: { source: "simulated", cached: false },
      instagram_handle: \`@\${handle}\`,
      analysis: expert,
      match_reasons: expert.score >= 70 ? ["Qualificado"] : [],
      risk_factors: expert.score < 70 ? ["Desqualificado"] : []
    };

    // Save to cache
    cache.set(cacheKey, result, CacheTTL.EXPERT_ANALYSIS);
    broadcastLog("CACHE", \`💾 Salvando no cache: \${handle}\`);

    return result;
  }
);

const sdrMcpServer = createSdkMcpServer({
  name: 'sdr',
  version: '1.0.0',
  tools: [analyzeExpertFit]
});

export async function processAgentMessage(
  userMessage: string,
  systemPrompt: string,
  conversationHistory: any[],
  model?: string,
  customApiKey?: string | null
) {
  // Processa mensagem com Claude Agent SDK
  // Inclui lógica de ferramentas MCP, sessões, sub-agentes
  // Retorna resposta + resultados de ferramentas
}

export { sdrMcpServer };
`,

  "server/cache.ts": `interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) this.cache.delete(key);
    }
  }

  getStats() {
    return { size: this.cache.size, keys: Array.from(this.cache.keys()) };
  }
}

export const cache = new InMemoryCache();

export const CacheKeys = {
  expertAnalysis: (handle: string) => \`expert:analysis:\${handle.toLowerCase()}\`,
  expertContact: (handle: string) => \`expert:contact:\${handle.toLowerCase()}\`,
};

export const CacheTTL = {
  EXPERT_ANALYSIS: 1440, // 24h
  EXPERT_CONTACT: 1440,  // 24h
};
`,

  "server/routes.ts": `import { type Express } from "express";
import { storage } from "./storage";
import { processAgentMessage } from "./claude";
import { broadcastLog } from "./logger";
import { cache } from "./cache";

export async function registerRoutes(httpServer: any, app: Express) {
  // Agent Configs
  app.get("/api/agent-configs/default", async (req, res) => {
    const config = await storage.getDefaultAgentConfig();
    res.json(config);
  });

  // Conversations
  app.post("/api/conversations", async (req, res) => {
    const conversation = await storage.createConversation(req.body);
    res.status(201).json(conversation);
  });

  // Messages
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    const messages = await storage.getMessagesByConversation(req.params.conversationId);
    res.json(messages);
  });

  // Chat with Claude
  app.post("/api/chat", async (req, res) => {
    const { conversationId, message } = req.body;
    broadcastLog("INFO", "Nova mensagem recebida");

    const conversation = await storage.getConversation(conversationId);
    const agentConfig = await storage.getAgentConfig(conversation.agentConfigId);

    const userMessage = await storage.createMessage({
      conversationId,
      role: "user",
      content: message,
      toolUse: null,
    });

    const agentResponse = await processAgentMessage(
      message,
      agentConfig.systemPrompt,
      [],
      agentConfig.model
    );

    const agentMessage = await storage.createMessage({
      conversationId,
      role: "agent",
      content: agentResponse.content,
      toolUse: agentResponse.toolUse || null,
    });

    // Auto-save to ranking
    if (agentResponse.toolUse?.tool.includes("analyze_expert_fit")) {
      const analysis = agentResponse.toolUse.result?.analysis;
      if (analysis) {
        await storage.createExpertRanking({
          instagramHandle: analysis.nome,
          nome: analysis.nome,
          nicho: analysis.nicho,
          score: analysis.score,
          qualified: analysis.score >= 70 ? "SIM" : "NAO",
          analysisData: agentResponse.toolUse.result,
        });
      }
    }

    res.json({ userMessage, agentMessage, toolUse: agentResponse.toolUse });
  });

  // Rankings
  app.get("/api/rankings", async (req, res) => {
    const rankings = await storage.getAllExpertRankings();
    res.json(rankings);
  });

  app.post("/api/rankings", async (req, res) => {
    const ranking = await storage.createExpertRanking(req.body);
    res.status(201).json(ranking);
  });

  app.delete("/api/rankings/:id", async (req, res) => {
    await storage.deleteExpertRanking(req.params.id);
    res.status(204).send();
  });

  // Cache Management
  app.get("/api/cache/stats", async (req, res) => {
    res.json(cache.getStats());
  });

  app.delete("/api/cache/clear", async (req, res) => {
    cache.clear();
    res.json({ message: "Cache cleared" });
  });

  return httpServer;
}
`,

  "client/src/pages/dashboard.tsx": `import Layout from "@/components/layout";
import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchMessages, sendChatMessage } from "@/lib/api";

export default function Dashboard() {
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => conversationId ? fetchMessages(conversationId) : [],
    enabled: !!conversationId,
  });

  const chatMutation = useMutation({
    mutationFn: ({ conversationId, message }) => 
      sendChatMessage(conversationId, message),
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    await chatMutation.mutateAsync({ conversationId, message: input });
    setInput("");
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-4 flex gap-3">
              {msg.role === "user" ? <User /> : <Bot />}
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Analise um expert..."
            className="w-full px-4 py-2 border rounded"
          />
          <button onClick={handleSend}>
            <Send />
          </button>
        </div>
      </div>
    </Layout>
  );
}
`,

  "client/src/pages/analytics.tsx": `import Layout from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { fetchRankings } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

export default function Analytics() {
  const { data: rankings = [] } = useQuery({
    queryKey: ["rankings"],
    queryFn: fetchRankings,
  });

  const qualifiedCount = rankings.filter(r => r.score >= 70).length;
  const avgScore = rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length;

  return (
    <Layout>
      <h1>Analytics Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div>Total: {rankings.length}</div>
        <div>Qualificados: {qualifiedCount}</div>
        <div>Score Médio: {avgScore.toFixed(1)}</div>
      </div>
      <BarChart width={600} height={300} data={rankings}>
        <XAxis dataKey="instagramHandle" />
        <YAxis />
        <Bar dataKey="score" fill="#8884d8" />
      </BarChart>
    </Layout>
  );
}
`,

  "client/src/pages/roadmap.tsx": `import Layout from "@/components/layout";

const roadmapItems = [
  { title: "Instagram Graph API", status: "planned", category: "integration" },
  { title: "Sistema de Cache Redis", status: "completed", category: "improvement" },
  { title: "CRM de Leads", status: "planned", category: "feature" },
  // ... 18 itens total
];

export default function Roadmap() {
  return (
    <Layout>
      <h1>Roadmap de Implementações</h1>
      {roadmapItems.map((item) => (
        <div key={item.title} className="p-4 border rounded mb-2">
          <h3>{item.title}</h3>
          <span>{item.status}</span>
        </div>
      ))}
    </Layout>
  );
}
`,

  "README.md": `# ExpertBot - Agente SDR Inteligente

Sistema de qualificação automatizada de experts high ticket brasileiros usando Claude Agent SDK.

## 🏗️ Arquitetura

**Frontend:** React + TypeScript + TanStack Query + shadcn/ui  
**Backend:** Node.js + Express + Claude Agent SDK  
**Banco:** SQLite + Drizzle ORM  
**Cache:** In-Memory (planejado: Redis)

## 🚀 Funcionalidades

✅ Análise de experts com cache inteligente (24h TTL)  
✅ Auto-save no ranking após análise  
✅ Dashboard com Analytics  
✅ Roadmap de 18 melhorias futuras  
✅ Logs em tempo real (WebSocket)  

## 📦 Instalação

\`\`\`bash
npm install
npm run dev
\`\`\`

Acesse: http://localhost:5000

## 🔧 Variáveis de Ambiente

\`\`\`
ANTHROPIC_API_KEY=sk-ant-...
\`\`\`

## 📊 Próximos Passos

1. Integração Instagram Graph API
2. Sistema de CRM de Leads
3. Pipeline de Vendas Visual
4. Propostas com IA

Ver [Roadmap](/roadmap) completo no sistema.
`
};
