import { useParams, useLocation } from "wouter";
import type { Website } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  RefreshCw, 
  Search, 
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Trash2,
  Settings,
  ArrowLeft,
  ExternalLink,
  Info,
  Power,
  PowerOff,
  MoreVertical,
  Calendar,
  Clock,
  Shield,
  Bell,
  Save
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from "@/components/layout/app-layout";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MaintenanceSidebar } from "@/components/maintenance/maintenance-sidebar";
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { useState } from "react";
import { safeParseWRMResponse, debugDataStructure } from "@/lib/json-safe-parser";

export default function WebsitePlugins() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const websiteId = params.id;

  // Debug logging
  console.log('WebsitePlugins - Raw websiteId from URL params:', websiteId);
  
  // Check if websiteId is valid
  if (!websiteId || websiteId === 'undefined' || websiteId === 'null' || isNaN(Number(websiteId))) {
    return (
      <AppLayout title="Invalid Website" defaultOpen={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Invalid Website ID</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The website ID "{websiteId}" is not valid.
          </p>
          <Button onClick={() => setLocation('/websites')}>
            Back to Websites
          </Button>
        </div>
      </AppLayout>
    );
  }
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPlugins, setSelectedPlugins] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("plugins");
  
  // Scheduling state
  const [scheduleSettings, setScheduleSettings] = useState({
    enabled: false,
    time: "02:00",
    day: "sunday",
    safeUpdate: false,
    rollbackEnabled: false,
    notifications: {
      enabled: false,
      email: "",
      onSuccess: true,
      onFailure: true
    }
  });
  const [scheduledPlugins, setScheduledPlugins] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Format WRM errors for display
  const formatWRMError = (error: any) => {
    if (!error) return 'No error information available';
    
    // Handle specific JSON parsing errors
    if (error.message && (error.message.includes('JSON.parse: unexpected character') || error.message.includes('Unexpected token'))) {
      return 'WordPress site returned HTML instead of JSON data. This usually means:\n• Site is showing a 503 Service Unavailable page\n• WRM plugin may not be installed properly\n• Site may be in maintenance mode\n• Server configuration issues';
    }
    
    // Handle HTML error responses
    if (error.message && error.message.includes('HTML error page')) {
      return 'WordPress site is showing an error page instead of API data.\n\nTroubleshooting steps:\n• Check if the WordPress site is accessible\n• Verify the WRM plugin is installed and activated\n• Ensure the API key is correct';
    }
    
    // Return formatted error message
    return error.message || 'Unknown error occurred';
  };

  const { data: website, isLoading } = useQuery<Website>({
    queryKey: ['/api/websites', websiteId],
    enabled: !!websiteId,
  });

  const { data: wordpressData, isLoading: wpDataLoading, refetch: refetchWordPressData } = useQuery<any>({
    queryKey: ['/api/websites', websiteId, 'wordpress-data'],
    enabled: !!websiteId && website?.connectionStatus === 'connected',
  });

  // Get WP Remote Manager updates data
  const { data: wrmUpdates } = useQuery<any>({
    queryKey: ['/api/websites', websiteId, 'wrm', 'updates'],
    enabled: !!websiteId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch WRM plugins data separately
  const { data: wrmPlugins, isLoading: pluginsLoading, error: pluginsError, refetch: refetchPlugins } = useQuery<any[]>({
    queryKey: ['/api/websites', websiteId, 'wrm-plugins'],
    enabled: !!websiteId && !!website,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry to see actual errors
  });

  // Debug log to check website data
  console.log('Website data for plugins:', website);
  console.log('Has wrmApiKey for plugins:', !!website?.wrmApiKey);
  console.log('WRM Plugins data:', wrmPlugins);
  console.log('Query enabled condition:', !!websiteId && !!website);
  console.log('WebsiteId:', websiteId);
  console.log('Website exists:', !!website);
  // Debug data structure with safe parsing
  debugDataStructure(wrmPlugins, 'WRM Plugins');

  // Mutations for plugin actions
  const togglePluginMutation = useMutation({
    mutationFn: async ({ pluginId, action }: { pluginId: string, action: 'activate' | 'deactivate' }) => {
      const response = await fetch(`/api/websites/${websiteId}/plugins/${pluginId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to toggle plugin');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'wordpress-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'wrm-plugins'] });
      toast({ title: 'Plugin status updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update plugin status', variant: 'destructive' });
    }
  });

  const deletePluginMutation = useMutation({
    mutationFn: async (pluginId: string) => {
      const response = await fetch(`/api/websites/${websiteId}/plugins/${pluginId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to delete plugin');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'wordpress-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'wrm-plugins'] });
      toast({ title: 'Plugin deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete plugin', variant: 'destructive' });
    }
  });

  const updatePluginMutation = useMutation({
    mutationFn: async (pluginId: string) => {
      const response = await fetch(`/api/websites/${websiteId}/plugins/${pluginId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to update plugin');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'wordpress-data'] });
      toast({ title: 'Plugin updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update plugin', variant: 'destructive' });
    }
  });

  // Scheduling mutations
  const saveScheduleMutation = useMutation({
    mutationFn: async (settings: typeof scheduleSettings) => {
      const response = await fetch(`/api/websites/${websiteId}/plugin-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Failed to save schedule');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Schedule settings saved successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to save schedule settings', variant: 'destructive' });
    }
  });

  const schedulePluginsMutation = useMutation({
    mutationFn: async (pluginIds: string[]) => {
      const response = await fetch(`/api/websites/${websiteId}/schedule-plugins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginIds, settings: scheduleSettings })
      });
      if (!response.ok) throw new Error('Failed to schedule plugins');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Plugins scheduled for automatic updates' });
      setScheduledPlugins(prev => [...prev, ...selectedPlugins.map(i => (Array.isArray(filteredPlugins) && filteredPlugins[i]?.name) || '')]);
      setSelectedPlugins([]);
    },
    onError: () => {
      toast({ title: 'Failed to schedule plugins', variant: 'destructive' });
    }
  });

  if (isLoading || pluginsLoading) {
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
      <AppLayout title={`${website.name} - Plugins`} defaultOpen={false}>
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
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">WP Remote Manager Not Connected</h1>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                This website needs to be connected to WordPress Remote Manager to view and manage plugins.
              </p>
              <div className="space-y-4 max-w-md mx-auto text-left">
                <h3 className="font-semibold">Debug Information:</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 text-sm">
                  <div>Website ID: {websiteId}</div>
                  <div>Website Found: {website ? '✓' : '✗'}</div>
                  <div>Has WRM API Key: {website?.wrmApiKey ? '✓' : '✗'}</div>
                  <div>Connection Status: {website?.connectionStatus || 'unknown'}</div>
                  <div>Query Enabled: {(!!websiteId && !!website).toString()}</div>
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

  // Show error display if plugins failed to load
  if (pluginsError && !pluginsLoading) {
    return (
      <AppLayout title={`${website.name} - Plugins`} defaultOpen={false}>
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
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Plugins</h1>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                There was an error connecting to the WordPress Remote Manager API to fetch plugin data.
              </p>
              <div className="space-y-4 max-w-2xl mx-auto text-left">
                <h3 className="font-semibold">Error Details:</h3>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded p-4 text-sm">
                  <pre className="whitespace-pre-wrap">
                    {formatWRMError(pluginsError)}
                  </pre>
                </div>
                <h3 className="font-semibold">Debug Information:</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 text-sm">
                  <div>Website ID: {websiteId}</div>
                  <div>Website URL: {website?.url}</div>
                  <div>Has WRM API Key: {website?.wrmApiKey ? '✓' : '✗'}</div>
                  <div>Connection Status: {website?.connectionStatus || 'unknown'}</div>
                  <div>API Endpoint: /api/websites/{websiteId}/wrm-plugins</div>
                </div>
              </div>
              <div className="flex gap-4 justify-center mt-6">
                <Button 
                  variant="outline"
                  onClick={() => refetchPlugins()}
                  disabled={pluginsLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${pluginsLoading ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation(`/websites/${websiteId}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Website
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Handle both array format and object format from WRM API using safe parser
  const parsedWRMData = safeParseWRMResponse(wrmPlugins);
  const plugins = parsedWRMData.data;
      
  console.log('Processed plugins array:', plugins);
  console.log('Processed plugins length:', plugins.length);
  const filteredPlugins = Array.isArray(plugins) ? plugins.filter((plugin: any) => {
    if (!plugin || !plugin.name) return false;
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && plugin.active) ||
                         (statusFilter === "inactive" && !plugin.active);
    return matchesSearch && matchesStatus;
  }) : [];

  // Calculate plugin updates count from WP Remote Manager updates API
  const pluginUpdatesCount = wrmUpdates?.plugins?.length || 0;

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedPlugins.length === filteredPlugins.length) {
      setSelectedPlugins([]);
    } else {
      setSelectedPlugins(Array.isArray(filteredPlugins) ? filteredPlugins.map((_: any, index: number) => index) : []);
    }
  };

  const handleSelectPlugin = (index: number) => {
    setSelectedPlugins(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getStatusIcon = (active: boolean) => {
    if (active) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (active: boolean) => {
    if (active) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
    } else {
      return <Badge variant="outline" className="bg-gray-100 text-gray-600">Inactive</Badge>;
    }
  };

  return (
    <AppLayout title={`${website.name} - Plugins`} defaultOpen={false}>
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
                <FileText className="h-6 w-6 mr-2 text-blue-600" />
                Plugins Management
                {pluginUpdatesCount > 0 && (
                  <Badge className="ml-3 bg-orange-100 text-orange-800 border-orange-300">
                    {pluginUpdatesCount} Updates Available
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
                  <a href={`${website.url}/wp-admin/plugin-install.php`} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Install New
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Install new plugins from WordPress repository</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm"
                  asChild
                >
                  <a href={`${website.url}/wp-admin/plugins.php`} target="_blank" rel="noopener noreferrer">
                    <Settings className="h-4 w-4 mr-2" />
                    WP Admin
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open WordPress plugins management</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="plugins" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Plugins
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Scheduling
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plugins" className="space-y-6">
            {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plugins</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{plugins.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Array.isArray(plugins) ? plugins.filter((p: any) => p && p.active).length : 0}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {Array.isArray(plugins) ? plugins.filter((p: any) => p && !p.active).length : 0}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Updates Available</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Array.isArray(plugins) ? plugins.filter((p: any) => p && p.update_available).length : 0}
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search plugins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedPlugins.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedPlugins.length} plugin{selectedPlugins.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Power className="h-4 w-4 mr-2" />
                    Activate Selected
                  </Button>
                  <Button size="sm" variant="outline">
                    <PowerOff className="h-4 w-4 mr-2" />
                    Deactivate Selected
                  </Button>
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
            id="select-all"
            checked={selectedPlugins.length === filteredPlugins.length && filteredPlugins.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm text-muted-foreground">
            Select all ({filteredPlugins.length} plugins)
          </label>
          <span className="text-xs text-muted-foreground ml-auto">
            {selectedPlugins.length} selected
          </span>
          {selectedPlugins.length > 0 && (
            <Button size="sm" variant="outline">
              Deactivate & Delete
            </Button>
          )}
        </div>

        {/* Plugins List */}
        {(wpDataLoading || pluginsLoading) ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-400">Loading plugins...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPlugins.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || statusFilter !== "all" ? "No plugins match your filters" : "No plugins found"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              Array.isArray(filteredPlugins) && filteredPlugins.map((plugin: any, index: number) => (
                <div key={`plugin-${plugin.plugin || plugin.slug || plugin.name || index}`} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    checked={selectedPlugins.includes(index)}
                    onCheckedChange={() => handleSelectPlugin(index)}
                  />
                  
                  {/* Plugin Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {plugin.name ? plugin.name.charAt(0).toUpperCase() : 'P'}
                  </div>

                  {/* Plugin Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{plugin.name}</h3>
                      {plugin.update_available && (
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                          <Download className="h-3 w-3 mr-1" />
                          {plugin.new_version}
                        </Badge>
                      )}
                    </div>
                    <p 
                      className="text-xs text-muted-foreground line-clamp-2 mt-1"
                      dangerouslySetInnerHTML={{ 
                        __html: plugin.description || 'No description available' 
                      }}
                    />
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Version {plugin.version}</span>
                      {plugin.author && <span>By {plugin.author}</span>}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge className={`${
                    plugin.active 
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  } text-xs flex items-center gap-1`}>
                    {plugin.active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                    {plugin.active ? 'Active' : 'Inactive'}
                  </Badge>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {plugin.active ? (
                        <DropdownMenuItem 
                          onClick={() => togglePluginMutation.mutate({ pluginId: plugin.plugin, action: 'deactivate' })}
                        >
                          <PowerOff className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => togglePluginMutation.mutate({ pluginId: plugin.plugin, action: 'activate' })}
                        >
                          <Power className="h-4 w-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      {plugin.update_available && (
                        <DropdownMenuItem 
                          onClick={() => updatePluginMutation.mutate(plugin.plugin)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Update
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => deletePluginMutation.mutate(plugin.plugin)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        )}
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-6">
            {/* General Schedule Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="update-time">Update Time</Label>
                    <Select value={scheduleSettings.time} onValueChange={(value) => 
                      setScheduleSettings(prev => ({ ...prev, time: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00:00">00:00 (Midnight)</SelectItem>
                        <SelectItem value="02:00">02:00 AM</SelectItem>
                        <SelectItem value="04:00">04:00 AM</SelectItem>
                        <SelectItem value="06:00">06:00 AM</SelectItem>
                        <SelectItem value="08:00">08:00 AM</SelectItem>
                        <SelectItem value="22:00">22:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="update-day">Update Day</Label>
                    <Select value={scheduleSettings.day} onValueChange={(value) => 
                      setScheduleSettings(prev => ({ ...prev, day: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunday">Sunday</SelectItem>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="safe-update"
                      checked={scheduleSettings.safeUpdate}
                      onCheckedChange={(checked) => 
                        setScheduleSettings(prev => ({ ...prev, safeUpdate: checked }))
                      }
                    />
                    <Label htmlFor="safe-update" className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      Perform Safe Update
                    </Label>
                  </div>
                  
                  {scheduleSettings.safeUpdate && (
                    <div className="ml-6 flex items-center space-x-2">
                      <Switch
                        id="rollback-enabled"
                        checked={scheduleSettings.rollbackEnabled}
                        onCheckedChange={(checked) => 
                          setScheduleSettings(prev => ({ ...prev, rollbackEnabled: checked }))
                        }
                      />
                      <Label htmlFor="rollback-enabled">Enable automatic rollback on failure</Label>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => saveScheduleMutation.mutate(scheduleSettings)}
                  disabled={saveScheduleMutation.isPending}
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveScheduleMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            {/* Plugin Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Plugins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select plugins for automatic updates
                    </p>
                    <Button
                      onClick={() => schedulePluginsMutation.mutate(selectedPlugins.map(i => (Array.isArray(filteredPlugins) && filteredPlugins[i]?.slug) || ''))}
                      disabled={selectedPlugins.length === 0 || schedulePluginsMutation.isPending}
                      size="sm"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {schedulePluginsMutation.isPending ? 'Scheduling...' : 'Schedule Selected'}
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {Array.isArray(filteredPlugins) && filteredPlugins.map((plugin: any, index: number) => (
                      <div key={`schedule-plugin-${plugin.plugin || plugin.slug || plugin.name || index}`} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Checkbox
                          id={`schedule-${plugin.slug}`}
                          checked={selectedPlugins.includes(index)}
                          onCheckedChange={() => handleSelectPlugin(index)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label 
                                htmlFor={`schedule-${plugin.slug}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {plugin.name}
                              </Label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Version {plugin.version}
                                {plugin.update_available && plugin.new_version && (
                                  <span className="ml-2 text-orange-600">
                                    → {plugin.new_version} available
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(plugin.status)}
                              {scheduledPlugins.includes(plugin.name) && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                  Scheduled
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-600" />
                  Event Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notifications-enabled"
                    checked={scheduleSettings.notifications.enabled}
                    onCheckedChange={(checked) => 
                      setScheduleSettings(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, enabled: checked }
                      }))
                    }
                  />
                  <Label htmlFor="notifications-enabled">Enable email notifications</Label>
                </div>

                {scheduleSettings.notifications.enabled && (
                  <div className="space-y-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="notification-email">Email Address</Label>
                      <Input
                        id="notification-email"
                        type="email"
                        placeholder="Enter email address"
                        value={scheduleSettings.notifications.email}
                        onChange={(e) => 
                          setScheduleSettings(prev => ({ 
                            ...prev, 
                            notifications: { ...prev.notifications, email: e.target.value }
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="notify-success"
                          checked={scheduleSettings.notifications.onSuccess}
                          onCheckedChange={(checked) => 
                            setScheduleSettings(prev => ({ 
                              ...prev, 
                              notifications: { ...prev.notifications, onSuccess: checked }
                            }))
                          }
                        />
                        <Label htmlFor="notify-success">Notify on successful updates</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="notify-failure"
                          checked={scheduleSettings.notifications.onFailure}
                          onCheckedChange={(checked) => 
                            setScheduleSettings(prev => ({ 
                              ...prev, 
                              notifications: { ...prev.notifications, onFailure: checked }
                            }))
                          }
                        />
                        <Label htmlFor="notify-failure">Notify on failed updates</Label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </TooltipProvider>
        </div>
      </div>
    </AppLayout>
  );
}