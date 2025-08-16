import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface GoogleAnalyticsData {
  id: number;
  websiteId: number;
  userId: number;
  dateRange: string;
  startDate: string;
  endDate: string;
  sessions: number;
  pageviews: number;
  users: number;
  newUsers: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number; }>;
  topSources: Array<{ source: string; sessions: number; }>;
  deviceCategories: Array<{ category: string; sessions: number; }>;
  syncStatus: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  createdAt: string;
}

export function useGoogleAnalytics(websiteId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Google Analytics data
  const {
    data: analyticsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/websites', websiteId, 'google-analytics', 'data'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/websites/${websiteId}/google-analytics/data`);
      return response.json();
    },
    enabled: !!websiteId
  });

  // Sync Google Analytics data
  const syncMutation = useMutation({
    mutationFn: async (params?: { 
      dateRange?: '7days' | '30days' | '90days' | 'custom';
      startDate?: string;
      endDate?: string;
    }) => {
      return apiRequest('POST', `/api/websites/${websiteId}/google-analytics/sync`, params || { dateRange: '30days' });
    },
    onSuccess: () => {
      toast({
        title: "Analytics synced",
        description: "Google Analytics data has been updated successfully.",
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/websites', websiteId, 'google-analytics', 'data'] 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync Google Analytics data",
        variant: "destructive",
      });
    },
  });

  // Update Google Analytics configuration
  const configMutation = useMutation({
    mutationFn: async (config: {
      gaTrackingId: string;
      gaPropertyId: string;
      gaViewId?: string;
      gaServiceAccountKey: string;
    }) => {
      return apiRequest('PUT', `/api/websites/${websiteId}/google-analytics`, config);
    },
    onSuccess: () => {
      toast({
        title: "Configuration updated",
        description: "Google Analytics has been configured successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId] });
    },
    onError: (error: any) => {
      toast({
        title: "Configuration failed",
        description: error.message || "Failed to update Google Analytics configuration",
        variant: "destructive",
      });
    },
  });

  // Remove Google Analytics configuration
  const removeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/websites/${websiteId}/google-analytics`);
    },
    onSuccess: () => {
      toast({
        title: "Analytics removed",
        description: "Google Analytics integration has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId] });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/websites', websiteId, 'google-analytics', 'data'] 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Removal failed",
        description: error.message || "Failed to remove Google Analytics",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    analyticsData,
    isLoading,
    error,
    latestData: analyticsData?.[0],

    // Mutations
    syncData: syncMutation.mutate,
    updateConfig: configMutation.mutate,
    removeConfig: removeMutation.mutate,

    // Loading states
    isSyncing: syncMutation.isPending,
    isUpdatingConfig: configMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}

export function useGoogleAnalyticsMetrics(websiteId: number, dateRange = '30days') {
  return useQuery({
    queryKey: ['/api/websites', websiteId, 'google-analytics', 'data', dateRange],
    queryFn: async () => {
      const response = await apiRequest(
        'GET',
        `/api/websites/${websiteId}/google-analytics/data?dateRange=${dateRange}`
      );
      return response.json();
    },
    enabled: !!websiteId
  });
}