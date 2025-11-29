import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Server, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  AlertCircle,
  Terminal,
  Globe,
  Wrench,
  Play,
  Settings2
} from "lucide-react";
import type { McpServer } from "@shared/schema";

type TransportType = "stdio" | "http" | "websocket";

interface McpServerFormData {
  name: string;
  description: string;
  transportType: TransportType;
  endpoint: string;
  command: string;
  args: string;
  enabled: boolean;
}

const defaultFormData: McpServerFormData = {
  name: "",
  description: "",
  transportType: "stdio",
  endpoint: "",
  command: "",
  args: "",
  enabled: true
};

export default function McpServers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<McpServerFormData>(defaultFormData);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: servers = [], isLoading } = useQuery<McpServer[]>({
    queryKey: ["/api/mcp-servers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: McpServerFormData) => {
      const body: any = {
        name: data.name,
        description: data.description || null,
        transportType: data.transportType,
        enabled: data.enabled
      };

      if (data.transportType === "stdio") {
        body.command = data.command;
        body.args = data.args ? data.args.split(" ").filter(Boolean) : null;
      } else {
        body.endpoint = data.endpoint;
      }

      const res = await fetch("/api/mcp-servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Failed to create server");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcp-servers"] });
      setIsCreateOpen(false);
      setFormData(defaultFormData);
      toast({ title: "MCP Server criado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao criar MCP Server", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/mcp-servers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete server");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcp-servers"] });
      toast({ title: "MCP Server removido" });
    },
    onError: () => {
      toast({ title: "Erro ao remover MCP Server", variant: "destructive" });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const res = await fetch(`/api/mcp-servers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      });
      if (!res.ok) throw new Error("Failed to update server");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcp-servers"] });
    }
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/mcp-servers/${id}/test`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to test connection");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcp-servers"] });
      toast({ title: data.message });
    },
    onError: () => {
      toast({ title: "Erro ao testar conexão", variant: "destructive" });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Conectado</Badge>;
      case "error":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Erro</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Desconectado</Badge>;
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "stdio":
        return <Terminal className="w-4 h-4" />;
      case "http":
      case "websocket":
        return <Globe className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  const enabledServers = servers.filter(s => s.enabled);
  const disabledServers = servers.filter(s => !s.enabled);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Server className="w-8 h-8 text-primary" />
              MCP Servers
            </h1>
            <p className="text-muted-foreground mt-1">
              Conecte a qualquer MCP Server externo e use suas ferramentas
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-mcp">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Server
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar MCP Server</DialogTitle>
                <DialogDescription>
                  Configure um novo MCP Server para conectar
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: File System, GitHub, Slack..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="input-mcp-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Input
                    id="description"
                    placeholder="Breve descrição do servidor"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="input-mcp-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transportType">Tipo de Transporte</Label>
                  <Select
                    value={formData.transportType}
                    onValueChange={(value: TransportType) => setFormData({ ...formData, transportType: value })}
                  >
                    <SelectTrigger data-testid="select-transport-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stdio">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4" />
                          <span>stdio (comando local)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="http">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>HTTP (REST API)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="websocket">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>WebSocket</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.transportType === "stdio" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="command">Comando</Label>
                      <Input
                        id="command"
                        placeholder="Ex: npx, node, python..."
                        value={formData.command}
                        onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                        data-testid="input-mcp-command"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="args">Argumentos (separados por espaço)</Label>
                      <Input
                        id="args"
                        placeholder="Ex: -y @modelcontextprotocol/server-filesystem /tmp"
                        value={formData.args}
                        onChange={(e) => setFormData({ ...formData, args: e.target.value })}
                        data-testid="input-mcp-args"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">URL do Endpoint</Label>
                    <Input
                      id="endpoint"
                      placeholder={formData.transportType === "websocket" ? "wss://..." : "https://..."}
                      value={formData.endpoint}
                      onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                      data-testid="input-mcp-endpoint"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="enabled">Ativar após criar</Label>
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                    data-testid="switch-mcp-enabled"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => createMutation.mutate(formData)}
                  disabled={!formData.name || createMutation.isPending}
                  data-testid="button-create-mcp"
                >
                  {createMutation.isPending ? "Criando..." : "Criar Server"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Server className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{servers.length}</div>
                  <div className="text-xs text-muted-foreground">Total de Servers</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Wifi className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{enabledServers.length}</div>
                  <div className="text-xs text-muted-foreground">Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Wrench className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {servers.reduce((acc, s) => acc + ((s.discoveredTools as any[])?.length || 0), 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Tools Disponíveis</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Servers List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Carregando servers...
            </CardContent>
          </Card>
        ) : servers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum MCP Server configurado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione um MCP Server para começar a usar ferramentas externas
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar primeiro Server
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {servers.map((server) => (
              <Card 
                key={server.id}
                className={`transition-all ${
                  server.enabled ? "border-primary/20" : "opacity-60"
                }`}
                data-testid={`mcp-server-${server.id}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${
                        server.status === "connected" ? "bg-green-500/10" :
                        server.status === "error" ? "bg-red-500/10" : "bg-muted"
                      }`}>
                        {getStatusIcon(server.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="font-semibold text-lg">{server.name}</h3>
                          {getStatusBadge(server.status)}
                          <Badge variant="outline" className="text-xs">
                            {getTransportIcon(server.transportType)}
                            <span className="ml-1">{server.transportType.toUpperCase()}</span>
                          </Badge>
                        </div>
                        
                        {server.description && (
                          <p className="text-sm text-muted-foreground mb-2">{server.description}</p>
                        )}

                        <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded inline-block">
                          {server.transportType === "stdio" 
                            ? `${server.command} ${(server.args as string[])?.join(" ") || ""}`
                            : server.endpoint
                          }
                        </div>

                        {server.lastError && (
                          <div className="mt-2 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                            Erro: {server.lastError}
                          </div>
                        )}

                        {(server.discoveredTools as any[])?.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-muted-foreground mb-1">
                              Tools disponíveis ({(server.discoveredTools as any[]).length}):
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(server.discoveredTools as any[]).slice(0, 5).map((tool: any, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  <Wrench className="w-3 h-3 mr-1" />
                                  {tool.name || tool}
                                </Badge>
                              ))}
                              {(server.discoveredTools as any[]).length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{(server.discoveredTools as any[]).length - 5} mais
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={server.enabled}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: server.id, enabled: checked })}
                        data-testid={`toggle-mcp-${server.id}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => testMutation.mutate(server.id)}
                        disabled={testMutation.isPending}
                        data-testid={`test-mcp-${server.id}`}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => deleteMutation.mutate(server.id)}
                        data-testid={`delete-mcp-${server.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              Como usar MCP Servers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>1. stdio (recomendado):</strong> Execute um comando local como <code className="bg-muted px-1 rounded">npx -y @modelcontextprotocol/server-filesystem /tmp</code>
            </p>
            <p>
              <strong>2. HTTP:</strong> Conecte a uma API REST que implementa o protocolo MCP
            </p>
            <p>
              <strong>3. WebSocket:</strong> Conexão persistente via WebSocket para comunicação bidirecional
            </p>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="font-medium text-foreground mb-2">Exemplos de MCP Servers populares:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><code className="text-xs">@modelcontextprotocol/server-filesystem</code> - Acesso a arquivos</li>
                <li><code className="text-xs">@modelcontextprotocol/server-github</code> - GitHub API</li>
                <li><code className="text-xs">@modelcontextprotocol/server-slack</code> - Slack API</li>
                <li><code className="text-xs">@modelcontextprotocol/server-postgres</code> - PostgreSQL</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
