import Layout from "@/components/layout";
import { Save, RotateCcw, Key, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDefaultAgentConfig, updateAgentConfig } from "@/lib/api";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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
