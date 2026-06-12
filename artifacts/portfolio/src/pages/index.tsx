import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetProfile, getGetProfileQueryKey, useListProjects, getListProjectsQueryKey, useSubmitContact, useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Github, Linkedin, Twitter, Download, Send, ExternalLink, Menu, X, ArrowRight, Lock } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function PortfolioHome() {
  const { data: profile, isLoading: isProfileLoading } = useGetProfile({
    query: { queryKey: getGetProfileQueryKey() }
  });

  const { data: projects, isLoading: isProjectsLoading } = useListProjects({
    query: { queryKey: getListProjectsQueryKey() }
  });

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const adminLoginMutation = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        setAdminDialogOpen(false);
        setAdminUsername("");
        setAdminPassword("");
        setLocation("/admin/dashboard");
      },
      onError: () => {
        toast({ variant: "destructive", title: "Access denied", description: "Invalid username or password." });
      },
    },
  });

  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    adminLoginMutation.mutate({ data: { username: adminUsername, password: adminPassword } });
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { toast } = useToast();
  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" }
  });

  const submitContactMutation = useSubmitContact({
    mutation: {
      onSuccess: () => {
        toast({ title: "Message sent", description: "Thanks for reaching out! I'll get back to you soon." });
        contactForm.reset();
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to send message." })
    }
  });

  const onSubmitContact = (data: z.infer<typeof contactSchema>) => {
    submitContactMutation.mutate({ data });
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center dark">
        <Skeleton className="h-12 w-48 mb-8" />
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans dark selection:bg-primary/30">
      {/* Navbar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-background/80 backdrop-blur-md border-border' : 'bg-transparent border-transparent'}`}>
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tighter text-white">
            {profile?.name.split(' ')[0]}<span className="text-primary">.dev</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            {['about', 'skills', 'projects'].map((item) => (
              <button key={item} onClick={() => scrollTo(item)} className="hover:text-primary transition-colors uppercase tracking-wider">
                {item}
              </button>
            ))}
            <Button onClick={() => scrollTo('contact')} className="rounded-full px-6">
              Contact Me
            </Button>
          </nav>

          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-border p-6 space-y-4">
            {['about', 'skills', 'projects', 'contact'].map((item) => (
              <button key={item} onClick={() => scrollTo(item)} className="block w-full text-left uppercase tracking-wider text-muted-foreground hover:text-primary py-2">
                {item}
              </button>
            ))}
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          {/* Abstract background element */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-block mb-4 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium tracking-wide">
                {profile?.title}
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-white">
                {profile?.heroHeadline}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
                {profile?.heroSubheading}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full px-8 h-14 text-base" onClick={() => scrollTo('projects')}>
                  View My Work <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base border-primary/50 hover:bg-primary/10" onClick={() => scrollTo('contact')}>
                  Get In Touch
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-24 bg-card/50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-5 relative">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-border relative z-10 bg-muted">
                  {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">Photo</div>
                  )}
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/20 rounded-full blur-[40px] z-0" />
              </div>
              <div className="md:col-span-7">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">About Me</h2>
                <div className="prose prose-invert max-w-none text-muted-foreground mb-8">
                  <p className="whitespace-pre-wrap text-lg leading-relaxed">{profile?.bio}</p>
                </div>
                <div className="flex items-center gap-6 mb-8">
                  <div>
                    <div className="text-4xl font-bold text-primary">{profile?.experience}</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Years Experience</div>
                  </div>
                  <div className="w-px h-12 bg-border"></div>
                  <div>
                    <div className="text-4xl font-bold text-white">{projects?.length || 0}+</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Projects Shipped</div>
                  </div>
                </div>
                {profile?.cvUrl && (
                  <Button variant="outline" className="rounded-full" onClick={() => window.open(profile.cvUrl, '_blank')}>
                    <Download className="mr-2 h-4 w-4" /> Download Resume
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Technical Arsenal</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">The tools and technologies I use to build exceptional digital experiences.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profile?.skills.map((category, idx) => (
                <Card key={idx} className="bg-card/50 border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-6 text-white">{category.category}</h3>
                    <div className="space-y-5">
                      {category.items.map((skill, sIdx) => (
                        <div key={sIdx}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-muted-foreground">{skill.name}</span>
                            <span className="text-primary">{skill.level}%</span>
                          </div>
                          <Progress value={skill.level} className="h-1 bg-muted" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="py-24 bg-card/50">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Selected Work</h2>
                <p className="text-muted-foreground max-w-xl">A collection of projects that showcase my focus on detail, performance, and user experience.</p>
              </div>
            </div>

            {isProjectsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="aspect-video w-full" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects?.sort((a,b) => a.sortOrder - b.sortOrder).map(project => (
                  <div key={project.id} className="group relative rounded-xl overflow-hidden border border-border bg-background flex flex-col h-full hover:border-primary/50 transition-all duration-300">
                    <div className="aspect-video bg-muted overflow-hidden relative">
                      {project.imageUrl ? (
                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background flex items-center justify-center text-muted-foreground">No image</div>
                      )}
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform">
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:scale-110 transition-transform">
                            <Github className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                      <p className="text-muted-foreground text-sm mb-6 flex-1 line-clamp-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {project.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-4">Let's Build Something</h2>
                <p className="text-muted-foreground">Have a project in mind or want to explore an opportunity? Send me a message.</p>
              </div>

              <Form {...contactForm}>
                <form onSubmit={contactForm.handleSubmit(onSubmitContact)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={contactForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={contactForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell me about your project..." rows={5} {...field} className="bg-background resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-3 flex-wrap">
                    <Button type="submit" size="lg" className="px-8" disabled={submitContactMutation.isPending}>
                      {submitContactMutation.isPending ? "Sending..." : "Send Message"}
                      {!submitContactMutation.isPending && <Send className="ml-2 h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant="ghost"
                      className="text-muted-foreground hover:text-primary border border-border hover:border-primary/50 transition-colors px-5"
                      onClick={() => setAdminDialogOpen(true)}
                    >
                      <Lock className="h-4 w-4 mr-2 opacity-60" />
                      Admin
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </section>
      </main>

      {/* Admin Login Dialog */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent className="sm:max-w-md dark bg-card border-border">
          <DialogHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-center text-foreground text-xl">Admin Login</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Enter your credentials to access the admin panel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="admin-username">Email</label>
              <Input
                id="admin-username"
                type="email"
                placeholder="your@email.com"
                value={adminUsername}
                onChange={e => setAdminUsername(e.target.value)}
                className="bg-background border-input"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="admin-password">Password</label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="bg-background border-input"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={adminLoginMutation.isPending}>
              {adminLoginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/30">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-bold text-lg tracking-tighter text-white">
            {profile?.name.split(' ')[0]}<span className="text-primary">.dev</span>
          </div>
          
          <div className="flex items-center gap-4">
            {profile?.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            )}
            {profile?.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {profile?.twitterUrl && (
              <a href={profile.twitterUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {profile?.name}. All rights reserved.{" "}
            <a href="/admin/login" className="opacity-0 hover:opacity-20 transition-opacity duration-300 text-muted-foreground select-none" tabIndex={-1} aria-hidden="true">·</a>
          </p>
        </div>
      </footer>
    </div>
  );
}