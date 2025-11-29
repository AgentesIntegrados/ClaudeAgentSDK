import Layout from "@/components/layout";
import { Save, RotateCcw, Key, Eye, EyeOff, CheckCircle2, Activity, Code2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDefaultAgentConfig, updateAgentConfig } from "@/lib/api";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Database } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);

  const { data: agentConfig, isLoading } = useQuery({
    queryKey: ["agent-config", "default"],
    queryFn: fetchDefaultAgentConfig,
  });

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    systemPrompt: "",
    permissionMode: "",
    maxTurns: 10,
    customApiKey: "",
  });

  useEffect(() => {
    if (agentConfig) {
      setFormData({
        name: agentConfig.name,
        model: agentConfig.model,
        systemPrompt: agentConfig.systemPrompt,
        permissionMode: agentConfig.permissionMode,
        maxTurns: agentConfig.maxTurns,
        customApiKey: agentConfig.customApiKey || "",
      });
    }
  }, [agentConfig]);

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<typeof formData>) => 
      updateAgentConfig(agentConfig!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-config"] });
      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleReset = () => {
    if (agentConfig) {
      setFormData({
        name: agentConfig.name,
        model: agentConfig.model,
        systemPrompt: agentConfig.systemPrompt,
        permissionMode: agentConfig.permissionMode,
        maxTurns: agentConfig.maxTurns,
        customApiKey: agentConfig.customApiKey || "",
      });
    }
  };

  const handleClearCustomKey = () => {
    setFormData({ ...formData, customApiKey: "" });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando configurações...</div>
        </div>
      </Layout>
    );
  }

  const hasCustomKey = formData.customApiKey && formData.customApiKey.length > 0;
  const hasDefaultKey = true; // We have a default key configured via env var

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie o comportamento do agente, permissões e chaves de API.
          </p>
        </div>

        <div className="space-y-6">
          {/* Agent Status */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Status do Agente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <span className="text-sm text-muted-foreground">Estado</span>
                <span className="flex items-center text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 animate-pulse" />
                  Ativo
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <span className="text-sm text-muted-foreground">Modelo</span>
                <span className="font-mono text-xs">{agentConfig?.model || "carregando..."}</span>
              </div>
            </div>

            {/* MCP Tools */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Code2 className="w-4 h-4 mr-2 text-primary" />
                Ferramentas MCP Ativas
              </h3>
              <div className="space-y-2">
                {(agentConfig?.allowedTools || []).map((tool) => {
                  const baseTool = tool.startsWith("mcp__") ? tool.split("__").pop() : tool;
                  const mcpName = tool.startsWith("mcp__") ? tool : `mcp__sdr__${tool}`;
                  return (
                    <div key={tool} className="flex items-center justify-between bg-background/50 p-3 rounded border border-border/50">
                      <div>
                        <span className="font-mono text-xs text-primary">{mcpName}</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {baseTool === "analyze_company_fit" && "Analisa dados públicos da empresa para verificar ICP"}
                          {baseTool === "get_decision_maker" && "Encontra tomadores de decisão por cargo"}
                          {baseTool === "web_search" && "Busca informações na web"}
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Formato: <code className="bg-secondary px-1 rounded">mcp__&lt;server&gt;__&lt;tool&gt;</code> (padrão Claude Agent SDK)
              </p>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Geral</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Agente</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                    data-testid="input-agent-name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Modelo</label>
                  <select 
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                    data-testid="select-model"
                  >
                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (Recomendado)</option>
                    <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                    <option value="claude-3-opus-20240229">claude-3-opus-20240229</option>
                    <option value="claude-3-haiku-20240307">claude-3-haiku-20240307</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">System Prompt</label>
                <textarea 
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  className="w-full h-32 bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none font-mono"
                  data-testid="textarea-system-prompt"
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Permissões & Segurança</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Modo de Permissão</div>
                  <div className="text-xs text-muted-foreground">Como o agente deve lidar com uso de ferramentas</div>
                </div>
                <select 
                  value={formData.permissionMode}
                  onChange={(e) => setFormData({ ...formData, permissionMode: e.target.value })}
                  className="bg-secondary border-none rounded text-sm px-2 py-1"
                  data-testid="select-permission-mode"
                >
                  <option value="ask">Perguntar ao Usuário</option>
                  <option value="allow">Permitir Automaticamente</option>
                  <option value="deny">Negar Tudo</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Limite de Turnos</div>
                  <div className="text-xs text-muted-foreground">Máximo de interações por sessão</div>
                </div>
                <input 
                  type="number" 
                  value={formData.maxTurns}
                  onChange={(e) => setFormData({ ...formData, maxTurns: parseInt(e.target.value) })}
                  className="w-20 bg-secondary border-none rounded text-sm px-2 py-1 text-right"
                  data-testid="input-max-turns"
                />
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2 text-primary" />
              Chaves de API
            </h2>
            <div className="space-y-4">
              {/* Default Key Status */}
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  <div>
                    <div className="font-medium text-sm text-green-400">Chave Padrão Configurada</div>
                    <div className="text-xs text-muted-foreground">
                      Uma chave de API está configurada como padrão do sistema
                    </div>
                  </div>
                </div>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  Ativa
                </span>
              </div>

              {/* Custom Key Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Chave de API Personalizada (opcional)</label>
                <div className="relative">
                  <input 
                    type={showApiKey ? "text" : "password"}
                    value={formData.customApiKey}
                    onChange={(e) => setFormData({ ...formData, customApiKey: e.target.value })}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 pr-20 text-sm focus:border-primary outline-none font-mono"
                    placeholder="sk-ant-api03-..."
                    data-testid="input-custom-api-key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-key-visibility"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Se preenchida, esta chave será usada em vez da chave padrão do sistema.
                </p>

                {hasCustomKey && (
                  <button
                    onClick={handleClearCustomKey}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    data-testid="button-clear-custom-key"
                  >
                    Limpar chave personalizada (usar padrão)
                  </button>
                )}
              </div>

              {/* Current Status */}
              <div className="p-3 bg-secondary/50 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chave em uso:</span>
                  <span className={hasCustomKey ? "text-blue-400" : "text-green-400"}>
                    {hasCustomKey ? "Personalizada" : "Padrão do Sistema"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cache Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                <CardTitle>Sistema de Cache</CardTitle>
              </div>
              <CardDescription>
                Gerenciar cache em memória para otimizar performance e reduzir custos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CacheStats />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={handleReset}
              className="flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-reset"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar Padrões
            </button>
            <button 
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              data-testid="button-save"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function CacheStats() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/cache/stats"],
    refetchInterval: 5000, // Auto-refresh every 5s
  });

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/cache/clear", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear cache");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Cache limpo com sucesso");
      queryClient.invalidateQueries({ queryKey: ["/api/cache/stats"] });
    },
    onError: () => {
      toast.error("Erro ao limpar cache");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando estatísticas...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Entradas em Cache</div>
          <div className="text-2xl font-bold">{stats?.size || 0}</div>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">TTL Padrão</div>
          <div className="text-2xl font-bold">24h</div>
        </div>
      </div>

      {stats?.keys && stats.keys.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">Chaves em Cache:</div>
          <div className="bg-muted p-3 rounded-lg max-h-40 overflow-y-auto">
            <ul className="text-xs font-mono space-y-1">
              {stats.keys.map((key: string) => (
                <li key={key} className="text-muted-foreground">{key}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Button
        variant="destructive"
        size="sm"
        onClick={() => clearCacheMutation.mutate()}
        disabled={clearCacheMutation.isPending || stats?.size === 0}
      >
        {clearCacheMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Limpando...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Cache
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
        <strong>ℹ️ Como funciona:</strong>
        <ul className="mt-2 space-y-1 ml-4 list-disc">
          <li>Análises de experts são cacheadas por 24h</li>
          <li>Dados de contato são cacheados por 24h</li>
          <li>Reduz chamadas à API Claude e custos</li>
          <li>Limpeza automática a cada 10 minutos</li>
        </ul>
      </div>
    </div>
  );
}