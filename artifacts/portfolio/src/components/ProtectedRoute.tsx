import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [, setLocation] = useLocation();

  // If there's no token, redirect immediately
  if (!token) {
    setLocation("/admin/login");
    return null;
  }

  // If token exists but we haven't loaded admin me yet, we could show a loader
  // but useGetAdminMe will trigger logout if it fails, which redirects.
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse">Loading secure area...</div>
      </div>
    );
  }

  return <>{children}</>;
}
