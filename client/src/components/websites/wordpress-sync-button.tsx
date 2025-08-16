import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { apiCall } from "@/lib/queryClient";

interface WordPressSyncButtonProps {
  websiteId: number;
  isConnected?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  showIcon?: boolean;
}

export default function WordPressSyncButton({ 
  websiteId, 
  isConnected = false, 
  size = "default",
  variant = "default",
  showIcon = true 
}: WordPressSyncButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiCall(`/api/websites/${websiteId}/test-connection`, {
        method: "POST",
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: data.connected ? "Connection Successful" : "Connection Failed",
        description: data.message,
        variant: data.connected ? "default" : "destructive",
      });
      
      // Invalidate website data to refresh connection status
      queryClient.invalidateQueries({ queryKey: ["/api/websites", websiteId] });
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Test Failed",
        description: error.message || "Failed to test WordPress connection",
        variant: "destructive",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiCall(`/api/websites/${websiteId}/sync`, {
        method: "POST",
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Successful",
        description: "WordPress website data has been synchronized",
      });
      
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/websites", websiteId] });
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync WordPress data",
        variant: "destructive",
      });
    },
  });

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    await testConnectionMutation.mutateAsync();
    setIsTestingConnection(false);
  };

  const handleSync = () => {
    syncMutation.mutate();
  };

  const getConnectionIcon = () => {
    if (isTestingConnection || testConnectionMutation.isPending) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    
    if (isConnected) {
      return <Wifi className="w-4 h-4" />;
    }
    
    return <WifiOff className="w-4 h-4" />;
  };

  const getConnectionText = () => {
    if (isTestingConnection || testConnectionMutation.isPending) {
      return "Testing...";
    }
    
    if (syncMutation.isPending) {
      return "Syncing...";
    }
    
    if (isConnected) {
      return "Sync Now";
    }
    
    return "Test Connection";
  };

  const handleClick = () => {
    if (isConnected) {
      handleSync();
    } else {
      handleTestConnection();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={testConnectionMutation.isPending || syncMutation.isPending || isTestingConnection}
      className="gap-2"
    >
      {showIcon && getConnectionIcon()}
      {getConnectionText()}
    </Button>
  );
}