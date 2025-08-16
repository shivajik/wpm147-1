import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Package,
  Palette,
  Shield,
  Download,
  FileText
} from "lucide-react";
import { formatDistance } from "date-fns";

interface UpdateLogsProps {
  websiteId: number;
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

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'plugin':
      return <Package className="h-4 w-4 text-blue-600" />;
    case 'theme':
      return <Palette className="h-4 w-4 text-purple-600" />;
    case 'wordpress':
      return <Shield className="h-4 w-4 text-orange-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'success':
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Success
      </Badge>;
    case 'failed':
      return <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>;
    case 'pending':
      return <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Format plugin names to be more user-friendly
const formatPluginName = (itemName: string) => {
  // Handle WordPress plugin path format (e.g., "updraftplus/updraftplus.php")
  if (itemName.includes('/') && itemName.includes('.php')) {
    const pluginSlug = itemName.split('/')[0];
    return formatPluginSlugToName(pluginSlug);
  }
  
  // Handle theme slugs (e.g., "twentytwentyfive")
  if (itemName.includes('twenty')) {
    return itemName.replace(/([a-z])([A-Z])/g, '$1 $2')
                  .replace(/twenty/gi, 'Twenty ')
                  .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return itemName;
};

// Convert plugin slugs to more readable names
const formatPluginSlugToName = (slug: string) => {
  const pluginNameMap: { [key: string]: string } = {
    'updraftplus': 'UpdraftPlus',
    'really-simple-ssl': 'Really Simple SSL',
    'defender-security': 'Defender Security',
    'hummingbird-performance': 'Hummingbird Performance',
    'seo-by-rank-math': 'Rank Math SEO',
    'contact-form-7': 'Contact Form 7',
    'hello-dolly': 'Hello Dolly',
    'advanced-custom-fields': 'Advanced Custom Fields',
    'wordpress-seo': 'Yoast SEO'
  };
  
  return pluginNameMap[slug] || slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Format version information more intelligently
const formatVersionInfo = (fromVersion?: string, toVersion?: string, status?: string) => {
  if (!fromVersion || !toVersion || fromVersion === 'unknown' || toVersion === 'unknown') {
    if (status === 'failed') {
      return <span className="ml-2 text-red-600">• Update attempt failed</span>;
    } else if (status === 'pending') {
      return <span className="ml-2 text-yellow-600">• Update in progress</span>;
    }
    return <span className="ml-2">• Version info unavailable</span>;
  }
  
  return (
    <span className="ml-2">
      {fromVersion} → {toVersion}
    </span>
  );
};

const formatDuration = (duration?: number) => {
  if (!duration) return 'N/A';
  if (duration < 1000) return `${duration}ms`;
  return `${(duration / 1000).toFixed(1)}s`;
};

export default function UpdateLogs({ websiteId }: UpdateLogsProps) {
  // Check if user is authenticated
  const authToken = localStorage.getItem("auth_token");
  const isAuthenticated = !!authToken;

  const { data: logs, isLoading, refetch } = useQuery<UpdateLog[]>({
    queryKey: [`/api/websites/${websiteId}/update-logs`],
    enabled: !!websiteId && isAuthenticated, // Only fetch if authenticated
    staleTime: 30 * 1000, // 30 seconds for faster refresh during updates
    refetchInterval: (data) => {
      // Auto-refresh every 10 seconds if there are pending updates
      const hasPendingUpdates = Array.isArray(data) ? data.some(log => log.updateStatus === 'pending') : false;
      return hasPendingUpdates ? 10000 : false;
    },
  });

  // Don't show loading state if not authenticated
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Update Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Authentication Required
            </h3>
            <p className="text-sm text-muted-foreground">
              Please log in to view update logs
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Update Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading update logs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Update Logs
          {Array.isArray(logs) && logs.some(log => log.updateStatus === 'pending') && (
            <Badge variant="secondary" className="ml-2 animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              Live
            </Badge>
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {!logs || logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No Update History
            </h3>
            <p className="text-sm text-muted-foreground">
              Update logs will appear here after you perform updates
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            <div className="text-xs text-muted-foreground mb-3 px-1">
              Total: {logs.length} update{logs.length !== 1 ? 's' : ''} • 
              Success: {logs.filter(log => log.updateStatus === 'success').length} • 
              Failed: {logs.filter(log => log.updateStatus === 'failed').length}
            </div>
            {Array.isArray(logs) && logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(log.updateType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {formatPluginName(log.itemName)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {log.updateType.charAt(0).toUpperCase() + log.updateType.slice(1)} update
                        {formatVersionInfo(log.fromVersion, log.toVersion, log.updateStatus)}
                      </div>
                      {log.errorMessage && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1 truncate">
                          {log.errorMessage}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(log.updateStatus)}
                      <div className="text-xs text-muted-foreground">
                        {formatDistance(new Date(log.createdAt), new Date(), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  {log.duration && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Duration: {formatDuration(log.duration)}
                    </div>
                  )}
                  
                  {log.errorMessage && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      {log.errorMessage}
                    </div>
                  )}
                  
                  {log.automatedUpdate && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Automated update
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {logs && logs.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
            <span>Total: {logs.length} updates</span>
            <span>
              Success: {logs.filter(log => log.updateStatus === 'success').length} | 
              Failed: {logs.filter(log => log.updateStatus === 'failed').length}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}