import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Eye, Trash2 } from "lucide-react";
import EditClientDialog from "./edit-client-dialog";
import ViewClientDialog from "./view-client-dialog";
import type { Client } from "@shared/schema";

interface ClientTableProps {
  showHeader?: boolean;
}

export default function ClientTable({ showHeader = false }: ClientTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiCall(`/api/clients/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean).map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getInitialsColor = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600", 
      "bg-purple-100 text-purple-600",
      "bg-orange-100 text-orange-600",
      "bg-pink-100 text-pink-600",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const handleDeleteClient = (id: number) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClientMutation.mutate(id);
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingClient(null);
    }
  };

  const handleViewClient = (client: Client) => {
    setViewingClient(client);
    setIsViewDialogOpen(true);
  };

  const handleViewDialogClose = (open: boolean) => {
    setIsViewDialogOpen(open);
    if (!open) {
      setViewingClient(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200">
        {showHeader && (
          <CardHeader className="border-b border-slate-200">
            <CardTitle>Clients</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.isArray([1, 2, 3]) && [1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-slate-200">
      {showHeader && (
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle>Clients</CardTitle>
            <div className="flex items-center space-x-3">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="link" size="sm">
                Manage Clients
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-6">
        {clients && clients.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(clients) && clients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getInitialsColor(client.name)}`}>
                          <span className="font-semibold text-sm">{getInitials(client.name)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{client.name}</p>
                          <p className="text-sm text-slate-500">{client.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-900">{client.company || "N/A"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={client.status === "active" ? "default" : "secondary"}
                        className={
                          client.status === "active"
                            ? "bg-success text-white"
                            : client.status === "pending"
                            ? "bg-warning text-white"
                            : "bg-slate-500 text-white"
                        }
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500">
                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditClient(client)}
                          data-testid="button-edit-client"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewClient(client)}
                          data-testid="button-view-client"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteClient(client.id)}
                          disabled={deleteClientMutation.isPending}
                          className="text-error hover:text-error hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No clients found</h3>
            <p className="text-slate-500">Get started by adding your first client.</p>
          </div>
        )}
      </CardContent>

      <EditClientDialog
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogClose}
        client={editingClient}
      />

      <ViewClientDialog
        open={isViewDialogOpen}
        onOpenChange={handleViewDialogClose}
        client={viewingClient}
      />
    </Card>
  );
}
