import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { insertWebsiteSchema, type InsertWebsite, type Client } from "@shared/schema";
import { Globe, Key, Settings } from "lucide-react";

interface AddWebsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Enhanced validation schema for WordPress websites
const websiteFormSchema = insertWebsiteSchema.extend({
  name: z.string().min(1, "Website name is required"),
  url: z.string().url("Please enter a valid URL (e.g., https://example.com)"),
  wpAdminUsername: z.string().optional(),
  wpAdminPassword: z.string().optional(),
  wrmApiKey: z.string().optional(),
  clientId: z.number({ required_error: "Please select a client" }),
}).refine((data) => {
  // Either admin credentials or WP Remote Manager API key should be provided
  const hasCredentials = data.wpAdminUsername && data.wpAdminPassword;
  const hasWrmApiKey = data.wrmApiKey;
  return hasCredentials || hasWrmApiKey;
}, {
  message: "Please provide either WordPress admin credentials or a WP Remote Manager API key",
  path: ["wpAdminUsername"], // Show error on username field
});

export default function AddWebsiteDialog({ open, onOpenChange }: AddWebsiteDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  type WebsiteFormData = z.infer<typeof websiteFormSchema>;
  
  const form = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteFormSchema),
    defaultValues: {
      name: "",
      url: "",
      wpAdminUsername: "",
      wpAdminPassword: "",
      wrmApiKey: "",
      clientId: undefined,
      healthStatus: "good",
      uptime: "100%",
      connectionStatus: "disconnected",
    },
  });

  // Fetch clients for the dropdown
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    enabled: open,
  });

  const createWebsiteMutation = useMutation({
    mutationFn: async (data: WebsiteFormData) => {
      return await apiCall("/api/websites", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: async (newWebsite) => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Website added successfully",
        description: "WordPress data is being fetched in the background. This may take a few moments.",
      });
      
      // Trigger immediate data sync for the new website
      try {
        await apiCall(`/api/websites/${newWebsite.id}/sync`, {
          method: "POST",
        });
        
        // Pre-fetch the WordPress data to populate the cache
        queryClient.prefetchQuery({
          queryKey: [`/api/websites/${newWebsite.id}/wordpress-data`],
        });
        
        toast({
          title: "Data sync initiated",
          description: "WordPress data is being processed. You can view the website details now.",
        });
      } catch (error) {
        // Silent error - sync will happen on page load anyway
        console.warn('Auto-sync failed, data will be fetched when user visits the page');
      }
      
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add website",
        description: error?.message || "There was an error adding the website. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WebsiteFormData) => {
    // Format URL to ensure it has protocol
    let formattedUrl = data.url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    createWebsiteMutation.mutate({
      ...data,
      url: formattedUrl,
    });
  };

  const handleCancel = () => {
    form.reset();
    setActiveTab("basic");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[95vh] sm:max-h-[90vh] flex flex-col p-0 m-4 sm:m-6">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Globe className="h-5 w-5" />
            Add WordPress Website
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Add a new WordPress website for maintenance management. You can connect using admin credentials or a Worker plugin connection key.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-4 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-1 sm:pr-2 pb-4 scrollbar-thin dialog-scroll">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                <TabsTrigger value="basic" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Basic Info</span>
                  <span className="sm:hidden">Basic</span>
                </TabsTrigger>
                <TabsTrigger value="credentials" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                  <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Connection</span>
                  <span className="sm:hidden">Connect</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-3 sm:space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Website Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My Client's Website"
                          className="text-sm sm:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">
                        A descriptive name for this WordPress website
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Website URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          className="text-sm sm:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">
                        The full URL of the WordPress website
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Client</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value ? field.value.toString() : ""}
                        disabled={clientsLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="text-sm sm:text-base">
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(clients) && clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              <span className="truncate">{client.name} ({client.email})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs sm:text-sm">
                        Which client owns this website?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="credentials" className="space-y-3 sm:space-y-4 mt-4">
                <div className="space-y-3 sm:space-y-4">
                  <div className="border rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">WordPress Admin Credentials</h4>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="wpAdminUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">WordPress Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="admin"
                                className="text-sm sm:text-base"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="wpAdminPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">WordPress Application Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                                className="text-sm sm:text-base"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              This must be an Application Password, not your regular WordPress login password.
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="text-center text-xs sm:text-sm text-gray-500">OR</div>

                  <div className="border rounded-lg p-3 sm:p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <h4 className="font-medium mb-2 sm:mb-3 text-green-800 dark:text-green-200 text-sm sm:text-base">
                      WP Remote Manager Plugin Connection (Recommended)
                    </h4>
                    <FormField
                      control={form.control}
                      name="wrmApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">WP Remote Manager API Key</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter WP Remote Manager plugin API key"
                              className="text-sm sm:text-base w-full min-w-0"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm">
                            Provides complete WordPress management features including updates, security scans, and maintenance mode
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">
                    WP Remote Manager Setup (Recommended):
                  </h4>
                  <ol className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside mb-3">
                    <li>Install the <strong>WP Remote Manager</strong> plugin on your WordPress site</li>
                    <li>Go to <strong>Settings → WP Remote Manager</strong> in your WordPress admin</li>
                    <li>Generate a new API key and copy it</li>
                    <li>Paste the API key in the field above for enhanced management features</li>
                  </ol>
                  <div className="mt-3 p-2 sm:p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                    <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                      <strong>Alternative:</strong> Use WordPress Application Passwords for basic monitoring. Create them in <strong>Users → Profile → Application Passwords</strong> section.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-3 sm:space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="wpVersion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">WordPress Version (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="6.4.2"
                          className="text-sm sm:text-base"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">
                        Current WordPress version (will be auto-detected if left empty)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="healthStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Initial Health Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-sm sm:text-base">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs sm:text-sm">
                        Initial health status (can be updated later)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

              </div>
            </form>
          </Form>
        </div>
        
        {/* Fixed footer buttons outside of scrollable area */}
        <div className="flex-shrink-0 border-t bg-background px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createWebsiteMutation.isPending}
              className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createWebsiteMutation.isPending}
              onClick={form.handleSubmit(onSubmit)}
              className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
            >
              {createWebsiteMutation.isPending ? "Adding Website..." : "Add Website"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}