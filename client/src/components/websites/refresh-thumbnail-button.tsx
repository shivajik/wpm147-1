import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";

interface RefreshThumbnailButtonProps {
  websiteId: number;
  variant?: "ghost" | "secondary" | "outline";
  size?: "sm" | "default";
  className?: string;
}

export default function RefreshThumbnailButton({ 
  websiteId, 
  variant = "ghost", 
  size = "sm",
  className = ""
}: RefreshThumbnailButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const refreshThumbnailMutation = useMutation({
    mutationFn: async () => {
      return apiCall(`/api/websites/${websiteId}/refresh-thumbnail`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh the website data
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}`] });
      
      toast({
        title: "Thumbnail updated",
        description: "Website thumbnail has been refreshed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh failed",
        description: error?.message || "Failed to refresh thumbnail",
        variant: "destructive",
      });
    },
  });

  const handleRefreshThumbnail = (e: React.MouseEvent) => {
    e.stopPropagation();
    refreshThumbnailMutation.mutate();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleRefreshThumbnail}
            disabled={refreshThumbnailMutation.isPending}
            className={`h-8 w-8 p-0 ${className}`}
          >
            <RefreshCw className={`h-4 w-4 ${refreshThumbnailMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{refreshThumbnailMutation.isPending ? 'Refreshing...' : 'Refresh Thumbnail'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}