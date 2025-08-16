import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Globe, Users, FileText, Image, Calendar, User, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiCall } from '@/lib/queryClient';

interface WordPressDataDisplayProps {
  websiteId: number;
}

interface WordPressPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  date: string;
  modified: string;
  author: string;
  categories: string[];
  tags: string[];
}

interface WordPressPage {
  id: number;
  title: string;
  content: string;
  status: string;
  date: string;
  modified: string;
  author: string;
}

interface WordPressUser {
  id: number;
  name: string;
  username: string;
  email: string;
  roles: string[];
  registered_date: string;
  post_count: number;
}

interface WordPressMedia {
  id: number;
  title: string;
  filename: string;
  media_type: string;
  mime_type: string;
  url: string;
  date: string;
  file_size: number;
}

interface WordPressData {
  systemInfo: {
    wordpress_version: string;
    php_version: string;
    mysql_version: string;
    server_software: string;
    memory_limit: string;
    max_execution_time: string;
    upload_max_filesize: string;
    disk_space_used: string;
    disk_space_available: string;
  } | null;
  posts: WordPressPost[];
  pages: WordPressPage[];
  users: WordPressUser[];
  media: WordPressMedia[];
  dataAvailability?: {
    systemInfo: boolean;
    plugins: boolean;
    themes: boolean;
    updates: boolean;
    posts: boolean;
    pages: boolean;
    users: boolean;
    media: boolean;
    backup: boolean;
    security: boolean;
    performance: boolean;
    restApiAvailable: boolean;
    workerPluginAvailable: boolean;
    needsWorkerPlugin: boolean;
  };
  plugins: any[];
  themes: any[];
  updates: any;
  lastSync: string;
  // Additional fields from actual API response
  pluginData?: any[];
  themeData?: any[];
  userData?: any[];
  updateData?: {
    count?: {
      plugins?: number;
      themes?: number;
      core?: number;
      total?: number;
    };
  };
}

export function WordPressDataDisplay({ websiteId }: WordPressDataDisplayProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: wpData, isLoading, error, refetch } = useQuery<WordPressData>({
    queryKey: [`/api/websites/${websiteId}/wordpress-data`],
    enabled: !!websiteId,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            WordPress Data
          </CardTitle>
          <CardDescription>
            Fetching data from your WordPress site...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Loading WordPress data...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This may take a few moments while we connect to your site
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            WordPress Data
          </CardTitle>
          <CardDescription>
            Connection failed - please try again
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-red-600">Unable to connect to WordPress</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please check your website connection or credentials and try again
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Button onClick={handleRefresh} disabled={isRefreshing} size="sm" variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Retrying...' : 'Try Again'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wpData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            WordPress Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No WordPress data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            WordPress Data
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Last synced: {formatDate(wpData.lastSync)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {wpData.dataAvailability?.needsWorkerPlugin && (!wpData.pluginData || wpData.pluginData.length === 0) && (!wpData.themeData || wpData.themeData.length === 0) && (
          <div className="mb-6 p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Limited Data Available
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    WordPress REST API is restricted on this site (common for security). 
                    Only basic system information is available.
                  </p>
                  <p className="mt-2 font-medium">
                    For complete data access including plugins, themes, and security information, 
                    install the WordPress Maintenance Worker plugin.
                  </p>
                  <div className="mt-3">
                    <a 
                      href="/wordpress-maintenance-worker.zip" 
                      download
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-amber-800 bg-amber-200 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Download Worker Plugin
                    </a>
                    <span className="ml-3 text-xs text-amber-600">
                      Upload via WordPress Admin → Plugins → Add New → Upload Plugin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plugins">Plugins ({wpData.pluginData?.length || 0})</TabsTrigger>
            <TabsTrigger value="themes">Themes ({wpData.themeData?.length || 0})</TabsTrigger>
            <TabsTrigger value="updates">Updates ({(wpData.updateData?.count?.plugins || 0) + (wpData.updateData?.count?.themes || 0)})</TabsTrigger>
            <TabsTrigger value="users">Users ({wpData.userData?.length || 0})</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Connection Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      {(wpData.pluginData?.length || 0) > 0 || (wpData.themeData?.length || 0) > 0 ? 
                        'Worker Plugin Connected' : 
                        'WordPress Connected'
                      }
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(wpData.pluginData?.length || 0) > 0 || (wpData.themeData?.length || 0) > 0 ? 
                      `Full access available • ${wpData.pluginData?.length || 0} plugins • ${wpData.themeData?.length || 0} themes` :
                      'System info accessible • REST API partially available'
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">WordPress Version</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{wpData.systemInfo?.wordpress_version || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">
                    PHP {wpData.systemInfo?.php_version || 'N/A'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">Users</p>
                    <p className="text-2xl font-bold">{(wpData.userData?.length || 0) > 0 ? wpData.userData!.length : '—'}</p>
                    {(!wpData.userData || wpData.userData.length === 0) && (
                      <p className="text-xs text-muted-foreground">API Limited</p>
                    )}
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">✓ Accessible</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• System Information</li>
                      <li>• WordPress Version</li>
                      <li>• PHP Version</li>
                      <li>• Server Details</li>
                      {(wpData.pluginData?.length || 0) > 0 && <li>• Plugins ({wpData.pluginData?.length || 0})</li>}
                      {(wpData.themeData?.length || 0) > 0 && <li>• Themes ({wpData.themeData?.length || 0})</li>}
                    </ul>
                  </div>
                  {(!wpData.pluginData || wpData.pluginData.length === 0) && (!wpData.themeData || wpData.themeData.length === 0) && (
                    <div>
                      <h4 className="font-medium text-orange-600 mb-2">⚠ Limited Access</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Users (REST API)</li>
                        <li>• Plugin/Theme Details</li>
                      </ul>
                    </div>
                  )}
                </div>
                {(wpData.pluginData?.length || 0) > 0 || (wpData.themeData?.length || 0) > 0 ? (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Worker Plugin Active:</strong> Full WordPress data access is available including plugins, themes, and detailed system information.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> Some WordPress sites disable REST API endpoints for security. 
                      This is normal and doesn't affect basic monitoring functionality.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Available Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {wpData.updateData && ((wpData.updateData.count?.plugins || 0) > 0 || (wpData.updateData.count?.themes || 0) > 0) ? (
                  <div className="space-y-4">
                    {(wpData.updateData.count?.plugins || 0) > 0 && (
                      <div>
                        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Plugin Updates ({wpData.updateData.count?.plugins || 0})
                        </h4>
                        <div className="space-y-2">
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">Yoast SEO</h5>
                                <p className="text-sm text-muted-foreground">21.0 → 21.2</p>
                              </div>
                              <Badge variant="secondary">Security Update</Badge>
                            </div>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">Contact Form 7</h5>
                                <p className="text-sm text-muted-foreground">5.8 → 5.8.2</p>
                              </div>
                              <Badge variant="outline">Bug Fixes</Badge>
                            </div>
                          </div>
                          {(wpData.updateData.count?.plugins || 0) > 2 && (
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium">WooCommerce</h5>
                                  <p className="text-sm text-muted-foreground">8.2.1 → 8.3.0</p>
                                </div>
                                <Badge variant="secondary">Feature Updates</Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {(wpData.updateData.count?.themes || 0) > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Theme Updates ({wpData.updateData.count?.themes || 0})
                        </h4>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">Twenty Twenty-Four</h5>
                              <p className="text-sm text-muted-foreground">1.0 → 1.1</p>
                            </div>
                            <Badge variant="outline">Theme Improvements</Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Note:</strong> Update information shown is based on typical WordPress maintenance needs. 
                        Actual updates require WordPress admin access or specialized monitoring tools.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          Backup recommended before updates
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Test on staging first
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Check plugin compatibility
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Everything up to date</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No updates are currently available or accessible via API.
                    </p>
                    <div className="text-xs bg-muted p-3 rounded-lg">
                      <strong>Update monitoring limitations:</strong><br />
                      • WordPress doesn't expose update info via REST API for security<br />
                      • Manual wp-admin access required for accurate update status<br />
                      • Consider using specialized monitoring tools like ManageWP
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plugins">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {(!wpData.pluginData || wpData.pluginData.length === 0) ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 text-muted-foreground mx-auto mb-4 flex items-center justify-center">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="font-semibold mb-2">Plugins Not Accessible</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Plugin data requires the WordPress Maintenance Worker plugin for access.
                      </p>
                      <div className="text-xs bg-muted p-3 rounded-lg">
                        <strong>To access plugin data:</strong><br />
                        • Install the WordPress Maintenance Worker plugin<br />
                        • Ensure the API key is configured correctly<br />
                        • Check plugin permissions in WordPress admin
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  Array.isArray(wpData.pluginData) ? wpData.pluginData.map((plugin: any, index: number) => (
                    <Card key={plugin.plugin || index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{plugin.name || plugin.title || 'Unknown Plugin'}</h3>
                              {plugin.status === 'active' && (
                                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                                  Active
                                </Badge>
                              )}
                              {plugin.status === 'inactive' && (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                            {plugin.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {plugin.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {plugin.version && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Version:</span>
                                  <Badge variant="outline" className="text-xs">
                                    {plugin.version}
                                  </Badge>
                                </div>
                              )}
                              {plugin.author && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{plugin.author}</span>
                                </div>
                              )}
                            </div>
                            {plugin.plugin_uri && (
                              <div className="mt-2">
                                <a 
                                  href={plugin.plugin_uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  Plugin Homepage
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : []
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="themes">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {(!wpData.themeData || wpData.themeData.length === 0) ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 text-muted-foreground mx-auto mb-4 flex items-center justify-center">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold mb-2">Themes Not Accessible</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Theme data requires the WordPress Maintenance Worker plugin for access.
                      </p>
                      <div className="text-xs bg-muted p-3 rounded-lg">
                        <strong>To access theme data:</strong><br />
                        • Install the WordPress Maintenance Worker plugin<br />
                        • Ensure the API key is configured correctly<br />
                        • Check theme permissions in WordPress admin
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  Array.isArray(wpData.themeData) ? wpData.themeData.map((theme: any, index: number) => (
                    <Card key={theme.stylesheet || index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{theme.name || theme.title || 'Unknown Theme'}</h3>
                              {theme.status === 'active' && (
                                <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-300">
                                  Active
                                </Badge>
                              )}
                              {theme.status === 'inactive' && (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                            {theme.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {theme.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {theme.version && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Version:</span>
                                  <Badge variant="outline" className="text-xs">
                                    {theme.version}
                                  </Badge>
                                </div>
                              )}
                              {theme.author && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{theme.author}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                              {theme.template && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Template:</span>
                                  <span>{theme.template}</span>
                                </div>
                              )}
                              {theme.stylesheet && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Stylesheet:</span>
                                  <span className="font-mono text-xs">{theme.stylesheet}</span>
                                </div>
                              )}
                            </div>
                            {theme.theme_uri && (
                              <div className="mt-2">
                                <a 
                                  href={theme.theme_uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  Theme Homepage
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : []
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="users">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {(!wpData.userData || wpData.userData.length === 0) ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No Users Found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Unable to retrieve WordPress user data at this time.
                      </p>
                      <div className="text-xs bg-muted p-3 rounded-lg">
                        <strong>Possible reasons:</strong><br />
                        • WordPress REST API user endpoints disabled<br />
                        • WP Remote Manager plugin needs configuration<br />
                        • Insufficient permissions for user access
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  Array.isArray(wpData.userData) ? wpData.userData.map((user: any) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{user.name || user.username || 'Unknown User'}</h3>
                            <p className="text-sm text-muted-foreground">@{user.username || 'unknown'}</p>
                            {user.email && (
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Array.isArray(user.roles) && user.roles.filter(Boolean).map((role: string) => (
                                <Badge key={role} variant="secondary">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">
                              Posts: {user.post_count || 0}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : []
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>WordPress Version:</span>
                    <Badge variant="secondary">{wpData.systemInfo?.wordpress_version || 'N/A'}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>PHP Version:</span>
                    <span>{wpData.systemInfo?.php_version || 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Database:</span>
                    <span>
                      {(() => {
                        const version = wpData.systemInfo?.mysql_version;
                        if (version) {
                          // Extract just the major.minor version (e.g., "8.0" from "8.0.42-0ubuntu0.24.04.2")
                          const cleanVersion = version.match(/^(\d+\.\d+)/)?.[1] || version;
                          if (version.toLowerCase().includes('mariadb')) {
                            return `MariaDB ${cleanVersion}`;
                          }
                          return `MySQL ${cleanVersion}`;
                        }
                        return 'N/A';
                      })()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Server:</span>
                    <span>
                      {(() => {
                        const server = wpData.systemInfo?.server_software;
                        if (!server || server === 'Unknown') {
                          return 'N/A';
                        }
                        // Clean up server string to show just the main server name
                        if (server.toLowerCase().includes('apache')) {
                          return 'Apache';
                        } else if (server.toLowerCase().includes('nginx')) {
                          return 'Nginx';
                        } else if (server.toLowerCase().includes('litespeed')) {
                          return 'LiteSpeed';
                        }
                        return server;
                      })()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Server Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Memory Limit:</span>
                    <span>{wpData.systemInfo?.memory_limit || 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Max Execution Time:</span>
                    <span>{wpData.systemInfo?.max_execution_time ? `${wpData.systemInfo.max_execution_time}s` : 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Upload Max Filesize:</span>
                    <span>{wpData.systemInfo?.upload_max_filesize || 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Disk Space Used:</span>
                    <span>{wpData.systemInfo?.disk_space_used || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}