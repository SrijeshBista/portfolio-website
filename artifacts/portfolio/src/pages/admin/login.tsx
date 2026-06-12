import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Terminal, ChevronDown, ChevronUp } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showReset, setShowReset] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const adminLoginMutation = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        toast({ title: "Success", description: "Logged in successfully." });
        setLocation("/admin/dashboard");
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Invalid credentials",
          description: "Check your username and password and try again.",
        });
      },
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    adminLoginMutation.mutate({ data: values });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 dark">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Admin Login
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access the secure area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} className="bg-background border-input" autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-background border-input" autoComplete="current-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full mt-6"
                disabled={adminLoginMutation.isPending}
              >
                {adminLoginMutation.isPending ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </Form>

          {/* Forgot password section */}
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setShowReset(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1"
            >
              Forgot password?
              {showReset ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {showReset && (
              <div className="mt-3 rounded-lg bg-background border border-border p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Terminal className="h-4 w-4 text-primary shrink-0" />
                  Reset via Replit Shell
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Open the <strong className="text-foreground">Shell</strong> tab in your Replit project and run this command — replace <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">newpassword</code> with your chosen password:
                </p>
                <div className="bg-black/60 rounded-md p-3 font-mono text-xs text-green-400 break-all select-all">
                  pnpm --filter @workspace/scripts run reset-admin-password newpassword
                </div>
                <p className="text-xs text-muted-foreground">
                  To also reset the username, add it as a second argument:
                </p>
                <div className="bg-black/60 rounded-md p-3 font-mono text-xs text-green-400 break-all select-all">
                  pnpm --filter @workspace/scripts run reset-admin-password newpassword newusername
                </div>
                <p className="text-xs text-muted-foreground italic">
                  The command prints a confirmation once done. Refresh this page and log in with your new credentials.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
