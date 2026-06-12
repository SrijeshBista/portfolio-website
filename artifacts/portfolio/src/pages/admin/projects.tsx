import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useListProjects, getListProjectsQueryKey, useCreateProject, useUpdateProject, useDeleteProject, Project } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function AdminProjects() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");

  const { data: projects, isLoading } = useListProjects({
    query: {
      enabled: !!token,
      queryKey: getListProjectsQueryKey(),
    },
    request: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const createMutation = useCreateProject({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        toast({ title: "Success", description: "Project created." });
        setIsDialogOpen(false);
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to create project." }),
    }
  });

  const updateMutation = useUpdateProject({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        toast({ title: "Success", description: "Project updated." });
        setIsDialogOpen(false);
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to update project." }),
    }
  });

  const deleteMutation = useDeleteProject({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        toast({ title: "Success", description: "Project deleted." });
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to delete project." }),
    }
  });

  const openDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setTitle(project.title);
      setDescription(project.description);
      setImageUrl(project.imageUrl || "");
      setLiveUrl(project.liveUrl || "");
      setGithubUrl(project.githubUrl || "");
      setTagsStr(project.tags.join(", "));
      setFeatured(project.featured);
      setSortOrder(project.sortOrder.toString());
    } else {
      setEditingProject(null);
      setTitle("");
      setDescription("");
      setImageUrl("");
      setLiveUrl("");
      setGithubUrl("");
      setTagsStr("");
      setFeatured(false);
      setSortOrder("0");
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      imageUrl: imageUrl || undefined,
      liveUrl: liveUrl || undefined,
      githubUrl: githubUrl || undefined,
      tags: tagsStr.split(",").map(t => t.trim()).filter(Boolean),
      featured,
      sortOrder: parseInt(sortOrder) || 0,
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground mt-1">Manage your portfolio projects.</p>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No projects found. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  projects?.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>{project.featured ? "Yes" : "No"}</TableCell>
                      <TableCell>{project.sortOrder}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(project)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this project?")) {
                              deleteMutation.mutate({ id: project.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" required value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea required value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Live URL</Label>
                <Input value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="React, Vite, Tailwind" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="featured" checked={featured} onCheckedChange={(c) => setFeatured(!!c)} />
              <Label htmlFor="featured">Featured project (shows larger or first)</Label>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingProject ? "Save Changes" : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}