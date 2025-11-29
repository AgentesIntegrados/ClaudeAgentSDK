import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";

// Lazy load páginas para melhor performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Architecture = lazy(() => import("@/pages/architecture"));
const LiveLogs = lazy(() => import("@/pages/terminal"));
const Settings = lazy(() => import("@/pages/settings"));
const Roadmap = lazy(() => import("@/pages/roadmap"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Validation = lazy(() => import("@/pages/validation"));
const McpServers = lazy(() => import("@/pages/mcp-servers"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Componente de loading
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/architecture" component={Architecture} />
        <Route path="/terminal" component={LiveLogs} />
        <Route path="/roadmap" component={Roadmap} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/validation" component={Validation} />
        <Route path="/mcp-servers" component={McpServers} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;