import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

import PortfolioHome from "@/pages/index";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProjects from "@/pages/admin/projects";
import AdminContacts from "@/pages/admin/contacts";
import AdminProfile from "@/pages/admin/profile";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={PortfolioHome} />
      
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/login" component={AdminLogin} />
      
      <Route path="/admin/dashboard">
        <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      </Route>
      <Route path="/admin/projects">
        <ProtectedRoute><AdminProjects /></ProtectedRoute>
      </Route>
      <Route path="/admin/contacts">
        <ProtectedRoute><AdminContacts /></ProtectedRoute>
      </Route>
      <Route path="/admin/profile">
        <ProtectedRoute><AdminProfile /></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
