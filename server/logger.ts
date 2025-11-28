import { WebSocket } from "ws";

const logClients = new Set<WebSocket>();

export function addLogClient(ws: WebSocket) {
  logClients.add(ws);
}

export function removeLogClient(ws: WebSocket) {
  logClients.delete(ws);
}

export function broadcastLog(level: string, message: string, details?: unknown) {
  const logEntry = {
    type: "log",
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    level,
    message,
    details
  };
  
  const payload = JSON.stringify(logEntry);
  logClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export function getClientCount(): number {
  return logClients.size;
}
