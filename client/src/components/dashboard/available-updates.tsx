import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Download, AlertTriangle, CheckCircle, ExternalLink, Shield, Puzzle, Palette, ArrowRight } from "lucide-react";
import type { Website } from "@shared/schema";

interface AvailableUpdatesProps {
  websites: Website[];
}

interface WordPressUpdate {
  wordpress: {
    update_available: boolean;
    current_version: string;
    new_version: string;
  };
  plugins: Array<{
    name: string;
    current_version: string;
    new_version: string;
    slug: string;
  }>;
  themes: Array<{
    name: string;
    current_version: string;
    new_version: string;
    slug: string;
  }>;
  count: {
    total: number;
    plugins: number;
    themes: number;
    core: number;
  };
}

interface WebsiteWordPressData {
  updateData?: WordPressUpdate;
  systemInfo?: {
    wordpress_version: string;
  };
}

export default function AvailableUpdates({ websites }: AvailableUpdatesProps) {
  const [activeTab, setActiveTab] = useState("all");
  
  // Use a single query to fetch all website updates data
  const { data: allUpdatesData, isLoading, refetch } = useQuery<{ [websiteId: string]: WordPressUpdate }>({
    queryKey: ['/api/websites/all-updates'],
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Calculate totals from the aggregated data
  const totalPluginUpdates = Array.isArray(websites) ? websites.reduce((total, website) => {
    const websiteData = allUpdatesData?.[website.id.toString()];
    return total + (websiteData?.count?.plugins || 0);
  }, 0) : 0;

  const totalThemeUpdates = Array.isArray(websites) ? websites.reduce((total, website) => {
    const websiteData = allUpdatesData?.[website.id.toString()];
    return total + (websiteData?.count?.themes || 0);
  }, 0) : 0;

  const coreUpdatesAvailable = Array.isArray(websites) ? websites.filter(website => {
    const websiteData = allUpdatesData?.[website.id.toString()];
    return websiteData?.wordpress?.update_available;
  }).length : 0;

  const totalUpdates = totalPluginUpdates + totalThemeUpdates + coreUpdatesAvailable;

  const refreshAllData = () => {
    refetch();
  };

  // Collect all updates across websites
  const allPluginUpdates = Array.isArray(websites) ? websites.flatMap(website => {
    const websiteData = allUpdatesData?.[website.id.toString()];
    const plugins = websiteData?.plugins;
    if (!Array.isArray(plugins)) return [];
    return plugins.map(plugin => ({
      ...plugin,
      websiteName: website.name,
      websiteId: website.id
    }));
  }) : [];

  const allThemeUpdates = Array.isArray(websites) ? websites.flatMap(website => {
    const websiteData = allUpdatesData?.[website.id.toString()];
    const themes = websiteData?.themes;
    if (!Array.isArray(themes)) return [];
    return themes.map(theme => ({
      ...theme,
      websiteName: website.name,
      websiteId: website.id
    }));
  }) : [];

  const allWordPressUpdates = Array.isArray(websites) ? websites.flatMap(website => {
    const websiteData = allUpdatesData?.[website.id.toString()];
    if (websiteData?.wordpress?.update_available) {
      return [{
        ...websiteData.wordpress,
        websiteName: website.name,
        websiteId: website.id
      }];
    }
    return [];
  }) : [];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">Available Updates</CardTitle>
          <CardDescription>WordPress core, plugins, and themes</CardDescription>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                All ({totalUpdates})
              </TabsTrigger>
              <TabsTrigger value="wordpress" className="text-xs">
                WordPress ({coreUpdatesAvailable})
              </TabsTrigger>
              <TabsTrigger value="plugins" className="text-xs">
                Plugins ({totalPluginUpdates})
              </TabsTrigger>
              <TabsTrigger value="themes" className="text-xs">
                Themes ({totalThemeUpdates})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {coreUpdatesAvailable > 0 && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-400">WordPress</span>
                    </div>
                    <Badge variant="destructive" className="bg-orange-600">
                      {coreUpdatesAvailable}
                    </Badge>
                  </div>
                )}
                
                {totalPluginUpdates > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <Puzzle className="h-4 w-4 text-blue-600" />
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

              {/* All Updates Summary */}
              <div className="text-center py-4">
                <Button className="w-full" size="sm">
                  Update All ({totalUpdates} updates)
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="wordpress" className="space-y-3 mt-4">
              {allWordPressUpdates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>WordPress core is up to date on all sites</p>
                </div>
              ) : (
                Array.isArray(allWordPressUpdates) && allWordPressUpdates.map((update, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-orange-600 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{update.websiteName}</div>
                        <div className="text-sm text-muted-foreground">WordPress Core Update</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{update.current_version}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="text-green-600 font-medium">{update.new_version}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Update
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="plugins" className="space-y-3 mt-4">
              {allPluginUpdates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Puzzle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>All plugins are up to date</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Array.isArray(allPluginUpdates) && allPluginUpdates.map((plugin, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-center space-x-3">
                        <Puzzle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{plugin.name}</div>
                          <div className="text-sm text-muted-foreground">{plugin.websiteName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{plugin.current_version}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="text-green-600 font-medium">{plugin.new_version}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Update
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="themes" className="space-y-3 mt-4">
              {allThemeUpdates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Palette className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>All themes are up to date</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Array.isArray(allThemeUpdates) && allThemeUpdates.map((theme, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-center space-x-3">
                        <Palette className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-sm text-muted-foreground">{theme.websiteName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{theme.current_version}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="text-green-600 font-medium">{theme.new_version}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Update
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}