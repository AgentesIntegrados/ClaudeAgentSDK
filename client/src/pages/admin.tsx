import Layout from "@/components/layout";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Key, LogOut, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { isAuthenticated, changePassword, logout } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 4) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 4 caracteres",
        variant: "destructive"
      });
      return;
    }

    const success = changePassword(currentPassword, newPassword);
    if (success) {
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso"
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({
        title: "Erro",
        description: "Senha atual incorreta",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Desconectado",
      description: "Você foi desconectado. Volte ao Chat Principal para entrar novamente."
    });
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>
                Você precisa fazer login no Chat Principal para acessar esta página.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Administração</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações de segurança do sistema.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Alterar Senha
            </CardTitle>
            <CardDescription>
              Atualize a senha de acesso ao sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite a senha atual"
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha (mín. 4 caracteres)"
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                data-testid="input-confirm-password"
              />
              {newPassword && confirmPassword && (
                <div className="flex items-center gap-1 text-sm">
                  {newPassword === confirmPassword ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">Senhas coincidem</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">Senhas não coincidem</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <Button 
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword}
              data-testid="button-change-password"
            >
              Alterar Senha
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Sessão
            </CardTitle>
            <CardDescription>
              Encerre sua sessão atual. Você precisará digitar a senha novamente no Chat Principal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              Sair do Sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
