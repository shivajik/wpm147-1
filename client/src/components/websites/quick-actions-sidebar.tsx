import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  RefreshCw,
  Shield,
  Monitor,
  Settings,
  Users,
  FileText,
  Download,
  Activity,
  HardDrive,
  Copy,
  Globe,
  Zap,
  Wifi,
  WifiOff,
  ChevronRight,
  ExternalLink,
  Image
} from "lucide-react";
import type { Website } from "@shared/schema";
import { WRMDiagnostic } from "./wrm-diagnostic";

interface QuickActionsSidebarProps {
  website: Website;
  websiteId: string;
}

export function QuickActionsSidebar({ website, websiteId }: QuickActionsSidebarProps) {
  const queryClient = useQueryClient();
  const [thumbnailError, setThumbnailError] = useState(false);

  // Refresh data mutation
  const refreshDataMutation = useMutation({
    mutationFn: async () => {
      await apiCall(`/api/websites/${websiteId}/sync`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId] });
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'wordpress-data'] });
      toast({
        title: "Sync Complete",
        description: "Website data has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error?.message || "Failed to sync website data",
        variant: "destructive",
      });
    },
  });

  // Copy URL mutation
  const copyUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      await navigator.clipboard.writeText(url);
    },
    onSuccess: () => {
      toast({
        title: "URL Copied",
        description: "Website URL has been copied to clipboard.",
      });
    },
    onError: () => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="w-80 flex-shrink-0">
      <div className="sticky top-6 space-y-4">
        <TooltipProvider>
          {/* Website Preview */}
          <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Website Thumbnail */}
                <div className="relative">
                  <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden border">
                    {!thumbnailError ? (
                      <img
                        src={`https://image.thum.io/get/width/1200/crop/800/${encodeURIComponent(website?.url || '')}`}
                        alt={`Screenshot of ${website?.name}`}
                        className="w-full h-full object-cover"
                        onError={() => setThumbnailError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="text-center">
                          <Globe className="h-12 w-12 mx-auto mb-2 text-blue-500 dark:text-blue-400" />
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {website?.name?.charAt(0).toUpperCase() || 'W'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Overlay with website info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg">
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-white font-semibold text-sm truncate">
                        {website?.name}
                      </h3>
                      <p className="text-white/80 text-xs truncate">
                        {website?.url?.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                    
                    {/* Quick preview button */}
                    <div className="absolute top-2 right-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 border-0"
                            asChild
                          >
                            <a 
                              href={website?.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3 text-white" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open website in new tab</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      website?.connectionStatus === 'connected' 
                        ? 'bg-green-500' 
                        : website?.connectionStatus === 'error'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {website?.connectionStatus === 'connected' 
                        ? 'Connected' 
                        : website?.connectionStatus === 'error'
                        ? 'Connection Error'
                        : 'Not Connected'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    WordPress
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-lg flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Primary Actions */}
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      className="w-full justify-start h-10 bg-blue-600 hover:bg-blue-700" 
                      onClick={() => refreshDataMutation.mutate()}
                      disabled={refreshDataMutation.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${refreshDataMutation.isPending ? 'animate-spin' : ''}`} />
                      {refreshDataMutation.isPending ? 'Syncing...' : 'Sync Data'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh WordPress data and check for updates</p>
                  </TooltipContent>
                </Tooltip>

                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1" 
                        onClick={() => copyUrlMutation.mutate(website?.url || '')}
                        disabled={copyUrlMutation.isPending}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy website URL</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        asChild
                      >
                        <a href={website?.url} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visit website</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        asChild
                      >
                        <a href={`${website?.url}/wp-admin`} target="_blank" rel="noopener noreferrer">
                          <Settings className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>WordPress Admin</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <Separator className="my-4" />

              {/* WordPress Management */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <Monitor className="h-4 w-4 mr-2" />
                  WordPress Management
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start text-xs"
                        asChild
                      >
                        <Link href={`/websites/${websiteId}/plugins`}>
                          <FileText className="h-3 w-3 mr-1" />
                          Plugins
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Manage WordPress plugins</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start text-xs"
                        asChild
                      >
                        <Link href={`/websites/${websiteId}/themes`}>
                          <Monitor className="h-3 w-3 mr-1" />
                          Themes
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Manage WordPress themes</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start text-xs"
                        asChild
                      >
                        <Link href={`/websites/${websiteId}/users`}>
                          <Users className="h-3 w-3 mr-1" />
                          Users
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Manage WordPress users</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start text-xs"
                        asChild
                      >
                        <Link href={`/websites/${websiteId}/security`}>
                          <Shield className="h-3 w-3 mr-1" />
                          Security
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Security scan and monitoring</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start text-xs col-span-2"
                        asChild
                      >
                        <a href={`${website?.url}/wp-admin/options-general.php`} target="_blank" rel="noopener noreferrer">
                          <Settings className="h-3 w-3 mr-1" />
                          WordPress Settings
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>WordPress general settings</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Maintenance Actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Maintenance
                </h4>

                <div className="space-y-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Create Backup
                        <ChevronRight className="h-3 w-3 ml-auto" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create a full backup of the website</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Security Scan
                        <ChevronRight className="h-3 w-3 ml-auto" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Run a comprehensive security scan</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Activity className="h-4 w-4 mr-2" />
                        Health Check
                        <ChevronRight className="h-3 w-3 ml-auto" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Perform a site health check</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <HardDrive className="h-4 w-4 mr-2" />
                        Clear Cache
                        <ChevronRight className="h-3 w-3 ml-auto" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear all caching layers</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Connection Status */}
              <Separator className="my-4" />
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  {website?.connectionStatus === 'connected' ? (
                    <Wifi className="h-4 w-4 text-green-600" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {website?.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <Badge variant={website?.connectionStatus === 'connected' ? 'default' : 'destructive'}>
                  {website?.connectionStatus === 'connected' ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>

        {/* WP Remote Manager Diagnostic */}
        <WRMDiagnostic websiteId={parseInt(websiteId)} />
      </div>
    </div>
  );
}