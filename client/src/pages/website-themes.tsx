import { useParams, useLocation } from "wouter";
import type { Website } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { isValidWebsiteId, InvalidWebsiteIdPage } from "@/lib/website-validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Monitor, 
  RefreshCw, 
  Search, 
  CheckCircle,
  XCircle,
  Download,
  Trash2,
  Settings,
  ArrowLeft,
  ExternalLink,
  Eye,
  Edit,
  Palette,
  Power,
  PowerOff,
  MoreVertical
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AppLayout from "@/components/layout/app-layout";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MaintenanceSidebar } from "@/components/maintenance/maintenance-sidebar";
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { useState } from "react";

export default function WebsiteThemes() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const websiteId = params.id;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedThemes, setSelectedThemes] = useState<number[]>([]);
  const { toast } = useToast();

  // Validate website ID
  if (!isValidWebsiteId(websiteId)) {
    return <InvalidWebsiteIdPage websiteId={websiteId} />;
  }

  const { data: website, isLoading } = useQuery<Website>({
    queryKey: ['/api/websites', websiteId],
    enabled: !!websiteId,
  });

  const { data: wordpressData, isLoading: wpDataLoading, refetch: refetchWordPressData } = useQuery<any>({
    queryKey: ['/api/websites', websiteId, 'wordpress-data'],
    enabled: !!websiteId && website?.connectionStatus === 'connected',
  });

  // Fetch WRM themes data separately
  const { data: wrmThemes, isLoading: themesLoading, refetch: refetchThemes } = useQuery<any[]>({
    queryKey: ['/api/websites', websiteId, 'wrm-themes'],
    enabled: !!websiteId && !!website,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Debug log to check website data
  console.log('Website data for themes:', website);
  console.log('Has wrmApiKey for themes:', !!website?.wrmApiKey);

  // Get WP Remote Manager updates data
  const { data: wrmUpdates } = useQuery<any>({
    queryKey: ['/api/websites', websiteId, 'wrm', 'updates'],
    enabled: !!websiteId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutations for theme actions
  const activateThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      const response = await fetch(`/api/websites/${websiteId}/themes/${themeId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to activate theme');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'wordpress-data'] });
      toast({ title: 'Theme activated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to activate theme', variant: 'destructive' });
    }
  });

  const deleteThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      const response = await fetch(`/api/websites/${websiteId}/themes/${themeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to delete theme');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'wordpress-data'] });
      toast({ title: 'Theme deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete theme', variant: 'destructive' });
    }
  });

  const updateThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      const response = await fetch(`/api/websites/${websiteId}/themes/${themeId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to update theme');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'wordpress-data'] });
      toast({ title: 'Theme updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update theme', variant: 'destructive' });
    }
  });

  if (isLoading || themesLoading) {
    return (
      <AppLayout title="Loading..." defaultOpen={false}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (!website) {
    return (
      <AppLayout title="Website Not Found" defaultOpen={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Website Not Found</h1>
          <Button onClick={() => setLocation('/websites')}>
            Back to Websites
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Show debug information if no WRM API key or connection issues
  if (!website.wrmApiKey) {
    return (
      <AppLayout title={`${website.name} - Themes`} defaultOpen={false}>
        <div className="flex gap-6">
          {/* Quick Actions Sidebar */}
          <MaintenanceSidebar 
            websiteId={parseInt(websiteId!)}
            websiteName={website.name}
            websiteUrl={website.url}
          />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="text-center py-12">
              <Palette className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">WP Remote Manager Not Connected</h1>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                This website needs to be connected to WordPress Remote Manager to view and manage themes.
              </p>
              <div className="space-y-4 max-w-md mx-auto text-left">
                <h3 className="font-semibold">Debug Information:</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 text-sm">
                  <div>Website ID: {websiteId}</div>
                  <div>Website Found: {website ? '✓' : '✗'}</div>
                  <div>Has WRM API Key: {website?.wrmApiKey ? '✓' : '✗'}</div>
                  <div>Connection Status: {website?.connectionStatus || 'unknown'}</div>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => setLocation(`/websites/${websiteId}`)}
                className="mt-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Website
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Handle both array format and object format from WRM API
  const themes = Array.isArray(wrmThemes) 
    ? wrmThemes 
    : (wrmThemes && typeof wrmThemes === 'object' && 'success' in wrmThemes && 'themes' in wrmThemes) 
      ? (wrmThemes as any).themes || []
      : [];
  const activeTheme = Array.isArray(themes) ? themes.find((theme: any) => theme && theme.active === true) : null;
  const filteredThemes = Array.isArray(themes) ? themes.filter((theme: any) => {
    if (!theme || !theme.name) return false;
    return theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           theme.description?.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  // Calculate theme updates count from WP Remote Manager updates API
  const themeUpdatesCount = wrmUpdates?.themes?.length || 0;

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedThemes.length === filteredThemes.length) {
      setSelectedThemes([]);
    } else {
      setSelectedThemes(Array.isArray(filteredThemes) ? filteredThemes.map((_: any, index: number) => index) : []);
    }
  };

  const handleSelectTheme = (index: number) => {
    setSelectedThemes(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getStatusBadge = (status: string, isActive: boolean = false) => {
    if (isActive || status === 'active') {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-100 text-gray-600">Inactive</Badge>;
  };

  return (
    <AppLayout title={`${website.name} - Themes`} defaultOpen={false}>
      <div className="flex gap-6">
        {/* Quick Actions Sidebar */}
        {website && (
          <MaintenanceSidebar 
            websiteId={parseInt(websiteId!)}
            websiteName={website.name}
            websiteUrl={website.url}
          />
        )}
        
        {/* Main Content */}
        <div className="flex-1">
          <TooltipProvider>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation(`/websites/${websiteId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Website
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Monitor className="h-6 w-6 mr-2 text-purple-600" />
                Themes Management
                {themeUpdatesCount > 0 && (
                  <Badge className="ml-3 bg-purple-100 text-purple-800 border-purple-300">
                    {themeUpdatesCount} Updates Available
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{website.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <a href={`${website.url}/wp-admin/theme-install.php`} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Install New
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Install new themes from WordPress repository</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <a href={`${website.url}/wp-admin/customize.php`} target="_blank" rel="noopener noreferrer">
                    <Edit className="h-4 w-4 mr-2" />
                    Customize
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open WordPress theme customizer</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm"
                  asChild
                >
                  <a href={`${website.url}/wp-admin/themes.php`} target="_blank" rel="noopener noreferrer">
                    <Settings className="h-4 w-4 mr-2" />
                    WP Admin
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open WordPress themes management</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Active Theme Card */}
        {activeTheme && (
          <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Palette className="h-5 w-5 mr-2 text-green-600" />
                Active Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {activeTheme.name}
                    </h3>
                    <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>
                    {activeTheme.version && (
                      <Badge variant="outline" className="text-xs">
                        v{activeTheme.version}
                      </Badge>
                    )}
                  </div>
                  
                  {activeTheme.description && (
                    <p 
                      className="text-sm text-gray-600 dark:text-gray-400 mb-3"
                      dangerouslySetInnerHTML={{ __html: activeTheme.description }}
                    />
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {activeTheme.author && (
                      <span>By {activeTheme.author}</span>
                    )}
                    {activeTheme.uri && (
                      <a 
                        href={activeTheme.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        Theme Homepage
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <a href={website.url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Preview live site</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm"
                        asChild
                      >
                        <a href={`${website.url}/wp-admin/customize.php`} target="_blank" rel="noopener noreferrer">
                          <Edit className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Customize theme</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Themes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{themes.length}</p>
                </div>
                <Monitor className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Array.isArray(themes) ? themes.filter((t: any) => t && t.active).length : 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Updates Available</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Array.isArray(themes) ? themes.filter((t: any) => t && t.update_available).length : 0}
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search themes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  refetchWordPressData();
                  refetchThemes();
                }}
                disabled={wpDataLoading || themesLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(wpDataLoading || themesLoading) ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedThemes.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedThemes.length} theme{selectedThemes.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Select All */}
        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            id="select-all-themes"
            checked={selectedThemes.length === filteredThemes.length && filteredThemes.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all-themes" className="text-sm text-muted-foreground">
            Select all ({filteredThemes.length} themes)
          </label>
          <span className="text-xs text-muted-foreground ml-auto">
            {selectedThemes.length} selected
          </span>
        </div>

        {/* Themes Grid */}
        {wpDataLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-gray-600 dark:text-gray-400">Loading themes...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredThemes.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm ? "No themes match your search" : "No themes found"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              Array.isArray(filteredThemes) && filteredThemes.map((theme: any, index: number) => (
                <Card 
                  key={index} 
                  className={`hover:shadow-lg transition-all relative ${
                    theme.active ? 'ring-2 ring-green-200 shadow-md' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Checkbox Overlay */}
                      <div className="absolute top-4 right-4">
                        <Checkbox
                          checked={selectedThemes.includes(index)}
                          onCheckedChange={() => handleSelectTheme(index)}
                          className="bg-white/80 border-2"
                        />
                      </div>

                      {/* Theme Preview with Icon */}
                      <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                        <div className="text-center">
                          <Palette className="h-8 w-8 mx-auto mb-2" />
                          <div className="text-lg font-bold">
                            {theme.name ? (theme.name.charAt(0).toUpperCase() + (theme.name.charAt(1)?.toUpperCase() || '')) : 'TH'}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1">
                            {theme.name}
                          </h3>
                          {theme.active && (
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge className={`${
                            theme.active 
                              ? 'bg-green-100 text-green-800 border-green-300' 
                              : 'bg-gray-100 text-gray-800 border-gray-300'
                          } text-xs flex items-center gap-1`}>
                            {theme.active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                            {theme.active ? 'Active' : 'Inactive'}
                          </Badge>
                          {theme.version && (
                            <Badge variant="outline" className="text-xs">
                              v{theme.version}
                            </Badge>
                          )}
                          {theme.update_available && (
                            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                              <Download className="h-3 w-3 mr-1" />
                              Update
                            </Badge>
                          )}
                        </div>
                        
                        {theme.description && (
                          <p 
                            className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: theme.description }}
                          />
                        )}
                        
                        {theme.author && (
                          <p className="text-xs text-gray-500 mb-3">
                            By {theme.author}
                          </p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {theme.active ? (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            asChild
                          >
                            <a href={`${website.url}/wp-admin/customize.php`} target="_blank" rel="noopener noreferrer">
                              <Edit className="h-4 w-4 mr-1" />
                              Customize
                            </a>
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => activateThemeMutation.mutate(theme.stylesheet)}
                          >
                            <Power className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            {theme.update_available && (
                              <DropdownMenuItem 
                                onClick={() => updateThemeMutation.mutate(theme.stylesheet)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Update
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Details
                            </DropdownMenuItem>
                            {!theme.active && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => deleteThemeMutation.mutate(theme.stylesheet)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
          </TooltipProvider>
        </div>
      </div>
    </AppLayout>
  );
}