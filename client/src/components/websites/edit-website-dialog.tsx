import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { Settings } from "lucide-react";
import type { Website } from "@shared/schema";

const editWebsiteSchema = z.object({
  name: z.string().min(1, "Website name is required"),
  url: z.string().url("Please enter a valid URL"),
  wpAdminUsername: z.string().optional(),
  wpAdminPassword: z.string().optional(),
  wrmApiKey: z.string().optional(),
});

type EditWebsiteForm = z.infer<typeof editWebsiteSchema>;

interface EditWebsiteDialogProps {
  website: Website;
  trigger?: React.ReactNode;
}

export default function EditWebsiteDialog({ website, trigger }: EditWebsiteDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditWebsiteForm>({
    resolver: zodResolver(editWebsiteSchema),
    defaultValues: {
      name: website.name,
      url: website.url,
      wpAdminUsername: website.wpAdminUsername || "",
      wpAdminPassword: website.wpAdminPassword || "",
      wrmApiKey: website.wrmApiKey || "",
    },
  });

  const updateWebsiteMutation = useMutation({
    mutationFn: async (data: EditWebsiteForm) => {
      return await apiCall(`/api/websites/${website.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (updatedWebsite, variables) => {
      // Check if WRM API key was updated to show appropriate message
      const wasWrmKeyUpdated = variables.wrmApiKey && variables.wrmApiKey !== website.wrmApiKey;
      
      toast({
        title: "Website Updated",
        description: wasWrmKeyUpdated 
          ? "Settings updated and WordPress connection refreshed automatically."
          : "Website settings have been updated successfully.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/websites", website.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/websites", website.id, "wordpress-data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/websites", website.id, "wrm", "status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/websites", website.id, "wrm", "health"] });
      
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update website settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditWebsiteForm) => {
    updateWebsiteMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Edit Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Website Settings</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <div className="flex-1 overflow-y-auto pr-4">
            <form id="edit-website-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My WordPress Site" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">WordPress Connection Settings</h3>
              
              <FormField
                control={form.control}
                name="wpAdminUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WordPress Username</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
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
                    <FormLabel>WordPress Application Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                        {...field} 
                      />
                    </FormControl>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      This must be an Application Password, not your regular WordPress login password.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-center text-sm text-gray-500">OR</div>

              <FormField
                control={form.control}
                name="wrmApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WP Remote Manager API Key (Recommended)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter WP Remote Manager plugin API key" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provides complete WordPress management features including updates, security scans, and maintenance mode.
                      <br />
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Auto-reconnect: Updating this key will automatically test the connection and refresh all WordPress data.
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  WP Remote Manager Setup (Recommended):
                </h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside mb-3">
                  <li>Install the <strong>WP Remote Manager</strong> plugin on your WordPress site</li>
                  <li>Go to <strong>Settings → WP Remote Manager</strong> in your WordPress admin</li>
                  <li>Generate a new API key and copy it</li>
                  <li>Paste the API key in the field above for enhanced management features</li>
                </ol>
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Alternative:</strong> Use WordPress Application Passwords for basic monitoring. Create them in <strong>Users → Profile → Application Passwords</strong> section.
                  </p>
                </div>
              </div>
            </div>

            </form>
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateWebsiteMutation.isPending}
              form="edit-website-form"
            >
              {updateWebsiteMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}