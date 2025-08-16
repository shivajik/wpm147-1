import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Key, Globe, Database, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

interface GoogleAnalyticsSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  websiteId: number;
  websiteName: string;
  currentConfig?: {
    gaTrackingId?: string;
    gaPropertyId?: string;
    gaViewId?: string;
    gaConfigured?: boolean;
  };
}

export function GoogleAnalyticsSetupDialog({
  open,
  onOpenChange,
  websiteId,
  websiteName,
  currentConfig
}: GoogleAnalyticsSetupDialogProps) {
  const [gaTrackingId, setGaTrackingId] = useState(currentConfig?.gaTrackingId || "");
  const [gaPropertyId, setGaPropertyId] = useState(currentConfig?.gaPropertyId || "");
  const [gaViewId, setGaViewId] = useState(currentConfig?.gaViewId || "");
  const [gaServiceAccountKey, setGaServiceAccountKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const setupMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', `/api/websites/${websiteId}/google-analytics`, data);
    },
    onSuccess: () => {
      toast({
        title: "Google Analytics configured",
        description: "Analytics integration has been set up successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Configuration failed",
        description: error.message || "Failed to configure Google Analytics",
        variant: "destructive",
      });
    },
  });

  const testConnection = async () => {
    if (!gaPropertyId || !gaServiceAccountKey) {
      toast({
        title: "Missing information",
        description: "Property ID and Service Account Key are required for testing",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await apiRequest('PUT', `/api/websites/${websiteId}/google-analytics`, {
        gaTrackingId,
        gaPropertyId,
        gaViewId,
        gaServiceAccountKey,
      });

      setTestResult({ success: true });
      toast({
        title: "Connection successful",
        description: "Successfully connected to Google Analytics",
      });
    } catch (error: any) {
      setTestResult({ success: false, error: error.message });
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to Google Analytics",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = () => {
    if (!gaTrackingId || !gaPropertyId) {
      toast({
        title: "Missing information",
        description: "Tracking ID and Property ID are required",
        variant: "destructive",
      });
      return;
    }

    setupMutation.mutate({
      gaTrackingId,
      gaPropertyId,
      gaViewId,
      gaServiceAccountKey,
    });
  };

  const handleRemove = async () => {
    try {
      await apiRequest('DELETE', `/api/websites/${websiteId}/google-analytics`);
      
      toast({
        title: "Google Analytics removed",
        description: "Analytics integration has been removed from this website.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Removal failed",
        description: error.message || "Failed to remove Google Analytics",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Google Analytics Setup - {websiteName}
          </DialogTitle>
          <DialogDescription>
            Configure Google Analytics to track visitor data and include analytics metrics in your reports.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {currentConfig?.gaConfigured && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Google Analytics is currently configured for this website.
                <Badge variant="secondary" className="ml-2">Active</Badge>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="trackingId" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Tracking ID (GA4 Measurement ID) *
              </Label>
              <Input
                id="trackingId"
                placeholder="G-XXXXXXXXXX"
                value={gaTrackingId}
                onChange={(e) => setGaTrackingId(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Your Google Analytics 4 Measurement ID (starts with G-)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyId" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Property ID *
              </Label>
              <Input
                id="propertyId"
                placeholder="123456789"
                value={gaPropertyId}
                onChange={(e) => setGaPropertyId(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Your Google Analytics Property ID (numeric)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="viewId">
                View ID (Optional)
              </Label>
              <Input
                id="viewId"
                placeholder="987654321"
                value={gaViewId}
                onChange={(e) => setGaViewId(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Universal Analytics View ID (for legacy data)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceAccount" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Service Account Key (JSON)
              </Label>
              <Textarea
                id="serviceAccount"
                placeholder='{"type": "service_account", "project_id": "...", ...}'
                value={gaServiceAccountKey}
                onChange={(e) => setGaServiceAccountKey(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Google Cloud Service Account JSON key with Analytics permissions
              </p>
            </div>

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {testResult.success 
                    ? "Connection test successful!" 
                    : `Connection failed: ${testResult.error}`
                  }
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Setup Instructions:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Go to your Google Analytics account</li>
              <li>Navigate to Admin &gt; Property Settings</li>
              <li>Copy your Measurement ID and Property ID</li>
              <li>Create a Service Account in Google Cloud Console</li>
              <li>Grant Analytics Viewer permissions</li>
              <li>Download the JSON key file and paste it above</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            {gaPropertyId && gaServiceAccountKey && (
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={testing}
                className="flex-1 sm:flex-none"
              >
                {testing ? "Testing..." : "Test Connection"}
              </Button>
            )}
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {currentConfig?.gaConfigured && (
              <Button
                variant="destructive"
                onClick={handleRemove}
                className="flex-1 sm:flex-none"
              >
                Remove
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={setupMutation.isPending || !gaTrackingId || !gaPropertyId}
              className="flex-1 sm:flex-none"
            >
              {setupMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}