import { storage } from "./storage";
import { mcpManager } from "./mcp-manager";
import { broadcastLog } from "./logger";

const DEFAULT_MCP_SERVERS = [
  {
    name: "Sequential Thinking",
    description: "Smithery AI Sequential Thinking - Dynamic and reflective problem-solving through structured reasoning",
    transportType: "http" as const,
    endpoint: "https://server.smithery.ai/@smithery-ai/server-sequential-thinking/mcp?api_key=a2e9f1a1-c4d0-4c00-b3e4-f3e9e2040201&profile=nau1111l",
    enabled: true
  }
];

export async function seedMcpServers(): Promise<void> {
  console.log("[MCP Seed] Checking for default MCP servers...");
  
  const existingServers = await storage.getAllMcpServers();
  
  for (const defaultServer of DEFAULT_MCP_SERVERS) {
    const exists = existingServers.some(s => s.name === defaultServer.name);
    
    if (!exists) {
      console.log(`[MCP Seed] Creating default server: ${defaultServer.name}`);
      await storage.createMcpServer(defaultServer);
      broadcastLog("MCP", `Servidor padrão criado: ${defaultServer.name}`);
    } else {
      console.log(`[MCP Seed] Server already exists: ${defaultServer.name}`);
    }
  }
}

export async function initializeMcpConnections(): Promise<void> {
  console.log("[MCP] Initializing MCP connections...");
  
  try {
    await mcpManager.connectAllEnabledServers();
    const connectedServers = mcpManager.getConnectedServers();
    const totalTools = mcpManager.getAllTools().length;
    
    console.log(`[MCP] Connected to ${connectedServers.length} servers with ${totalTools} total tools`);
    broadcastLog("MCP", `Conectado a ${connectedServers.length} servidores MCP com ${totalTools} ferramentas`);
  } catch (error) {
    console.error("[MCP] Error initializing connections:", error);
  }
}
