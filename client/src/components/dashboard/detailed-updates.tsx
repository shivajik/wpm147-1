import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, AlertTriangle, CheckCircle, ExternalLink, Package, Palette, Shield } from "lucide-react";
import type { Website } from "@shared/schema";

interface DetailedUpdatesProps {
  websites: Website[];
}

interface WordPressPlugin {
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'must-use' | 'drop-in';
  update_available: boolean;
  new_version?: string;
  description: string;
  author: string;
  plugin_uri: string;
}

interface WordPressTheme {
  name: string;
  version: string;
  status: 'active' | 'inactive';
  update_available: boolean;
  new_version?: string;
  description: string;
  author: string;
  template: string;
  stylesheet: string;
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
}

interface WebsiteWordPressData {
  updateData?: WordPressUpdate;
  pluginData?: WordPressPlugin[];
  themeData?: WordPressTheme[];
  systemInfo?: {
    wordpress_version: string;
  };
}

export default function DetailedUpdates({ websites }: DetailedUpdatesProps) {
  // Create stable query keys for all websites at the top level
  const firstWebsite = websites[0];
  const hasWebsites = websites.length > 0;
  
  // Use a single representative query to avoid hooks in loops
  const updatesQuery = useQuery<WordPressUpdate>({
    queryKey: ['/api/websites', firstWebsite?.id, 'wrm', 'updates'],
    enabled: !!firstWebsite?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const wordpressDataQuery = useQuery<WebsiteWordPressData>({
    queryKey: ['/api/websites', firstWebsite?.id, 'wordpress-data'],
    enabled: !!firstWebsite?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = updatesQuery.isLoading || wordpressDataQuery.isLoading;

  // Calculate totals for a simplified approach (showing only first website data)
  const updateData = updatesQuery.data;
  const totalPluginUpdates = updateData?.count?.plugins || 0;
  const totalThemeUpdates = updateData?.count?.themes || 0;
  const coreUpdatesAvailable = updateData?.wordpress?.update_available ? 1 : 0;

  const totalUpdates = totalPluginUpdates + totalThemeUpdates + coreUpdatesAvailable;

  // Get detailed update lists with plugin metadata (simplified to work with first website only)
  const getUpdatableItems = () => {
    const items: Array<{
      type: 'core' | 'plugin' | 'theme';
      name: string;
      currentVersion?: string;
      newVersion?: string;
      author?: string;
      description?: string;
      website: string;
      websiteId: number;
    }> = [];

    if (!firstWebsite) return items;

    const wordpressData = wordpressDataQuery.data;

    // WordPress Core updates
    if (updateData?.wordpress?.update_available) {
      items.push({
        type: 'core',
        name: 'WordPress Core',
        currentVersion: wordpressData?.systemInfo?.wordpress_version,
        newVersion: updateData.wordpress.new_version,
        website: firstWebsite.name,
        websiteId: firstWebsite.id,
      });
    }

    // Plugin updates with metadata
    if ((updateData?.count?.plugins || 0) > 0 && wordpressData?.pluginData && Array.isArray(wordpressData.pluginData)) {
      wordpressData.pluginData.forEach(plugin => {
        items.push({
          type: 'plugin',
          name: plugin.name,
          currentVersion: plugin.version,
          author: plugin.author,
          description: plugin.description,
          website: firstWebsite.name,
          websiteId: firstWebsite.id,
        });
      });
    }

    // Theme updates with metadata
    if ((updateData?.count?.themes || 0) > 0 && wordpressData?.themeData && Array.isArray(wordpressData.themeData)) {
      wordpressData.themeData.forEach(theme => {
        items.push({
          type: 'theme',
          name: theme.name,
          currentVersion: theme.version,
          author: theme.author,
          description: theme.description,
          website: firstWebsite.name,
          websiteId: firstWebsite.id,
        });
      });
    }

    return items;
  };

  const updatableItems = getUpdatableItems();

  const refreshAllData = () => {
    updatesQuery.refetch();
    wordpressDataQuery.refetch();
  };

  const getUpdateIcon = (type: 'core' | 'plugin' | 'theme') => {
    switch (type) {
      case 'core':
        return <Shield className="h-4 w-4" />;
      case 'plugin':
        return <Package className="h-4 w-4" />;
      case 'theme':
        return <Palette className="h-4 w-4" />;
    }
  };

  const getUpdateColor = (type: 'core' | 'plugin' | 'theme') => {
    switch (type) {
      case 'core':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
      case 'plugin':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      case 'theme':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800';
    }
  };

  const getBadgeVariant = (type: 'core' | 'plugin' | 'theme') => {
    switch (type) {
      case 'core':
        return 'destructive';
      case 'plugin':
      case 'theme':
        return 'secondary';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">Available Updates ({totalUpdates})</CardTitle>
          <CardDescription>Detailed list of available updates</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAllData}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2 text-sm text-muted-foreground">Checking for updates...</span>
          </div>
        ) : totalUpdates === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">All Up to Date!</h3>
            <p className="text-sm text-muted-foreground">
              Your websites are running the latest versions
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {coreUpdatesAvailable > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-400">WordPress Core</span>
                  </div>
                  <Badge variant="destructive" className="bg-orange-600">
                    {coreUpdatesAvailable}
                  </Badge>
                </div>
              )}
              
              {totalPluginUpdates > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Plugins</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-600 text-white">
                    {totalPluginUpdates}
                  </Badge>
                </div>
              )}
              
              {totalThemeUpdates > 0 && (
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Themes</span>
                  </div>
                  <Badge variant="secondary" className="bg-purple-600 text-white">
                    {totalThemeUpdates}
                  </Badge>
                </div>
              )}
            </div>

            {/* Detailed Update List */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Updates Needed
              </h4>
              {!Array.isArray(updatableItems) || updatableItems.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No specific update details available</p>
                  <p className="text-xs">Updates detected but details couldn't be retrieved</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {Array.isArray(updatableItems) && updatableItems.map((item, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${getUpdateColor(item.type)}`}>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getUpdateIcon(item.type)}
                          <h5 className="font-medium">{item.name}</h5>
                          <Badge variant={getBadgeVariant(item.type)} className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="text-xs">{item.website}</span>
                          {item.author && <span className="text-xs">By {item.author}</span>}
                          {item.currentVersion && (
                            <span>
                              v{item.currentVersion}
                              {item.newVersion && ` → v${item.newVersion}`}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline" className="ml-3">
                        Update
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4 border-t">
              <Button className="flex-1" size="sm">
                Update All ({totalUpdates})
              </Button>
              <Button variant="outline" size="sm">
                Schedule Updates
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}