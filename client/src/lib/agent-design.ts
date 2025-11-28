
export const PROJECT_STRUCTURE = [
  {
    name: "src",
    type: "folder",
    children: [
      { name: "agent.py", type: "file", language: "python" },
      { name: "__init__.py", type: "file", language: "python" },
      {
        name: "tools",
        type: "folder",
        children: [
          { name: "sdr.py", type: "file", language: "python" },
          { name: "__init__.py", type: "file", language: "python" },
        ]
      }
    ]
  },
  {
    name: "config",
    type: "folder",
    children: [
      { name: "system_prompt.md", type: "file", language: "markdown" },
      { name: "settings.yaml", type: "file", language: "yaml" },
    ]
  },
  { name: "main.py", type: "file", language: "python" },
  { name: ".env.example", type: "file", language: "plaintext" },
  { name: "requirements.txt", type: "file", language: "plaintext" },
  { name: "README.md", type: "file", language: "markdown" },
];

export const FILE_CONTENTS: Record<string, string> = {
  "main.py": `import asyncio
import argparse
import os
import logging
from dotenv import load_dotenv
from src.agent import ClaudeAgent
from config.settings import load_settings

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    parser = argparse.ArgumentParser(description="Claude Agent Runner")
    parser.add_argument("--mode", choices=["chat", "single"], default="chat", help="Interaction mode")
    parser.add_argument("--query", type=str, help="Query for single mode")
    args = parser.parse_args()

    # Load environment variables
    load_dotenv()
    if not os.getenv("ANTHROPIC_API_KEY"):
        logger.error("ANTHROPIC_API_KEY not found in environment variables")
        return

    # Initialize Agent
    settings = load_settings()
    agent = ClaudeAgent(
        model="claude-3-5-sonnet-20240620",
        system_prompt_path="config/system_prompt.md",
        settings=settings
    )

    print("🤖 Claude Agent Initialized")
    
    if args.mode == "single":
        if not args.query:
            logger.error("Query required for single mode")
            return
        response = await agent.process(args.query)
        print(f"Response: {response}")
        
    elif args.mode == "chat":
        print("Type 'exit' to quit")
        while True:
            user_input = input("You: ")
            if user_input.lower() in ["exit", "quit"]:
                break
            
            try:
                async for chunk in agent.stream_process(user_input):
                    print(chunk, end="", flush=True)
                print() # Newline
            except Exception as e:
                logger.error(f"Error processing request: {e}")

if __name__ == "__main__":
    asyncio.run(main())
`,

  "src/agent.py": `import os
from typing import List, Optional, AsyncGenerator
from anthropic import AsyncAnthropic
from claude_agent_sdk.agent import Agent
from claude_agent_sdk.tools import Tool
from src.tools.sdr import LeadQualifierTool

class ClaudeAgent:
    def __init__(self, model: str, system_prompt_path: str, settings: dict):
        self.client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = model
        self.settings = settings
        
        # Load System Prompt
        with open(system_prompt_path, 'r') as f:
            self.system_prompt = f.read()
            
        # Register Tools
        self.tools: List[Tool] = [
            LeadQualifierTool()
        ]
        
    async def process(self, user_input: str) -> str:
        """Process a single query non-interactively"""
        messages = [{"role": "user", "content": user_input}]
        
        # SDK abstraction would handle the tool loop here
        # This is a simplified representation
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=self.settings.get("max_tokens", 4096),
            system=self.system_prompt,
            messages=messages,
            tools=[t.to_dict() for t in self.tools]
        )
        
        return response.content[0].text

    async def stream_process(self, user_input: str) -> AsyncGenerator[str, None]:
        """Stream the response"""
        # Implementation of streaming with tool use loop
        pass
`,

  "src/tools/sdr.py": `from typing import Dict, Any
from claude_agent_sdk.decorators import tool

class LeadQualifierTool:
    """
    Tools for qualifying leads based on company data and criteria.
    """

    @tool
    def analyze_company_fit(self, company_domain: str, criteria: list[str]) -> Dict[str, Any]:
        """
        Analyzes a company's public data to check if it fits the ICP (Ideal Customer Profile).
        
        Args:
            company_domain: The website domain of the company (e.g., 'example.com')
            criteria: List of qualification criteria (e.g., ['B2B', 'Series B+', 'US-based'])
        """
        # Mock implementation of a search/enrichment call
        print(f"🔍 Analyzing {company_domain} against {criteria}...")
        
        return {
            "company": company_domain,
            "score": 85,
            "match_reasons": [
                "Technographic match: Uses Python",
                "Funding: Series B detected",
                "Location: San Francisco, CA"
            ],
            "risk_factors": [
                "Recent layoff news detected"
            ],
            "qualified": True
        }

    @tool
    def get_decision_maker(self, company_domain: str, role: str) -> Dict[str, str]:
        """Finds the likely decision maker for a specific role at a company."""
        return {
            "name": "Sarah Chen",
            "title": "VP of Engineering",
            "linkedin": f"linkedin.com/in/sarah-chen-{company_domain.split('.')[0]}"
        }
`,

  "config/system_prompt.md": `# Role
You are an expert SDR (Sales Development Representative) Agent named "QualifyBot".

# Objective
Your goal is to qualify incoming leads by analyzing their company data and determining if they are a good fit for our Enterprise Python SDK.

# Capabilities
- You have access to 'analyze_company_fit' to check firmographics.
- You have access to 'get_decision_maker' to find contact info.

# Constraints
- Be professional and concise.
- Always cite the reason for qualification.
- If a company is not qualified, politely explain why.
`,

  "config/settings.yaml": `permission_mode: "ask"
max_turns: 10
allowed_tools:
  - "analyze_company_fit"
  - "get_decision_maker"
logging:
  level: "INFO"
  file: "agent.log"
`,

  "requirements.txt": `anthropic>=0.18.0
claude-agent-sdk>=0.1.0
python-dotenv>=1.0.0
anyio>=4.0.0
pyyaml>=6.0
`,

  ".env.example": `ANTHROPIC_API_KEY=sk-ant-api03-...
LOG_LEVEL=INFO
ENVIRONMENT=development
`,

  "README.md": `# Claude SDR Agent

A custom AI agent built with the Claude Agent SDK for qualifying sales leads.

## Setup

1. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

2. Configure environment:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your ANTHROPIC_API_KEY
   \`\`\`

## Usage

**Chat Mode:**
\`\`\`bash
python main.py --mode chat
\`\`\`

**Single Query:**
\`\`\`bash
python main.py --mode single --query "Qualify replit.com for our Enterprise plan"
\`\`\`

## Architecture
See 'src/' for agent logic and 'src/tools/' for custom MCP tools.
`
};
