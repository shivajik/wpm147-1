import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Wifi,
  WifiOff,
  Settings,
  RefreshCw
} from "lucide-react";

interface WRMDiagnosticProps {
  websiteId: number;
}

interface DiagnosticResult {
  connected: boolean;
  issues: string[];
  workingEndpoints: string[];
  failedEndpoints: string[];
  capabilities: {
    updates: boolean;
    maintenance: boolean;
    plugins: boolean;
    themes: boolean;
  };
}

export function WRMDiagnostic({ websiteId }: WRMDiagnosticProps) {
  const { toast } = useToast();
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const runDiagnosticMutation = useMutation({
    mutationFn: async (): Promise<DiagnosticResult> => {
      return apiCall(`/api/websites/${websiteId}/wrm/test-connection`, {
        method: 'GET',
      });
    },
    onSuccess: (data) => {
      setDiagnosticResult(data);
      setShowDetails(true);
      
      if (data.connected) {
        toast({
          title: "Diagnostic Complete",
          description: data.issues.length === 0 
            ? "WP Remote Manager is working properly" 
            : `Connected but ${data.issues.length} issue(s) found`,
          variant: data.issues.length === 0 ? "default" : "destructive"
        });
      } else {
        toast({
          title: "Connection Issues Found", 
          description: `${data.issues.length} issue(s) detected with WP Remote Manager`,
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Diagnostic Failed",
        description: error.message || "Unable to run WP Remote Manager diagnostic",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = () => {
    if (!diagnosticResult) return <Activity className="w-4 h-4" />;
    
    if (diagnosticResult.connected && diagnosticResult.issues.length === 0) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (diagnosticResult.connected && diagnosticResult.issues.length > 0) {
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    if (!diagnosticResult) return "default";
    
    if (diagnosticResult.connected && diagnosticResult.issues.length === 0) {
      return "default";
    } else if (diagnosticResult.connected && diagnosticResult.issues.length > 0) {
      return "secondary";
    } else {
      return "destructive";
    }
  };

  return (
    <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
      <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-700">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-600" />
            WRM Diagnostic
          </div>
          {diagnosticResult && (
            <Badge variant={getStatusColor()}>
              {diagnosticResult.connected ? (
                diagnosticResult.issues.length === 0 ? "Healthy" : "Issues"
              ) : "Failed"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <Button 
          onClick={() => runDiagnosticMutation.mutate()}
          disabled={runDiagnosticMutation.isPending}
          className="w-full"
          data-testid="button-run-diagnostic"
        >
          {getStatusIcon()}
          <span className="ml-2">
            {runDiagnosticMutation.isPending ? 'Running...' : 'Run Diagnostic'}
          </span>
          {runDiagnosticMutation.isPending && (
            <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
          )}
        </Button>

        {showDetails && diagnosticResult && (
          <div className="space-y-3 text-sm">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="flex items-center">
                {diagnosticResult.connected ? (
                  <Wifi className="w-4 h-4 mr-2 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 mr-2 text-red-600" />
                )}
                Connection
              </span>
              <span className={diagnosticResult.connected ? "text-green-600" : "text-red-600"}>
                {diagnosticResult.connected ? "Connected" : "Failed"}
              </span>
            </div>

            {/* Capabilities */}
            <div className="space-y-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Capabilities:</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className={`p-1 rounded ${diagnosticResult.capabilities.updates ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                  Updates: {diagnosticResult.capabilities.updates ? "✓" : "✗"}
                </div>
                <div className={`p-1 rounded ${diagnosticResult.capabilities.plugins ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                  Plugins: {diagnosticResult.capabilities.plugins ? "✓" : "✗"}
                </div>
                <div className={`p-1 rounded ${diagnosticResult.capabilities.themes ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                  Themes: {diagnosticResult.capabilities.themes ? "✓" : "✗"}
                </div>
                <div className={`p-1 rounded ${diagnosticResult.capabilities.maintenance ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                  Maintenance: {diagnosticResult.capabilities.maintenance ? "✓" : "✗"}
                </div>
              </div>
            </div>

            {/* Issues */}
            {diagnosticResult.issues.length > 0 && (
              <div className="space-y-1">
                <h4 className="font-medium text-red-600 dark:text-red-400">Issues Found:</h4>
                <ul className="space-y-1">
                  {diagnosticResult.issues.map((issue, index) => (
                    <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                      <AlertCircle className="w-3 h-3 mr-1 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Working Endpoints */}
            {diagnosticResult.workingEndpoints.length > 0 && (
              <div className="space-y-1">
                <h4 className="font-medium text-green-600 dark:text-green-400">Working Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {diagnosticResult.workingEndpoints.map((endpoint, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                      {endpoint}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Endpoints */}
            {diagnosticResult.failedEndpoints.length > 0 && (
              <div className="space-y-1">
                <h4 className="font-medium text-red-600 dark:text-red-400">Failed Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {diagnosticResult.failedEndpoints.map((endpoint, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700">
                      {endpoint}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDetails(false)}
              className="w-full mt-2"
              data-testid="button-hide-details"
            >
              Hide Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}