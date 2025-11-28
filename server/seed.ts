import { storage } from "./storage";

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // Verifica se já existe configuração
    const existing = await storage.getDefaultAgentConfig();
    
    if (!existing) {
      // Cria configuração padrão do agente
      const defaultConfig = await storage.createAgentConfig({
        name: "QualifyBot",
        model: "claude-sonnet-4-20250514",
        systemPrompt: `# Role
Você é um Agente SDR (Sales Development Representative) especialista chamado "QualifyBot".

# Objetivo
Seu objetivo é qualificar leads entrantes analisando dados da empresa e determinando se eles são uma boa opção para nosso SDK Python Enterprise.

# Capacidades
- Você tem acesso a 'analyze_company_fit' para verificar firmográficos.
- Você tem acesso a 'get_decision_maker' para encontrar informações de contato.

# Restrições
- Seja profissional e conciso.
- Sempre cite o motivo da qualificação.
- Se uma empresa não for qualificada, explique educadamente o porquê.`,
        permissionMode: "allow",
        maxTurns: 10,
        allowedTools: ["analyze_company_fit", "get_decision_maker", "web_search"]
      });

      console.log("✅ Configuração padrão criada:", defaultConfig.id);
    } else {
      console.log("ℹ️  Configuração padrão já existe");
    }

    console.log("🎉 Seed concluído!");
  } catch (error) {
    console.error("❌ Erro no seed:", error);
    throw error;
  }
}

seed().catch(console.error);
