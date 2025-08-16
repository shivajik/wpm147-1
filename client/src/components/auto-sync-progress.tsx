import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw, Wifi, AlertTriangle } from "lucide-react";
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

interface AutoSyncProgressProps {
  onComplete?: (results: AutoSyncResponse) => void;
  autoStart?: boolean;
  showCard?: boolean;
  className?: string;
}

export function AutoSyncProgress({ 
  onComplete, 
  autoStart = false, 
  showCard = true,
  className = "" 
}: AutoSyncProgressProps) {
  const [syncResults, setSyncResults] = useState<AutoSyncResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const autoSyncMutation = useMutation({
    mutationFn: async (): Promise<AutoSyncResponse> => {
      const response = await apiCall("/api/websites/auto-sync", {
        method: "POST",
      });
      return response;
    },
    onSuccess: (data) => {
      setSyncResults(data);
      setProgress(100);
      
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
      
      onComplete?.(data);
    },
    onError: (error: any) => {
      toast({
        title: "Auto-sync Failed",
        description: error.message || "Failed to sync websites",
        variant: "destructive",
      });
    },
  });

  // Auto-start sync if requested
  useEffect(() => {
    if (autoStart && !autoSyncMutation.isPending && !syncResults) {
      autoSyncMutation.mutate();
    }
  }, [autoStart]);

  // Simulate progress updates during sync
  useEffect(() => {
    if (autoSyncMutation.isPending) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [autoSyncMutation.isPending]);

  const handleStartSync = () => {
    setProgress(0);
    setCurrentStep(0);
    setSyncResults(null);
    autoSyncMutation.mutate();
  };

  const renderContent = () => (
    <div className="space-y-4">
      {/* Progress section */}
      {(autoSyncMutation.isPending || syncResults) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {autoSyncMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            ) : syncResults?.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">
              {autoSyncMutation.isPending 
                ? "Syncing website data..." 
                : syncResults?.success
                ? "Sync completed"
                : "Sync failed"
              }
            </span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          {autoSyncMutation.isPending && (
            <p className="text-xs text-muted-foreground">
              Please wait while we update your websites with the latest information
            </p>
          )}
        </div>
      )}

      {/* Results section */}
      {syncResults && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {syncResults.syncedSuccessfully}
              </div>
              <div className="text-xs text-muted-foreground">Successful</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">
                {syncResults.syncedWithErrors}
              </div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-600">
                {syncResults.totalWebsites}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>

          {/* Detailed results */}
          {syncResults.results.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Sync Details:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {syncResults.results.map((result) => (
                  <div key={result.websiteId} className="flex items-center gap-2 text-xs">
                    {result.success ? (
                      <Wifi className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                    )}
                    <span className="flex-1 truncate">{result.name}</span>
                    <span className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? 'OK' : 'Error'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action button */}
      {!autoStart && !autoSyncMutation.isPending && !syncResults && (
        <Button 
          onClick={handleStartSync}
          className="w-full"
          variant="default"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync All Websites
        </Button>
      )}

      {/* Retry button */}
      {syncResults && syncResults.syncedWithErrors > 0 && (
        <Button 
          onClick={handleStartSync}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Failed Syncs
        </Button>
      )}
    </div>
  );

  if (!showCard) {
    return <div className={className}>{renderContent()}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          Website Sync
        </CardTitle>
        <CardDescription className="text-sm">
          Update all your websites with the latest data
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
}