# Overview

Claude Agent Architect is a full-stack web application that provides an interactive interface for designing, configuring, and managing Claude AI agents using the Anthropic Claude Agent SDK. The application enables users to create custom AI agents with specialized capabilities, manage conversations, and monitor agent interactions in real-time through a modern web interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state
- **UI Components:** Radix UI primitives with shadcn/ui component library
- **Styling:** Tailwind CSS v4 with custom theme configuration
- **Build Tool:** Vite with custom plugins for development experience

**Design Pattern:**
The frontend follows a component-based architecture with a dark "Agent Lab" aesthetic theme. The application uses a declarative data-fetching pattern through React Query, eliminating the need for manual loading states and cache management.

**Key Architectural Decisions:**
- **Radix UI + shadcn/ui:** Chosen for accessible, unstyled primitives that can be customized to match the dark theme while maintaining WCAG compliance
- **Wouter over React Router:** Selected for smaller bundle size and simpler API suitable for this application's routing needs
- **TanStack Query:** Provides automatic background refetching, caching, and synchronization of server state without Redux complexity

## Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Real-time Communication:** WebSocket (ws library) for live log streaming
- **Build Process:** esbuild for production bundling with dependency allowlisting

**Design Pattern:**
The backend implements a RESTful API architecture with WebSocket endpoints for real-time features. The server bundles select dependencies to reduce cold start times in production environments.

**Key Architectural Decisions:**
- **Express over Fastify/Hapi:** Chosen for ecosystem maturity and middleware compatibility
- **Drizzle ORM:** Selected over Prisma for better TypeScript inference, smaller bundle size, and SQL-like query syntax
- **Selective Bundling:** Common dependencies (listed in `allowlist`) are bundled to reduce filesystem syscalls during cold starts, improving serverless deployment performance
- **WebSocket for Logs:** Provides real-time log streaming to frontend without polling overhead

## Data Storage

**Database:**
- **PostgreSQL** via Neon Database serverless driver
- Uses WebSocket connection for serverless compatibility

**Schema Design:**
The database schema supports four main entities:

1. **users** - User authentication and identity
2. **agentConfigs** - Agent configuration templates with system prompts, permissions, and tool access
3. **conversations** - Chat sessions linked to specific agent configurations
4. **messages** - Individual messages within conversations, supporting both user and agent roles with tool execution metadata

**Key Architectural Decisions:**
- **Neon Serverless Driver:** Chosen for WebSocket-based connection pooling, eliminating traditional connection pool exhaustion in serverless environments
- **UUID Primary Keys:** Using PostgreSQL's `gen_random_uuid()` for distributed-system-friendly identifiers
- **JSON Storage for Tool Data:** `toolUse` field uses JSONB for flexible storage of tool execution details without schema migrations

## External Dependencies

**AI/ML Services:**
- **Anthropic Claude API** - Core AI agent functionality via `@anthropic-ai/sdk`
  - Supports custom API keys per agent configuration
  - Default model: `claude-sonnet-4-20250514`
  - Implements specialized SDR (Sales Development Representative) tools for company analysis

**Database Services:**
- **Neon Database** - Serverless PostgreSQL with WebSocket support
  - Configured via `DATABASE_URL` environment variable
  - Uses `@neondatabase/serverless` driver with ws protocol

**Development Tools:**
- **Replit Platform Integrations:**
  - `@replit/vite-plugin-cartographer` - Development navigation
  - `@replit/vite-plugin-dev-banner` - Development mode indicator
  - `@replit/vite-plugin-runtime-error-modal` - Enhanced error reporting
  - Custom `vite-plugin-meta-images` - Automatic OpenGraph image URL configuration for Replit deployments

**Third-party UI Libraries:**
- **Radix UI** - Comprehensive set of unstyled, accessible component primitives
- **Lucide React** - Icon library
- **Framer Motion** - Animation library for UI transitions
- **react-syntax-highlighter** - Code syntax highlighting for architecture specifications

**Key Integration Decisions:**
- **Environment-based API Keys:** Supports both global (`ANTHROPIC_API_KEY`) and per-agent custom API keys for multi-tenant scenarios
- **Replit-specific Optimizations:** Custom Vite plugins detect Replit environment and inject appropriate development tools
- **WebSocket Protocol Abstraction:** The `ws` library is injected into Neon driver to enable WebSocket connections in Node.js environments