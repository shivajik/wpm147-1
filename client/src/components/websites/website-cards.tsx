import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Globe, 
  ExternalLink, 
  Settings, 
  BarChart3, 
  Shield, 
  Eye,
  List,
  Grid3X3,
  Star,
  AlertTriangle,
  RefreshCw,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Website } from "@shared/schema";
import RefreshThumbnailButton from "./refresh-thumbnail-button";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface WebsiteCardsProps {
  websites: Website[];
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showViewToggle?: boolean;
}

interface WebsiteCardProps {
  website: Website;
  viewMode: 'grid' | 'list';
}

function WebsiteCard({ website, viewMode }: WebsiteCardProps) {
  const [, setLocation] = useLocation();
  const [showActions, setShowActions] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteWebsiteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiCall(`/api/websites/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Website deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete website",
        variant: "destructive",
      });
    },
  });

  // Get thumbnail URL - use stored thumbnail or fallback to screenshot service
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

  const handleNavigateToMaintenance = () => {
    setLocation(`/websites/${website.id}`);
  };

  const handleNavigateToSettings = () => {
    setLocation(`/websites/${website.id}`);
  };

  const handleViewWebsite = () => {
    window.open(website.url, '_blank');
  };

  const handleDeleteWebsite = (id: number) => {
    if (confirm("Are you sure you want to delete this website? This action cannot be undone.")) {
      deleteWebsiteMutation.mutate(id);
    }
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

  const getConnectionStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthStatusText = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="group flex items-center p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Website Screenshot/Icon */}
        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 mr-4">
          <img 
            src={getThumbnailUrl(website)} 
            alt={website.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-full h-full flex items-center justify-center">
            <Globe className="h-6 w-6 text-slate-400" />
          </div>
        </div>

        {/* Website Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {website.name}
            </h3>
            <div className={cn("w-2 h-2 rounded-full", getConnectionStatusColor(website.connectionStatus || 'disconnected'))} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {website.url}
          </p>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-4">
          <Badge 
            variant={website.healthStatus === 'good' ? 'default' : 'destructive'}
            className="hidden sm:inline-flex"
          >
            {getHealthStatusText(website.healthStatus)}
          </Badge>
          
          <div className={cn(
            "flex items-center space-x-2 transition-opacity duration-200",
            showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNavigateToMaintenance}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open Dashboard</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNavigateToSettings}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Website Settings</p>
                </TooltipContent>
              </Tooltip>

              <RefreshThumbnailButton
                websiteId={website.id}
                className="hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950 dark:hover:text-orange-400"
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewWebsite}
                    className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 dark:hover:text-green-400"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visit Website</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWebsite(website.id)}
                    disabled={deleteWebsiteMutation.isPending}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    data-testid={`button-delete-website-${website.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Website</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className="group relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Website Screenshot */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
        <OptimizedImage
          src={getThumbnailUrl(website)}
          alt={website.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          width={300}
          height={192}
          priority={false}
          onError={() => {
            // Error handling is built into OptimizedImage component
          }}
        />
        
        {/* Connection Status Indicator */}
        <div className="absolute top-3 left-3">
          <div className={cn("w-3 h-3 rounded-full border-2 border-white shadow-sm", getConnectionStatusColor(website.connectionStatus || 'disconnected'))} />
        </div>

        {/* Favorite/Star Button */}
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-slate-600 hover:text-yellow-500 transition-colors"
          >
            <Star className="h-4 w-4" />
          </Button>
        </div>


      </div>

        {/* Hover Actions Overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center space-x-4 transition-all duration-300",
          showActions ? "opacity-100" : "opacity-0"
        )}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleNavigateToMaintenance}
                  className="h-10 w-10 p-0 bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                >
                  <BarChart3 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open Dashboard</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleNavigateToSettings}
                  className="h-10 w-10 p-0 bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Website Settings</p>
              </TooltipContent>
            </Tooltip>

            <RefreshThumbnailButton
              websiteId={website.id}
              variant="secondary"
              className="bg-white/95 hover:bg-white text-slate-700 hover:text-orange-600 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
            />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleViewWebsite}
                  className="h-10 w-10 p-0 bg-white/95 hover:bg-white text-slate-700 hover:text-green-600 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                >
                  <ExternalLink className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visit Website</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDeleteWebsite(website.id)}
                  disabled={deleteWebsiteMutation.isPending}
                  className="h-10 w-10 p-0 bg-white/95 hover:bg-white text-slate-700 hover:text-red-600 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                  data-testid={`button-delete-website-${website.id}`}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Website</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

      {/* Website Info */}
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {website.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {website.url}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant={website.healthStatus === 'good' || website.healthStatus === 'excellent' ? 'default' : 'destructive'}
              className={cn(
                "text-xs px-2 py-1 font-medium",
                website.healthStatus === 'good' || website.healthStatus === 'excellent' 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {getHealthStatusText(website.healthStatus)}
            </Badge>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium">{website.uptime || '99.9%'} uptime</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WebsiteCards({ 
  websites, 
  viewMode = 'grid', 
  onViewModeChange,
  showViewToggle = true 
}: WebsiteCardsProps) {
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setCurrentViewMode(mode);
    onViewModeChange?.(mode);
  };

  if (!websites || websites.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          No websites yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Add your first WordPress website to start monitoring
        </p>
        <Button>
          <Globe className="h-4 w-4 mr-2" />
          Add Website
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      {showViewToggle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Your Websites
            </h2>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {websites.length} {websites.length === 1 ? 'site' : 'sites'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <Button
              variant={currentViewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className={cn(
                "h-8 w-8 p-0",
                currentViewMode === 'grid' 
                  ? "bg-white dark:bg-slate-700 shadow-sm" 
                  : "hover:bg-white/50 dark:hover:bg-slate-700/50"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={currentViewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className={cn(
                "h-8 w-8 p-0",
                currentViewMode === 'list' 
                  ? "bg-white dark:bg-slate-700 shadow-sm" 
                  : "hover:bg-white/50 dark:hover:bg-slate-700/50"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Website Cards/List */}
      <div className={cn(
        currentViewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-3"
      )}>
        {Array.isArray(websites) && websites.map((website) => (
          <WebsiteCard 
            key={website.id} 
            website={website} 
            viewMode={currentViewMode}
          />
        ))}
      </div>
    </div>
  );
}