import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { 
  Download, 
  RefreshCw, 
  ChevronDown, 
  Settings,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Loader2
} from "lucide-react";

interface UpdatesSectionProps {
  websiteId: number;
}

interface WPRMUpdates {
  wordpress: {
    update_available: boolean;
    current_version?: string;
    new_version?: string;
    package?: string;
  };
  plugins: Array<{
    type: 'plugin';
    name: string;
    current_version: string;
    new_version: string;
    package_url: string;
    auto_update: boolean;
  }>;
  themes: Array<{
    type: 'theme';
    name: string;
    current_version: string;
    new_version: string;
    package_url: string;
    auto_update: boolean;
  }>;
  count: {
    total: number;
    plugins: number;
    themes: number;
    core: number;
  };
}

interface WPRMPlugin {
  plugin: string;
  name: string;
  version: string;
  active: boolean;
  network_active: boolean;
  update_available: boolean;
  new_version?: string;
  description: string;
  author: string;
  author_uri?: string;
  plugin_uri?: string;
}

interface WPRMTheme {
  stylesheet: string;
  name: string;
  description: string;
  author: string;
  version: string;
  parent_theme?: string;
  template: string;
  status: 'active' | 'inactive';
  update_available: boolean;
  new_version?: string;
}

interface WebsiteData {
  updateData?: WPRMUpdates;
  pluginData?: WPRMPlugin[];
  themeData?: WPRMTheme[];
  systemInfo?: {
    wordpress_version: string;
    site_url: string;
    admin_email: string;
  };
}

export default function UpdatesSection({ websiteId }: UpdatesSectionProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get WordPress data for update display
  const { data: websiteData, isLoading, refetch } = useQuery<WebsiteData>({
    queryKey: ['/api/websites', websiteId, 'wordpress-data'],
    enabled: !!websiteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get updates using new WP Remote Manager API
  const { data: wrmUpdates, isLoading: updatesLoading, refetch: refetchUpdates } = useQuery<any>({
    queryKey: ['/api/websites', websiteId, 'wrm', 'updates'],
    enabled: !!websiteId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update selected plugins mutation
  const updatePluginsMutation = useMutation({
    mutationFn: async (plugins: string[]) => {
      const response = await apiCall(`/api/websites/${websiteId}/plugins/bulk-update`, {
        method: 'POST',
        body: JSON.stringify({ plugins }),
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Updates Successful",
          description: `${data.updated_plugins?.length || 0} plugins updated successfully`,
        });
      } else {
        toast({
          title: "Update Limitation",
          description: data.message || "Plugin updates require additional WordPress management tools",
          variant: "destructive",
        });
        
        // Show additional info if available
        if (data.note) {
          setTimeout(() => {
            toast({
              title: "Update Information",
              description: data.note,
              variant: "default",
            });
          }, 2000);
        }
      }
      setSelectedItems([]);
      setSelectAll(false);
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'wordpress-data'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update plugins",
        variant: "destructive",
      });
    },
  });

  // Single plugin update mutation
  const updateSinglePluginMutation = useMutation({
    mutationFn: async (pluginSlug: string) => {
      const response = await apiCall(`/api/websites/${websiteId}/plugins/${pluginSlug}/update`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data, pluginSlug) => {
      if (data.success) {
        toast({
          title: "Plugin Updated",
          description: `${pluginSlug} updated successfully`,
        });
      } else {
        toast({
          title: "Update Limitation",
          description: data.message || `Update not available for ${pluginSlug}`,
          variant: "destructive",
        });
        
        // Show additional technical info if available
        if (data.note) {
          setTimeout(() => {
            toast({
              title: "Technical Details",
              description: data.note,
              variant: "default",
            });
          }, 2000);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'wordpress-data'] });
    },
    onError: (error: any, pluginSlug) => {
      toast({
        title: "Update Failed",
        description: `Failed to update ${pluginSlug}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Enable automatic updates mutation
  const enableAutoUpdatesMutation = useMutation({
    mutationFn: async (plugins: string[]) => {
      const response = await apiCall(`/api/websites/${websiteId}/plugins/enable-auto-update`, {
        method: 'POST',
        body: JSON.stringify({ plugins }),
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Automatic Updates Enabled",
        description: `Automatic updates enabled for ${data.plugins?.length || 0} plugins`,
      });
      setSelectedItems([]);
      setSelectAll(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Enable Auto-Updates",
        description: error.message || "Failed to enable automatic updates",
        variant: "destructive",
      });
    },
  });



  // Extract available updates from WordPress data
  const pluginUpdates = Array.isArray(websiteData?.pluginData) ? websiteData.pluginData.filter((p: any) => p.update_available) : [];
  const themeUpdates = Array.isArray(websiteData?.themeData) ? websiteData.themeData.filter((t: any) => t.update_available) : [];
  const coreUpdateAvailable = websiteData?.updateData?.wordpress?.update_available || false;

  const totalUpdates = pluginUpdates.length + themeUpdates.length + (coreUpdateAvailable ? 1 : 0);
  const allUpdateItems = [
    ...(coreUpdateAvailable ? ['wordpress-core'] : []),
    ...(Array.isArray(pluginUpdates) ? pluginUpdates.map((p: any) => `plugin-${p?.plugin || p?.name || 'unknown'}`) : []),
    ...(Array.isArray(themeUpdates) ? themeUpdates.map((t: any) => `theme-${t?.theme || t?.name || 'unknown'}`) : [])
  ];

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(allUpdateItems);
    } else {
      setSelectedItems([]);
    }
  };

  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => Array.isArray(prev) ? prev.filter(id => id !== itemId) : []);
      setSelectAll(false);
    }
  };

  const refreshUpdates = () => {
    refetch();
    refetchUpdates();
  };

  // Handle update all
  const handleUpdateAll = () => {
    const pluginSlugs = Array.isArray(pluginUpdates) ? pluginUpdates.map((plugin: any) => plugin?.plugin || plugin?.name || 'unknown') : [];
    if (pluginSlugs.length > 0) {
      updatePluginsMutation.mutate(pluginSlugs);
    }
  };

  // Handle update selected
  const handleUpdateSelected = () => {
    const pluginSlugs = selectedItems
      .filter(item => item.startsWith('plugin-'))
      .map(item => item.replace('plugin-', ''));
    
    if (pluginSlugs.length > 0) {
      updatePluginsMutation.mutate(pluginSlugs);
    }
  };

  // Handle schedule updates
  const handleScheduleUpdates = () => {
    const pluginSlugs = selectedItems
      .filter(item => item.startsWith('plugin-'))
      .map(item => item.replace('plugin-', ''));
    
    if (pluginSlugs.length > 0) {
      enableAutoUpdatesMutation.mutate(pluginSlugs);
    }
  };

  if (isLoading || updatesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2 text-sm text-muted-foreground">Checking for updates...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Updates
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshUpdates}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {totalUpdates === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
              Everything is up to date!
            </h3>
            <p className="text-sm text-muted-foreground">
              All plugins, themes, and WordPress core are running the latest versions.
            </p>
          </div>
        ) : (
          <>
            {/* Update Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {pluginUpdates.length}
                </div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Plugins
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {themeUpdates.length}
                </div>
                <div className="text-sm font-medium text-purple-700 dark:text-purple-400">
                  Themes
                </div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {coreUpdateAvailable ? 1 : 0}
                </div>
                <div className="text-sm font-medium text-orange-700 dark:text-orange-400">
                  WordPress
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={selectedItems.length === 0 || updatePluginsMutation.isPending}
                  onClick={handleUpdateAll}
                >
                  {updatePluginsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Update all
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Updates List */}
            <div className="space-y-3">
              {/* Select All */}
              <div className="flex items-center space-x-3 pb-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <label 
                  htmlFor="select-all" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Select all
                </label>
                <span className="text-sm text-muted-foreground ml-auto">
                  {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'None selected'}
                </span>
              </div>

              <Separator />

              {/* WordPress Core Update */}
              {coreUpdateAvailable && (
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="wordpress-core"
                    checked={selectedItems.includes('wordpress-core')}
                    onCheckedChange={(checked) => handleItemSelect('wordpress-core', checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        WordPress Core
                      </h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {websiteData?.systemInfo?.wordpress_version}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-green-600">
                          {websiteData?.updateData?.wordpress?.new_version}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      WordPress core update available
                    </p>
                  </div>
                </div>
              )}

              {/* Plugin Updates */}
              {Array.isArray(pluginUpdates) && pluginUpdates.length > 0 ? pluginUpdates.map((plugin: any) => (
                <div key={plugin.name} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={`plugin-${plugin.plugin || plugin.name}`}
                    checked={selectedItems.includes(`plugin-${plugin.plugin || plugin.name}`)}
                    onCheckedChange={(checked) => handleItemSelect(`plugin-${plugin.plugin || plugin.name}`, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        {plugin.name || plugin.plugin}
                        {plugin.active && (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {plugin.current_version || plugin.version}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-green-600">
                          {plugin.new_version}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plugin.description}
                    </p>
                  </div>
                </div>
              )) : (websiteData?.updateData?.count?.plugins || 0) > 0 ? (
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-700 dark:text-blue-400">
                        {websiteData?.updateData?.count?.plugins || 0} Plugin Updates Available
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                        {websiteData?.updateData?.count?.plugins || 0} plugins have updates available. Use the WordPress dashboard or WP Remote Manager to view detailed plugin information and perform updates.
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {websiteData?.updateData?.count?.plugins || 0} updates
                    </Badge>
                  </div>
                </div>
              ) : null}

              {/* Theme Updates */}
              {Array.isArray(themeUpdates) && themeUpdates.length > 0 ? themeUpdates.map((theme: any) => (
                <div key={theme.name} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={`theme-${theme.theme || theme.name}`}
                    checked={selectedItems.includes(`theme-${theme.theme || theme.name}`)}
                    onCheckedChange={(checked) => handleItemSelect(`theme-${theme.theme || theme.name}`, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <div className="h-4 w-4 bg-purple-500 rounded" />
                        {theme.name || theme.theme}
                        {theme.active && (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {theme.current_version || theme.version}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-green-600">
                          {theme.new_version}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {theme.description}
                    </p>
                  </div>
                </div>
              )) : (websiteData?.updateData?.count?.themes || 0) > 0 ? (
                <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-purple-500 rounded" />
                    <div className="flex-1">
                      <h4 className="font-medium text-purple-700 dark:text-purple-400">
                        {websiteData?.updateData?.count?.themes || 0} Theme Updates Available
                      </h4>
                      <p className="text-sm text-purple-600 dark:text-purple-500 mt-1">
                        {websiteData?.updateData?.count?.themes || 0} themes have updates available. Use the WordPress dashboard or WP Remote Manager to view detailed theme information and perform updates.
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      {websiteData?.updateData?.count?.themes || 0} updates
                    </Badge>
                  </div>
                </div>
              ) : null}

              {/* Action Buttons */}
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button 
                    size="sm"
                    disabled={updatePluginsMutation.isPending}
                    onClick={handleUpdateSelected}
                  >
                    {updatePluginsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Update Selected ({selectedItems.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={enableAutoUpdatesMutation.isPending}
                    onClick={handleScheduleUpdates}
                  >
                    {enableAutoUpdatesMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Settings className="h-4 w-4 mr-2" />
                    )}
                    Schedule Updates
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedItems([]);
                      setSelectAll(false);
                    }}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}