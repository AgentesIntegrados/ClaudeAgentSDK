import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileCode, 
  Terminal, 
  Settings, 
  Bot, 
  Menu,
  X,
  BarChart3,
  Beaker,
  Server,
  Shield,
  Lock
} from "lucide-react";
import { useState, memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const NavItem = memo(({ item, isActive, locked }: { item: any; isActive: boolean; locked: boolean }) => {
  if (locked) {
    return (
      <div 
        className="flex items-center px-4 py-3 rounded-md text-sm font-medium text-muted-foreground/50 cursor-not-allowed select-none"
      >
        <Lock className="w-4 h-4 mr-3 opacity-50" />
        <span className="opacity-50">{item.label}</span>
      </div>
    );
  }
  
  return (
    <Link 
      href={item.href}
      className={cn(
        "flex items-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 group cursor-pointer",
        isActive 
          ? "bg-sidebar-accent text-primary shadow-sm" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
      )}
    >
      <item.icon className={cn(
        "w-5 h-5 mr-3 transition-colors",
        isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-foreground"
      )} />
      {item.label}
    </Link>
  );
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const navItems = useMemo(() => [
    { href: "/", icon: LayoutDashboard, label: "Chat Principal", requiresAuth: false },
    { href: "/architecture", icon: FileCode, label: "Especificação de Arquitetura", requiresAuth: true },
    { href: "/terminal", icon: Terminal, label: "Logs em Tempo Real", requiresAuth: true },
    { href: "/roadmap", icon: Bot, label: "Roadmap", requiresAuth: true },
    { href: "/settings", icon: Settings, label: "Configurações", requiresAuth: true },
    { href: "/analytics", icon: BarChart3, label: "Analytics", requiresAuth: true },
    { href: "/validation", icon: Beaker, label: "Validação do Agente", requiresAuth: true },
    { href: "/mcp-servers", icon: Server, label: "MCP Servers", requiresAuth: true },
    { href: "/admin", icon: Shield, label: "Admin", requiresAuth: true },
  ], []);

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-primary/20 selection:text-primary">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Bot className="w-6 h-6 text-primary mr-3" />
          <span className="font-bold text-lg tracking-tight">Agent Console</span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.href} 
              item={item} 
              isActive={location === item.href}
              locked={item.requiresAuth && !isAuthenticated}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="bg-sidebar-accent/50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              <span className="text-xs font-medium text-muted-foreground">Sistema Online</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">v0.0.1-beta</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center px-4 border-b border-border bg-background">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-accent text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-bold">Agent Console</span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}