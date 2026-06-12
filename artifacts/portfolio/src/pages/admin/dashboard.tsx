import { useState } from "react";
import { Link } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetSiteStats, getGetSiteStatsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { FolderKanban, Users, User, ArrowRight, Activity, KeyRound, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { token } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading } = useGetSiteStats({
    query: {
      enabled: !!token,
      queryKey: getGetSiteStatsQueryKey(),
    },
    request: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [unForm, setUnForm] = useState({ newUsername: "", password: "" });
  const [unLoading, setUnLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "New passwords do not match." });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast({ variant: "destructive", title: "Error", description: "New password must be at least 6 characters." });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to change password");
      }
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Error", description: err instanceof Error ? err.message : "Failed to change password" });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleChangeUsername(e: React.FormEvent) {
    e.preventDefault();
    if (!unForm.newUsername.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Username cannot be empty." });
      return;
    }
    setUnLoading(true);
    try {
      const res = await fetch("/api/auth/change-username", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newUsername: unForm.newUsername.trim(), password: unForm.password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to change username");
      }
      toast({ title: "Username updated", description: "Your username has been changed. Please log in again." });
      setUnForm({ newUsername: "", password: "" });
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Error", description: err instanceof Error ? err.message : "Failed to change username" });
    } finally {
      setUnLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-2">Overview of your portfolio site.</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.projectCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.contactCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats?.unreadContactCount || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Manage Projects</CardTitle>
              <CardDescription>Add, edit, or remove portfolio projects.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/projects" className="block">
                <Button variant="secondary" className="w-full justify-between">
                  Projects <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Messages</CardTitle>
              <CardDescription>Read and manage contact form submissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/contacts" className="block">
                <Button variant="secondary" className="w-full justify-between">
                  Contacts <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your bio, skills, and resume.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/profile" className="block">
                <Button variant="secondary" className="w-full justify-between">
                  Profile <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Account Security */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Account Security
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Password</CardTitle>
                <CardDescription>Update your admin login password.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="current-pw">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-pw"
                        type={showPw ? "text" : "password"}
                        placeholder="••••••••"
                        value={pwForm.currentPassword}
                        onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                        className="bg-background pr-10"
                        required
                      />
                      <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-pw">New Password</Label>
                    <Input
                      id="new-pw"
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={pwForm.newPassword}
                      onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirm-pw">Confirm New Password</Label>
                    <Input
                      id="confirm-pw"
                      type={showPw ? "text" : "password"}
                      placeholder="Repeat new password"
                      value={pwForm.confirmPassword}
                      onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      className="bg-background"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={pwLoading}>
                    {pwLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Username */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Username</CardTitle>
                <CardDescription>Update your admin login username.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangeUsername} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="new-username">New Username</Label>
                    <Input
                      id="new-username"
                      type="text"
                      placeholder="e.g. srijesh"
                      value={unForm.newUsername}
                      onChange={e => setUnForm(f => ({ ...f, newUsername: e.target.value }))}
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirm-pw-un">Current Password to confirm</Label>
                    <Input
                      id="confirm-pw-un"
                      type="password"
                      placeholder="••••••••"
                      value={unForm.password}
                      onChange={e => setUnForm(f => ({ ...f, password: e.target.value }))}
                      className="bg-background"
                      required
                    />
                  </div>
                  <Button type="submit" variant="secondary" className="w-full" disabled={unLoading}>
                    {unLoading ? "Updating..." : "Update Username"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
