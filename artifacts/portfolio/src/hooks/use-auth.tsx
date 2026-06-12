import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetAdminMe, getAdminMe } from "@workspace/api-client-react";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("portfolio_token"));
  const [, setLocation] = useLocation();

  const { data: admin, isError } = useGetAdminMe({
    query: {
      enabled: !!token,
      queryKey: ["admin_me", token] as any, // Using simple custom key to refresh on token change
      retry: false,
    },
    request: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError]);

  const login = (newToken: string) => {
    localStorage.setItem("portfolio_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("portfolio_token");
    setToken(null);
    setLocation("/admin/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!admin, token, login, logout }}>
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
