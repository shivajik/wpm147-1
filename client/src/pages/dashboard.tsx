import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";

import WebsiteCards from "@/components/websites/website-cards";
import AddClientDialog from "@/components/clients/add-client-dialog";
import AddWebsiteDialog from "@/components/websites/add-website-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, Shield, Globe, Plus, Users, Wrench, Download, Palette, Monitor, RefreshCw, AlertTriangle, CheckCircle, Loader2, Star, BarChart3, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAutoSync } from "@/hooks/useAutoSync";
import AvailableUpdates from "@/components/dashboard/available-updates";
import DetailedUpdates from "@/components/dashboard/detailed-updates";
import { SecurityDashboard } from "@/components/security/security-dashboard";
import PluginDownloadSection from "@/components/plugin/plugin-download-section";
import type { Website } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isAddWebsiteDialogOpen, setIsAddWebsiteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("maintenance");
  
  // Auto-sync functionality
  const { autoSync, isLoading: isAutoSyncing } = useAutoSync();

  // Check for auto-sync trigger on login
  useEffect(() => {
    const shouldAutoSync = localStorage.getItem("trigger_auto_sync");
    const token = localStorage.getItem("auth_token");
    
    if (shouldAutoSync === "true" && user && token) {
      // Clear the flag and trigger auto-sync
      localStorage.removeItem("trigger_auto_sync");
      
      // Show welcome message with auto-sync notification
      toast({
        title: "Welcome back!",
        description: "Updating your websites with latest information...",
      });
      
      // Trigger auto-sync after a brief delay to ensure all auth state is ready
      setTimeout(() => {
        console.log('[Dashboard] Triggering auto-sync after login');
        autoSync();
      }, 1500);
    }
  }, [user, autoSync, toast]);

  // Fetch real data for dynamic content with optimized caching
  const { data: websites = [] } = useQuery<Website[]>({ 
    queryKey: ['/api/websites'], 
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
  
  const { data: clients = [] } = useQuery({ 
    queryKey: ['/api/clients'], 
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes (clients change less frequently)
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch pending updates for all websites
  const { data: updatesData, isLoading: updatesLoading } = useQuery({
    queryKey: ['/api/websites', 'updates'],
    queryFn: async () => {
      if (!websites || websites.length === 0) return [];
      
      const updatePromises = Array.isArray(websites) && websites.length > 0 ? websites.map(async (website: Website) => {
        try {
          const response = await fetch(`/api/websites/${website.id}/wrm/updates`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          });
          if (response.ok) {
            return await response.json();
          }
          return null;
        } catch (error) {
          console.warn('Failed to fetch updates for website:', website.id, error);
          return null;
        }
      }) : [];
      
      const results = await Promise.all(updatePromises);
      return results.filter(Boolean);
    },
    enabled: !!websites && websites.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for update data
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes instead of 30 seconds
  });

  // Calculate dynamic statistics from real data
  const clientCount = Array.isArray(clients) ? clients.length : 0;
  const websiteCount = Array.isArray(websites) ? websites.length : 0;

  // Calculate real maintenance statistics
  const maintenanceStats = {
    totalPlugins: 0,
    activePlugins: 0,
    totalThemes: 0,
    totalPendingUpdates: 0,
    sitesNeedingAttention: 0,
    isLoading: updatesLoading,
  };

  // Calculate from real WordPress data
  if (Array.isArray(websites) && websites.length > 0) {
    websites.forEach((website: Website) => {
      try {
        const wpData = website.wpData ? JSON.parse(website.wpData) : null;
        if (wpData) {
          // Plugin statistics
          if (wpData.pluginData && Array.isArray(wpData.pluginData)) {
            maintenanceStats.totalPlugins += wpData.pluginData.length;
            maintenanceStats.activePlugins += wpData.pluginData.filter((p: any) => p && p.active).length;
          }
          
          // Theme statistics
          if (wpData.stats?.themes_count) {
            maintenanceStats.totalThemes += wpData.stats.themes_count;
          }
        }
      } catch (error) {
        console.warn('Error parsing WordPress data for website:', website.id, error);
      }
    });
  }

  // Calculate pending updates from updatesData
  if (Array.isArray(updatesData) && updatesData.length > 0) {
    updatesData.forEach((updateData: any) => {
      if (updateData && updateData.count) {
        maintenanceStats.totalPendingUpdates += updateData.count.total;
      } else if (updateData && updateData.updates) {
        const updates = updateData.updates;
        if (updates.plugins && Array.isArray(updates.plugins)) {
          maintenanceStats.totalPendingUpdates += updates.plugins.length;
        }
        if (updates.themes && Array.isArray(updates.themes)) {
          maintenanceStats.totalPendingUpdates += updates.themes.length;
        }
        if (updates.core && updates.core.needs_update) {
          maintenanceStats.totalPendingUpdates += 1;
        }
      }
    });
  }

  // Calculate sites needing attention
  maintenanceStats.sitesNeedingAttention = (Array.isArray(websites) && websites.length > 0) ? websites.filter((website: Website) => {
    try {
      const wpData = website.wpData ? JSON.parse(website.wpData) : null;
      if (!wpData) return false;
      
      // Check for security issues, outdated plugins, etc.
      const hasSecurityIssues = wpData.securityScan?.vulnerabilities?.length > 0;
      const hasUpdatesNeeded = updatesData?.some((ud: any) => 
        ud.website_id === website.id && 
        (ud.updates?.plugins?.length > 0 || ud.updates?.themes?.length > 0 || ud.updates?.core?.needs_update)
      );
      
      return hasSecurityIssues || hasUpdatesNeeded;
    } catch (error) {
      return false;
    }
  }).length : 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="text-center max-w-lg mx-auto space-y-6">
            
            {/* Status Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                Live Dashboard
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                <Shield className="w-3 h-3 mr-1" />
                Security Active
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Loading...
              </Badge>
            </div>
            
            {/* Welcome Message */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {(user as any)?.firstName || 'User'}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                Preparing your WordPress management dashboard with real-time insights and tools.
              </p>
            </div>

            {/* Loading Progress */}
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="flex items-center gap-3 justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading websites and data...</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse transition-all duration-500" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4 bg-card border rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1">{clientCount}</div>
                <div className="text-xs text-muted-foreground">Clients</div>
              </div>
              <div className="text-center p-4 bg-card border rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1">{websiteCount}</div>
                <div className="text-xs text-muted-foreground">Websites</div>
              </div>
              <div className="text-center p-4 bg-card border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">99.9%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Featured Websites Section */}
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {websiteCount > 0 ? `${websiteCount} Starred websites` : 'Your Websites'}
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor and manage your WordPress websites
              </p>
            </div>
            
            {/* View Mode and Add Website */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddWebsiteDialogOpen(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Website</span>
              </Button>
            </div>
          </div>

          {/* Quick Navigation Actions */}
          {websiteCount > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Quick Actions</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Access common website management tools</p>
                </div>
                <div className="flex items-center space-x-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation('/analytics')}
                          className="flex items-center space-x-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                        >
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                          <span>Analytics</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View website analytics and performance metrics</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation('/security')}
                          className="flex items-center space-x-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700"
                        >
                          <Shield className="h-4 w-4 text-orange-600" />
                          <span>Security</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Run security scans and manage website protection</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => autoSync()}
                          disabled={isAutoSyncing}
                          className="flex items-center space-x-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700"
                        >
                          <RefreshCw className={`h-4 w-4 text-green-600 ${isAutoSyncing ? 'animate-spin' : ''}`} />
                          <span>{isAutoSyncing ? 'Syncing...' : 'Sync All'}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Update all connected websites with latest data</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation('/performance')}
                          className="flex items-center space-x-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700"
                        >
                          <Zap className="h-4 w-4 text-green-600" />
                          <span>Performance</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Monitor website speed and optimization</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation('/clients')}
                          className="flex items-center space-x-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700"
                        >
                          <Users className="h-4 w-4 text-purple-600" />
                          <span>Clients</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Manage clients and generate reports</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )}

          {/* Website Cards Grid */}
          {websiteCount > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.isArray(websites) && websites.map((website: Website) => {
                // Get thumbnail URL - use stored thumbnail or fallback to screenshot service (same as WebsiteCards component)
                const getThumbnailUrl = (website: Website) => {
                  // Use proxy endpoint for thumbnails that have been refreshed
                  if (website.thumbnailUrl && website.thumbnailUrl.startsWith('/api/thumbnails/')) {
                    return website.thumbnailUrl;
                  }
                  
                  // For existing direct URLs or when thumbnail exists, use proxy
                  if (website.thumbnailUrl) {
                    return `/api/thumbnails/${website.id}`;
                  }
                  
                  // Fallback to URL2PNG service for real website screenshots
                  return `https://api.url2png.com/v6/P4DE4C-55D9C7/png/?thumbnail_max_width=1200&thumbnail_max_height=800&url=${encodeURIComponent(website.url)}`;
                };

                const getHealthStatusColor = (status: string) => {
                  switch (status?.toLowerCase()) {
                    case 'excellent':
                    case 'good':
                      return 'bg-green-500';
                    case 'warning':
                      return 'bg-yellow-500';
                    case 'critical':
                    case 'error':
                      return 'bg-red-500';
                    default:
                      return 'bg-gray-500';
                  }
                };

                const handleNavigateToWebsite = (websiteId: number) => {
                  window.location.href = `/websites/${websiteId}`;
                };

                // Check if this website has pending updates
                const hasPendingUpdates = (websiteId: number) => {
                  if (!updatesData || !Array.isArray(updatesData)) return false;
                  
                  const websiteUpdates = updatesData.find((ud: any) => 
                    ud.website_id === websiteId || ud.websiteId === websiteId
                  );
                  
                  if (!websiteUpdates) return false;
                  
                  // Check for pending updates in different formats
                  if (websiteUpdates.count && websiteUpdates.count.total > 0) {
                    return true;
                  }
                  
                  if (websiteUpdates.updates) {
                    const updates = websiteUpdates.updates;
                    const hasPluginUpdates = updates.plugins && Array.isArray(updates.plugins) && updates.plugins.length > 0;
                    const hasThemeUpdates = updates.themes && Array.isArray(updates.themes) && updates.themes.length > 0;
                    const hasCoreUpdates = updates.core && updates.core.needs_update;
                    
                    return hasPluginUpdates || hasThemeUpdates || hasCoreUpdates;
                  }
                  
                  return false;
                };

                return (
                  <Card 
                    key={website.id}
                    className="group relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm"
                    onClick={() => handleNavigateToWebsite(website.id)}
                  >
                    {/* Website Screenshot */}
                    <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                      <img 
                        src={getThumbnailUrl(website)} 
                        alt={website.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2 mx-auto">
                            <Globe className="h-8 w-8 text-blue-500" />
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{website.name}</p>
                        </div>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className="absolute top-3 left-3">
                        <div className={cn("w-3 h-3 rounded-full border-2 border-white shadow-sm", getHealthStatusColor(website.healthStatus))} />
                      </div>

                      {/* Warning Icon for sites with pending updates */}
                      {hasPendingUpdates(website.id) && (
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 bg-amber-500 rounded-md flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Website Info */}
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {website.name}
                          </h3>
                          <div className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {website.url.replace(/^https?:\/\//, '')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No websites yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  Add your first website to start monitoring and managing your WordPress sites
                </p>
                <Button 
                  onClick={() => setIsAddWebsiteDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Website
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Plugin Download Section */}
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                WordPress Plugin
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download and install the WP Remote Manager plugin to enable website management
            </p>
          </div>
          
          <PluginDownloadSection />
        </div>

        {/* Add Client Dialog */}
        <AddClientDialog 
          open={isAddClientDialogOpen} 
          onOpenChange={setIsAddClientDialogOpen} 
        />

        {/* Add Website Dialog */}
        <AddWebsiteDialog 
          open={isAddWebsiteDialogOpen} 
          onOpenChange={setIsAddWebsiteDialogOpen} 
        />
      </div>
    </AppLayout>
  );
}