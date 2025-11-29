import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  getStoredPassword: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_PASSWORD = "admin123";
const PASSWORD_KEY = "app_password";
const AUTH_KEY = "app_authenticated";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === "true") {
      setIsAuthenticated(true);
    }
    if (!localStorage.getItem(PASSWORD_KEY)) {
      localStorage.setItem(PASSWORD_KEY, DEFAULT_PASSWORD);
    }
  }, []);

  const getStoredPassword = () => {
    return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
  };

  const login = (password: string): boolean => {
    const storedPassword = getStoredPassword();
    if (password === storedPassword) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    const storedPassword = getStoredPassword();
    if (currentPassword === storedPassword && newPassword.length >= 4) {
      localStorage.setItem(PASSWORD_KEY, newPassword);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword, getStoredPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
