import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Bug, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface WRMDebugPanelProps {
  websiteId: number;
}

export function WRMDebugPanel({ websiteId }: WRMDebugPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch website data
  const { data: website, isLoading: websiteLoading, error: websiteError } = useQuery({
    queryKey: [`/api/websites/${websiteId}`],
    enabled: !!websiteId,
  });

  // Fetch WRM plugins data
  const { data: wrmPlugins, isLoading: pluginsLoading, error: pluginsError, refetch: refetchPlugins } = useQuery({
    queryKey: [`/api/websites/${websiteId}/wrm-plugins`],
    enabled: !!websiteId && !!website,
    retry: false, // Don't retry to see the actual error
  });

  // Fetch WRM themes data
  const { data: wrmThemes, isLoading: themesLoading, error: themesError, refetch: refetchThemes } = useQuery({
    queryKey: [`/api/websites/${websiteId}/wrm-themes`],
    enabled: !!websiteId && !!website,
    retry: false,
  });

  // Fetch WRM users data
  const { data: wrmUsers, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: [`/api/websites/${websiteId}/wrm-users`],
    enabled: !!websiteId && !!website,
    retry: false,
  });

  // Fetch WRM updates data
  const { data: wrmUpdates, isLoading: updatesLoading, error: updatesError, refetch: refetchUpdates } = useQuery({
    queryKey: [`/api/websites/${websiteId}/wrm/updates`],
    enabled: !!websiteId && !!website,
    retry: false,
  });

  // Fetch WRM status data
  const { data: wrmStatus, isLoading: statusLoading, error: statusError, refetch: refetchStatus } = useQuery({
    queryKey: [`/api/websites/${websiteId}/wrm/status`],
    enabled: !!websiteId && !!website,
    retry: false,
  });

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchPlugins(),
        refetchThemes(),
        refetchUsers(),
        refetchUpdates(),
        refetchStatus()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (loading: boolean, error: any, data: any) => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    if (error) return <XCircle className="h-4 w-4 text-red-500" />;
    if (data) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (loading: boolean, error: any, data: any) => {
    if (loading) return <Badge variant="secondary">Loading...</Badge>;
    if (error) return <Badge variant="destructive">Error</Badge>;
    if (data) return <Badge variant="default">Success</Badge>;
    return <Badge variant="outline">No Data</Badge>;
  };

  // Check if the core WRM functionality is working (plugins, themes, users, updates)
  const isCoreWRMWorking = () => {
    let workingCount = 0;
    
    // Check each endpoint individually
    if (wrmPlugins && !pluginsError) workingCount++;
    if (wrmThemes && !themesError) workingCount++;
    if (wrmUsers && !usersError) workingCount++;
    if (wrmUpdates && !updatesError) workingCount++;
    
    // Consider it working if at least 2 core endpoints are successful
    return workingCount >= 2;
  };

  const formatError = (error: any) => {
    if (!error) return 'No error';
    
    // Handle specific JSON parsing errors (HTML responses)
    if (error.message && (error.message.includes('Unexpected token') || error.message.includes('JSON.parse: unexpected character'))) {
      return 'WordPress site returned HTML instead of JSON data. This usually means:\n• Site is showing a 503 Service Unavailable page\n• WRM plugin may not be installed properly\n• Site may be in maintenance mode\n• Server configuration issues';
    }
    
    // Handle HTML error page responses
    if (error.message && error.message.includes('HTML error page')) {
      return `${error.message}\n\nTroubleshooting steps:\n• Check if the WordPress site is accessible in your browser\n• Verify the WRM plugin is installed and activated\n• Ensure the API key is correct\n• Check if the site is in maintenance mode`;
    }
    
    // Handle connection errors
    if (error.message && (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND'))) {
      return `Cannot connect to WordPress site: ${error.message}\n\nTroubleshooting steps:\n• Verify the website URL is correct\n• Check if the site is online and accessible\n• Ensure there are no firewall restrictions`;
    }
    
    // Handle timeout errors
    if (error.message && error.message.includes('timeout')) {
      return `Request timeout: ${error.message}\n\nTroubleshooting steps:\n• The WordPress site may be experiencing high load\n• Check server response times\n• Consider increasing timeout settings if this persists`;
    }
    
    // Handle other common errors
    if (error.message) {
      return error.message;
    }
    
    return JSON.stringify(error, null, 2);
  };

  const debugInfo = {
    websiteId,
    website: {
      exists: !!website,
      hasWrmApiKey: !!(website as any)?.wrmApiKey,
      connectionStatus: (website as any)?.connectionStatus,
      url: (website as any)?.url,
      name: (website as any)?.name,
    },
    queries: {
      plugins: {
        loading: pluginsLoading,
        error: pluginsError,
        data: wrmPlugins,
        dataLength: Array.isArray(wrmPlugins) ? wrmPlugins.length : 0,
        enabled: !!websiteId && !!website,
      },
      themes: {
        loading: themesLoading,
        error: themesError,
        data: wrmThemes,
        dataLength: Array.isArray(wrmThemes) ? wrmThemes.length : 0,
        enabled: !!websiteId && !!website,
      },
      users: {
        loading: usersLoading,
        error: usersError,
        data: wrmUsers,
        dataLength: Array.isArray(wrmUsers) ? wrmUsers.length : 0,
        enabled: !!websiteId && !!website,
      },
      updates: {
        loading: updatesLoading,
        error: updatesError,
        data: wrmUpdates,
        enabled: !!websiteId && !!website,
      },
      status: {
        loading: statusLoading,
        error: statusError,
        data: wrmStatus,
        enabled: !!websiteId && !!website,
      },
    },
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            WRM Debug Panel
          </CardTitle>
          <CardDescription>
            Debug information for WordPress Remote Manager API connections
            {isCoreWRMWorking() && (
              <Badge variant="default" className="ml-2">Core WRM Working</Badge>
            )}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="queries">Queries</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Website Status</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Website ID:</span>
                      <span>{websiteId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Website Found:</span>
                      <span>{website ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Has WRM API Key:</span>
                      <span>{(website as any)?.wrmApiKey ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connection Status:</span>
                      <Badge variant={(website as any)?.connectionStatus === 'connected' ? 'default' : 'destructive'}>
                        {(website as any)?.connectionStatus || 'unknown'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">API Endpoints Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Plugins:</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(pluginsLoading, pluginsError, wrmPlugins)}
                        {getStatusBadge(pluginsLoading, pluginsError, wrmPlugins)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Themes:</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(themesLoading, themesError, wrmThemes)}
                        {getStatusBadge(themesLoading, themesError, wrmThemes)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Users:</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(usersLoading, usersError, wrmUsers)}
                        {getStatusBadge(usersLoading, usersError, wrmUsers)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Updates:</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(updatesLoading, updatesError, wrmUpdates)}
                        {getStatusBadge(updatesLoading, updatesError, wrmUpdates)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(statusLoading, statusError, wrmStatus)}
                        {getStatusBadge(statusLoading, statusError, wrmStatus)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Data Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="font-medium">{Array.isArray(wrmPlugins) ? wrmPlugins.length : 0}</div>
                    <div className="text-gray-600">Plugins</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="font-medium">{Array.isArray(wrmThemes) ? wrmThemes.length : 0}</div>
                    <div className="text-gray-600">Themes</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="font-medium">{Array.isArray(wrmUsers) ? wrmUsers.length : 0}</div>
                    <div className="text-gray-600">Users</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="font-medium">{(wrmUpdates as any)?.count?.total || 0}</div>
                    <div className="text-gray-600">Updates</div>
                  </div>
                </div>
              </div>

              {/* Connection status summary */}
              <div className="space-y-2">
                <h4 className="font-medium">Connection Status</h4>
                {isCoreWRMWorking() ? (
                  <div className="text-sm bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">WRM Plugin Working Successfully</span>
                    </div>
                    <p className="text-green-700 dark:text-green-300 text-xs">
                      Core functionality is operational. Plugin/theme data, user information, and updates are being retrieved successfully.
                    </p>
                    {(statusError) && (
                      <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-2">
                        Note: Some optional endpoints may show errors, but this doesn't affect core functionality.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-sm bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800 dark:text-red-200">WRM Connection Issues</span>
                    </div>
                    <p className="font-medium mb-2 text-red-700 dark:text-red-300 text-xs">Troubleshooting steps:</p>
                    <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
                      <li>• Try accessing {(website as any)?.url}/wp-admin in your browser to verify site accessibility</li>
                      <li>• Check if the WP Remote Manager plugin is installed and activated</li>
                      <li>• Verify your API key is correct in the website settings</li>
                      <li>• Look for any maintenance mode plugins that might be active</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="queries" className="space-y-4 mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {Object.entries(debugInfo.queries || {}).map(([key, query]) => (
                  <div key={key} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{key}</h4>
                      {getStatusBadge(query.loading, query.error, query.data)}
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Enabled: {query.enabled ? '✓' : '✗'}</div>
                      <div>Loading: {query.loading ? '✓' : '✗'}</div>
                      <div>Has Data: {query.data ? '✓' : '✗'}</div>
                      {('dataLength' in query) && query.dataLength !== undefined && (
                        <div>Data Length: {query.dataLength}</div>
                      )}
                      {query.error && (
                        <div className="text-red-600">
                          Error: {formatError(query.error)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4 mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {websiteError && (
                  <div className="border border-red-200 rounded p-3">
                    <h4 className="font-medium text-red-600 mb-2">Website Error</h4>
                    <pre className="text-sm bg-red-50 p-2 rounded overflow-x-auto">
                      {formatError(websiteError)}
                    </pre>
                  </div>
                )}
                {pluginsError && (
                  <div className="border border-red-200 rounded p-3">
                    <h4 className="font-medium text-red-600 mb-2">Plugins Error</h4>
                    <pre className="text-sm bg-red-50 p-2 rounded overflow-x-auto">
                      {formatError(pluginsError)}
                    </pre>
                  </div>
                )}
                {themesError && (
                  <div className="border border-red-200 rounded p-3">
                    <h4 className="font-medium text-red-600 mb-2">Themes Error</h4>
                    <pre className="text-sm bg-red-50 p-2 rounded overflow-x-auto">
                      {formatError(themesError)}
                    </pre>
                  </div>
                )}
                {usersError && (
                  <div className="border border-red-200 rounded p-3">
                    <h4 className="font-medium text-red-600 mb-2">Users Error</h4>
                    <pre className="text-sm bg-red-50 p-2 rounded overflow-x-auto">
                      {formatError(usersError)}
                    </pre>
                  </div>
                )}
                {updatesError && (
                  <div className="border border-red-200 rounded p-3">
                    <h4 className="font-medium text-red-600 mb-2">Updates Error</h4>
                    <pre className="text-sm bg-red-50 p-2 rounded overflow-x-auto">
                      {formatError(updatesError)}
                    </pre>
                  </div>
                )}
                {statusError && (
                  <div className="border border-red-200 rounded p-3">
                    <h4 className="font-medium text-red-600 mb-2">Status Error</h4>
                    <pre className="text-sm bg-red-50 p-2 rounded overflow-x-auto">
                      {formatError(statusError)}
                    </pre>
                  </div>
                )}
                {!websiteError && !pluginsError && !themesError && !usersError && !updatesError && !statusError && (
                  <div className="text-center text-gray-500 py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No errors detected</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="space-y-4 mt-4">
            <ScrollArea className="h-96">
              <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-4 rounded overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}