import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AutoSyncResult {
  websiteId: number;
  name: string;
  success: boolean;
  message: string;
}

interface AutoSyncResponse {
  success: boolean;
  message: string;
  results: AutoSyncResult[];
  totalWebsites: number;
  syncedSuccessfully: number;
  syncedWithErrors: number;
}

export function useAutoSync() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const autoSyncMutation = useMutation({
    mutationFn: async (): Promise<AutoSyncResponse> => {
      console.log('[useAutoSync] Starting auto-sync mutation');
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await apiCall("/api/websites/auto-sync", {
        method: "POST",
      });
      console.log('[useAutoSync] Auto-sync completed successfully:', response);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate website queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      
      // Show success toast
      if (data.syncedSuccessfully > 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully updated ${data.syncedSuccessfully} of ${data.totalWebsites} websites`,
        });
      }
      
      if (data.syncedWithErrors > 0) {
        toast({
          title: "Sync Completed with Errors",
          description: `${data.syncedWithErrors} websites had connection issues`,
          variant: "destructive",
        });
      }

      if (data.totalWebsites === 0) {
        toast({
          title: "No Websites to Sync",
          description: "Connect your websites to start syncing data",
        });
      }
    },
    onError: (error: any) => {
      console.error('[useAutoSync] Auto-sync failed:', error);
      
      let errorMessage = "Failed to sync websites";
      if (error.message) {
        if (error.message.includes("404") || error.message.includes("not found")) {
          errorMessage = "API endpoint not found. Please try refreshing the page.";
        } else if (error.message.includes("401") || error.message.includes("unauthorized")) {
          errorMessage = "Authentication expired. Please log in again.";
        } else if (error.message.includes("403") || error.message.includes("forbidden")) {
          errorMessage = "Permission denied. Please check your account access.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Auto-sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return {
    autoSync: autoSyncMutation.mutate,
    autoSyncAsync: autoSyncMutation.mutateAsync,
    isLoading: autoSyncMutation.isPending,
    data: autoSyncMutation.data,
    error: autoSyncMutation.error,
    isSuccess: autoSyncMutation.isSuccess,
    isError: autoSyncMutation.isError,
    reset: autoSyncMutation.reset,
  };
}