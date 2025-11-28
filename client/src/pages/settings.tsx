import Layout from "@/components/layout";
import { Save, RotateCcw } from "lucide-react";

export default function Settings() {
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
                    defaultValue="QualifyBot"
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Modelo</label>
                  <select className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none">
                    <option>claude-3-5-sonnet-20240620</option>
                    <option>claude-3-opus-20240229</option>
                    <option>claude-3-haiku-20240307</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">System Prompt</label>
                <textarea 
                  className="w-full h-32 bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none font-mono"
                  defaultValue={`You are an expert SDR (Sales Development Representative) Agent named "QualifyBot".\nYour goal is to qualify incoming leads by analyzing their company data.`}
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
                <select className="bg-secondary border-none rounded text-sm px-2 py-1">
                  <option>Perguntar ao Usuário</option>
                  <option>Permitir Automaticamente</option>
                  <option>Negar Tudo</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Limite de Turnos</div>
                  <div className="text-xs text-muted-foreground">Máximo de interações por sessão</div>
                </div>
                <input 
                  type="number" 
                  defaultValue={10}
                  className="w-20 bg-secondary border-none rounded text-sm px-2 py-1 text-right"
                />
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Chaves de API</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Anthropic API Key</label>
                <input 
                  type="password" 
                  defaultValue="sk-ant-api03-..."
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar Padrões
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
