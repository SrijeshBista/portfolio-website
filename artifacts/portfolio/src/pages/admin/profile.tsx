import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetProfile, getGetProfileQueryKey, useUpdateProfile } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Plus, Trash2, User } from "lucide-react";
import { SkillCategory } from "@workspace/api-client-react/src/generated/api.schemas";

export default function AdminProfile() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useGetProfile({
    query: {
      queryKey: getGetProfileQueryKey(),
    },
  });

  const updateMutation = useUpdateProfile({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        toast({ title: "Success", description: "Profile updated successfully." });
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to update profile." }),
    }
  });

  // State
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroSubheading, setHeroSubheading] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [skills, setSkills] = useState<SkillCategory[]>([]);

  // Photo upload
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setTitle(profile.title);
      setHeroHeadline(profile.heroHeadline);
      setHeroSubheading(profile.heroSubheading);
      setBio(profile.bio);
      setExperience(profile.experience);
      setGithubUrl(profile.githubUrl || "");
      setLinkedinUrl(profile.linkedinUrl || "");
      setTwitterUrl(profile.twitterUrl || "");
      setCvUrl(profile.cvUrl || "");
      setSkills(profile.skills || []);
    }
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate({
      data: {
        name,
        title,
        heroHeadline,
        heroSubheading,
        bio,
        experience,
        githubUrl: githubUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        twitterUrl: twitterUrl || undefined,
        cvUrl: cvUrl || undefined,
        skills,
      }
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch("/api/profile/photo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      toast({ title: "Success", description: "Photo uploaded successfully." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to upload photo." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) return <AdminLayout><div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
            <p className="text-muted-foreground mt-1">Manage your personal information and resume.</p>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center">
                  {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload Photo
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Title / Role</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Years of Experience (String)</Label>
                <Input value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 5+" />
              </div>
            </CardContent>
          </Card>

          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Hero Headline</Label>
                <Input value={heroHeadline} onChange={e => setHeroHeadline(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hero Subheading</Label>
                <Textarea value={heroSubheading} onChange={e => setHeroSubheading(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Full Bio</Label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={5} />
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Links & Social</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Twitter URL</Label>
                <Input value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>CV / Resume URL</Label>
                <Input value={cvUrl} onChange={e => setCvUrl(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Skills Editor - Simplified for demo, can be expanded */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Skills</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSkills([...skills, { category: "New Category", items: [] }])}>
                <Plus className="h-4 w-4 mr-2" /> Add Category
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {skills.map((cat, catIdx) => (
                <div key={catIdx} className="border border-border p-4 rounded-md space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input 
                      value={cat.category} 
                      onChange={e => {
                        const newSkills = [...skills];
                        newSkills[catIdx].category = e.target.value;
                        setSkills(newSkills);
                      }} 
                      className="font-bold"
                    />
                    <Button variant="ghost" size="icon" onClick={() => setSkills(skills.filter((_, i) => i !== catIdx))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                    {cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center space-x-2">
                        <Input 
                          placeholder="Skill name" 
                          value={item.name}
                          onChange={e => {
                            const newSkills = [...skills];
                            newSkills[catIdx].items[itemIdx].name = e.target.value;
                            setSkills(newSkills);
                          }}
                        />
                        <Input 
                          type="number" 
                          min="1" max="100" 
                          className="w-24"
                          placeholder="Level"
                          value={item.level}
                          onChange={e => {
                            const newSkills = [...skills];
                            newSkills[catIdx].items[itemIdx].level = parseInt(e.target.value) || 0;
                            setSkills(newSkills);
                          }}
                        />
                        <Button variant="ghost" size="icon" onClick={() => {
                          const newSkills = [...skills];
                          newSkills[catIdx].items = newSkills[catIdx].items.filter((_, i) => i !== itemIdx);
                          setSkills(newSkills);
                        }}>
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => {
                      const newSkills = [...skills];
                      newSkills[catIdx].items.push({ name: "", level: 80 });
                      setSkills(newSkills);
                    }}>
                      <Plus className="h-4 w-4 mr-2" /> Add Skill
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}