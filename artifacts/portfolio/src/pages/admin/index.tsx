import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Lock } from "lucide-react";

export default function AdminEntry() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 dark">
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">View Portfolio</CardTitle>
            <CardDescription className="text-muted-foreground">
              Return to the public-facing portfolio website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className="block">
              <Button className="w-full group" variant="secondary">
                Go to Site
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Admin Access
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Login to manage projects, contacts, and profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/login" className="block">
              <Button className="w-full group">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}