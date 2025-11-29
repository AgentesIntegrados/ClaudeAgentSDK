import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { McpServer } from "@shared/schema";
import { storage } from "./storage";

interface McpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

interface ConnectedServer {
  client: Client;
  transport: StreamableHTTPClientTransport | StdioClientTransport;
  tools: McpTool[];
  serverId: string;
  serverName: string;
}

class McpConnectionManager {
  private connections: Map<string, ConnectedServer> = new Map();

  async connectToServer(server: McpServer): Promise<{ success: boolean; tools?: McpTool[]; error?: string }> {
    try {
      if (this.connections.has(server.id)) {
        await this.disconnectServer(server.id);
      }

      let transport: StreamableHTTPClientTransport | StdioClientTransport;

      if (server.transportType === "http" || server.transportType === "websocket") {
        if (!server.endpoint) {
          throw new Error("Endpoint is required for HTTP/WebSocket transport");
        }
        transport = new StreamableHTTPClientTransport(new URL(server.endpoint));
      } else if (server.transportType === "stdio") {
        if (!server.command) {
          throw new Error("Command is required for stdio transport");
        }
        const args = server.args || [];
        const env = server.env as Record<string, string> | undefined;
        transport = new StdioClientTransport({
          command: server.command,
          args,
          env
        });
      } else {
        throw new Error(`Unsupported transport type: ${server.transportType}`);
      }

      const client = new Client({
        name: "Claude Agent Architect",
        version: "1.0.0"
      });

      await client.connect(transport);

      const toolsResponse = await client.listTools();
      const tools: McpTool[] = (toolsResponse.tools || []).map((t: any) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
      }));

      this.connections.set(server.id, {
        client,
        transport,
        tools,
        serverId: server.id,
        serverName: server.name
      });

      await storage.updateMcpServer(server.id, {
        status: "connected",
        lastError: null,
        discoveredTools: tools,
        lastConnected: new Date()
      });

      console.log(`[MCP] Connected to ${server.name}, discovered ${tools.length} tools:`, tools.map(t => t.name));

      return { success: true, tools };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[MCP] Failed to connect to ${server.name}:`, errorMessage);

      await storage.updateMcpServer(server.id, {
        status: "error",
        lastError: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  async disconnectServer(serverId: string): Promise<void> {
    const connection = this.connections.get(serverId);
    if (connection) {
      try {
        await connection.client.close();
      } catch (error) {
        console.error(`[MCP] Error disconnecting server ${serverId}:`, error);
      }
      this.connections.delete(serverId);
      
      await storage.updateMcpServer(serverId, {
        status: "disconnected"
      });
    }
  }

  async callTool(serverId: string, toolName: string, args: Record<string, unknown>): Promise<any> {
    const connection = this.connections.get(serverId);
    if (!connection) {
      throw new Error(`Server ${serverId} is not connected`);
    }

    try {
      const result = await connection.client.callTool({
        name: toolName,
        arguments: args
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[MCP] Error calling tool ${toolName} on server ${serverId}:`, errorMessage);
      throw error;
    }
  }

  getConnectedServers(): ConnectedServer[] {
    return Array.from(this.connections.values());
  }

  getAllTools(): Array<{ serverId: string; serverName: string; tool: McpTool }> {
    const allTools: Array<{ serverId: string; serverName: string; tool: McpTool }> = [];
    for (const connection of Array.from(this.connections.values())) {
      for (const tool of connection.tools) {
        allTools.push({
          serverId: connection.serverId,
          serverName: connection.serverName,
          tool
        });
      }
    }
    return allTools;
  }

  isConnected(serverId: string): boolean {
    return this.connections.has(serverId);
  }

  async connectAllEnabledServers(): Promise<void> {
    const enabledServers = await storage.getEnabledMcpServers();
    console.log(`[MCP] Connecting to ${enabledServers.length} enabled servers...`);
    
    for (const server of enabledServers) {
      await this.connectToServer(server);
    }
  }

  async refreshServerConnection(serverId: string): Promise<{ success: boolean; tools?: McpTool[]; error?: string }> {
    const server = await storage.getMcpServer(serverId);
    if (!server) {
      return { success: false, error: "Server not found" };
    }
    return this.connectToServer(server);
  }
}

export const mcpManager = new McpConnectionManager();
