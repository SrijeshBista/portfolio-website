import { useListContacts, getListContactsQueryKey, useDeleteContact } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Mail } from "lucide-react";
import { format } from "date-fns";

export default function AdminContacts() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useListContacts({
    query: {
      enabled: !!token,
      queryKey: getListContactsQueryKey(),
    },
    request: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const deleteMutation = useDeleteContact({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
        toast({ title: "Success", description: "Message deleted." });
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to delete message." }),
    }
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
          <p className="text-muted-foreground mt-1">View messages sent through your portfolio contact form.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : contacts?.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mb-4 opacity-50" />
              <p>No messages yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {contacts?.map((contact) => (
              <Card key={contact.id} className="bg-card border-border">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <CardDescription>
                      <a href={`mailto:${contact.email}`} className="hover:underline text-primary">
                        {contact.email}
                      </a>
                      <span className="mx-2">•</span>
                      {format(new Date(contact.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm("Delete this message?")) {
                        deleteMutation.mutate({ id: contact.id });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap mt-2">{contact.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}