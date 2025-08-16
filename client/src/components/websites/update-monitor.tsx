import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Package,
  AlertTriangle,
  Activity
} from "lucide-react";
import { formatDistance } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface UpdateMonitorProps {
  websiteId: number;
  websiteName: string;
}

interface UpdateLog {
  id: number;
  websiteId: number;
  userId: number;
  updateType: "plugin" | "theme" | "wordpress";
  itemName: string;
  itemSlug?: string;
  fromVersion?: string;
  toVersion?: string;
  updateStatus: "success" | "failed" | "pending";
  errorMessage?: string;
  updateData?: any;
  duration?: number;
  automatedUpdate: boolean;
  createdAt: string;
}

interface WordPressUpdate {
  wordpress: {
    update_available: boolean;
    new_version?: string;
  };
  count: {
    total: number;
    plugins: number;
    themes: number;
    core: number;
  };
  plugins?: Array<{
    name: string;
    current_version: string;
    new_version: string;
    plugin: string;
  }>;
  themes?: Array<{
    name: string;
    current_version: string;
    new_version: string;
    theme: string;
  }>;
}

export default function UpdateMonitor({ websiteId, websiteName }: UpdateMonitorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for update logs with frequent refresh when pending updates exist
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useQuery<UpdateLog[]>({
    queryKey: [`/api/websites/${websiteId}/update-logs`],
    enabled: !!websiteId,
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: (data) => {
      // Auto-refresh every 5 seconds if there are pending updates
      const hasPendingUpdates = Array.isArray(data) ? data.some(log => log.updateStatus === 'pending') : false;
      return hasPendingUpdates ? 5000 : 30000; // 5s for pending, 30s otherwise
    },
  });

  // Query for pending updates with automatic refresh
  const { data: pendingUpdates, isLoading: updatesLoading, refetch: refetchUpdates } = useQuery<WordPressUpdate>({
    queryKey: [`/api/websites/${websiteId}/wrm/updates`],
    enabled: !!websiteId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get recent update activity (last 5 minutes)
  const recentLogs = logs?.filter(log => {
    const logTime = new Date(log.createdAt);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return logTime > fiveMinutesAgo;
  }) || [];

  const pendingCount = logs?.filter(log => log.updateStatus === 'pending').length || 0;
  const totalPendingUpdates = pendingUpdates?.count.total || 0;

  const refreshAllData = () => {
    refetchLogs();
    refetchUpdates();
    // Also refresh WordPress data
    queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/wordpress-data`] });
    
    toast({
      title: "Refreshing Data",
      description: "Update logs and pending updates are being refreshed...",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="animate-pulse">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Update Monitor - {websiteName}
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2 animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                {pendingCount} Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Real-time monitoring of WordPress updates and logs
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAllData}
          disabled={logsLoading || updatesLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${(logsLoading || updatesLoading) ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Pending Updates</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{totalPendingUpdates}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Processing</span>
            </div>
            <span className="text-lg font-bold text-yellow-600">{pendingCount}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Recent Activity</span>
            </div>
            <span className="text-lg font-bold text-green-600">{recentLogs.length}</span>
          </div>
        </div>

        {/* Recent Update Activity */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Recent Update Activity
            {recentLogs.length > 0 && (
              <Badge variant="outline" className="ml-2">{recentLogs.length} items</Badge>
            )}
          </h3>
          
          {recentLogs.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
              No recent update activity (last 5 minutes)
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex-shrink-0">
                    {getStatusIcon(log.updateStatus)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{log.itemName}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.updateType} • {log.fromVersion} → {log.toVersion}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(log.updateStatus)}
                        <span className="text-xs text-muted-foreground">
                          {formatDistance(new Date(log.createdAt), new Date(), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    {log.errorMessage && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        {log.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Form 7 Specific Status */}
        {logs && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Contact Form 7 Update Status
            </h3>
            {(() => {
              const contactFormLogs = logs.filter(log => 
                log.itemName.toLowerCase().includes('contact form 7') || 
                log.itemSlug?.includes('contact-form-7')
              );
              
              if (contactFormLogs.length === 0) {
                return (
                  <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
                    No Contact Form 7 update history found
                  </div>
                );
              }

              const latestContactFormLog = contactFormLogs[0];
              return (
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Latest Contact Form 7 Update</div>
                    {getStatusBadge(latestContactFormLog.updateStatus)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Version: {latestContactFormLog.fromVersion} → {latestContactFormLog.toVersion}</div>
                    <div>Time: {formatDistance(new Date(latestContactFormLog.createdAt), new Date(), { addSuffix: true })}</div>
                    {latestContactFormLog.duration && (
                      <div>Duration: {(latestContactFormLog.duration / 1000).toFixed(1)}s</div>
                    )}
                  </div>
                  {latestContactFormLog.updateStatus === 'success' && (
                    <div className="text-sm text-green-700 dark:text-green-300 mt-2 font-medium">
                      ✓ Contact Form 7 successfully updated to version {latestContactFormLog.toVersion}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Auto-refresh Notice */}
        {(pendingCount > 0 || recentLogs.length > 0) && (
          <div className="text-xs text-muted-foreground text-center p-2 border-t">
            <Activity className="h-3 w-3 inline mr-1" />
            Auto-refreshing every {pendingCount > 0 ? '5' : '30'} seconds while monitoring updates
          </div>
        )}
      </CardContent>
    </Card>
  );
}