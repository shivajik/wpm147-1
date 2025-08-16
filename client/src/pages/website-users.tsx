import { useParams, useLocation } from "wouter";
import type { Website } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { isValidWebsiteId, InvalidWebsiteIdPage } from "@/lib/website-validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  RefreshCw, 
  Search, 
  UserPlus,
  Settings,
  ArrowLeft,
  ExternalLink,
  Mail,
  Shield,
  Crown,
  User,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MaintenanceSidebar } from "@/components/maintenance/maintenance-sidebar";
import { useState } from "react";

export default function WebsiteUsers() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const websiteId = params.id;
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Validate website ID
  if (!isValidWebsiteId(websiteId)) {
    return <InvalidWebsiteIdPage websiteId={websiteId} />;
  }

  const { data: website, isLoading } = useQuery<Website>({
    queryKey: ['/api/websites', websiteId],
    enabled: !!websiteId,
  });

  const { data: wordpressData, isLoading: wpDataLoading, refetch: refetchWordpressData } = useQuery<any>({
    queryKey: [`/api/websites/${websiteId}/wordpress-data`],
    enabled: !!websiteId && website?.connectionStatus === 'connected',
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data (cacheTime is deprecated in v5)
  });

  // Fetch WRM users data separately  
  const { data: wrmUsers, isLoading: usersLoading, refetch: refetchUsers } = useQuery<any[]>({
    queryKey: ['/api/websites', websiteId, 'wrm-users'],
    enabled: !!websiteId && !!website,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Debug log to check website data
  console.log('Website data:', website);
  console.log('Has wrmApiKey:', !!website?.wrmApiKey);

  if (isLoading || usersLoading) {
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
      <AppLayout title={`${website.name} - Users`} defaultOpen={false}>
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
              <Users className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">WP Remote Manager Not Connected</h1>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                This website needs to be connected to WordPress Remote Manager to view and manage users.
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
  const users = Array.isArray(wrmUsers) 
    ? wrmUsers 
    : (wrmUsers && typeof wrmUsers === 'object' && 'success' in wrmUsers && Array.isArray((wrmUsers as any).users)) 
      ? (wrmUsers as any).users 
      : [];
  
  console.log('WordPress data:', wordpressData);
  console.log('Users data:', users);
  console.log('Users length:', users.length);
  
  const filteredUsers = users.filter((user: any) => {
    console.log('Filtering user:', user); // Debug each user
    
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle both single role and roles array - check all possible role fields
    const userRoles = user.roles || user.user_roles || [user.role] || ['subscriber'];
    const userRole = Array.isArray(userRoles) ? userRoles[0] : userRoles;
    const matchesRole = roleFilter === "all" || userRole === roleFilter;
    
    console.log('User matches search:', matchesSearch, 'matches role:', matchesRole);
    return matchesSearch && matchesRole;
  });

  console.log('Filtered users:', filteredUsers); // Debug log after filtering

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'administrator':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'editor':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'author':
        return <User className="h-4 w-4 text-green-600" />;
      case 'contributor':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'subscriber':
        return <Eye className="h-4 w-4 text-gray-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string | undefined) => {
    // Handle undefined or empty role
    const safeRole = role || 'subscriber';
    
    const roleConfig = {
      administrator: { variant: "default" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      editor: { variant: "default" as const, className: "bg-blue-100 text-blue-800 border-blue-300" },
      author: { variant: "default" as const, className: "bg-green-100 text-green-800 border-green-300" },
      contributor: { variant: "default" as const, className: "bg-purple-100 text-purple-800 border-purple-300" },
      subscriber: { variant: "outline" as const, className: "bg-gray-100 text-gray-600" }
    };

    const config = roleConfig[safeRole as keyof typeof roleConfig] || roleConfig.subscriber;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {safeRole.charAt(0).toUpperCase() + safeRole.slice(1)}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean).map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate users by role for stats
  const usersByRole = users.reduce((acc: any, user: any) => {
    // Handle multiple role field formats
    const userRoles = user.roles || user.user_roles || [user.role] || ['subscriber'];
    const role = Array.isArray(userRoles) ? userRoles[0] : userRoles;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  return (
    <AppLayout title={`${website.name} - Users`} defaultOpen={false}>
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
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Users Management
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
                  <a href={`${website.url}/wp-admin/user-new.php`} target="_blank" rel="noopener noreferrer">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add a new WordPress user</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm"
                  asChild
                >
                  <a href={`${website.url}/wp-admin/users.php`} target="_blank" rel="noopener noreferrer">
                    <Settings className="h-4 w-4 mr-2" />
                    WP Admin
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open WordPress users management</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Administrators</p>
                  <p className="text-2xl font-bold text-yellow-600">{usersByRole.administrator || 0}</p>
                </div>
                <Crown className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Editors</p>
                  <p className="text-2xl font-bold text-blue-600">{usersByRole.editor || 0}</p>
                </div>
                <Edit className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Authors</p>
                  <p className="text-2xl font-bold text-green-600">{usersByRole.author || 0}</p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscribers</p>
                  <p className="text-2xl font-bold text-gray-600">{usersByRole.subscriber || 0}</p>
                </div>
                <Eye className="h-8 w-8 text-gray-600" />
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
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={roleFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={roleFilter === "administrator" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("administrator")}
                >
                  Administrators
                </Button>
                <Button
                  variant={roleFilter === "editor" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("editor")}
                >
                  Editors
                </Button>
                <Button
                  variant={roleFilter === "author" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("author")}
                >
                  Authors
                </Button>
                <Button
                  variant={roleFilter === "subscriber" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("subscriber")}
                >
                  Subscribers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {wpDataLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
              <p className="text-xs text-gray-500 mt-2">Fetching data from WordPress API...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || roleFilter !== "all" ? "No users match your filters" : "No users found"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Debug: {users.length} users in data, {filteredUsers.length} filtered users, WordPress data: {wordpressData ? 'loaded' : 'not loaded'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Search: "{searchTerm}", Role filter: "{roleFilter}"
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      refetchWordpressData();
                      refetchUsers();
                    }}
                    className="mt-4"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Loading Users
                  </Button>
                </CardContent>
              </Card>
            ) : (
              Array.isArray(filteredUsers) && filteredUsers.map((user: any, index: number) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url} alt={user.display_name || user.name || user.username} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(user.display_name || user.name || user.user_login || user.username || 'User')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.display_name || user.name || user.username || 'Unknown User'}
                            </h3>
                            {(() => {
                              const userRoles = user.roles || user.user_roles || [user.role] || ['subscriber'];
                              const role = Array.isArray(userRoles) ? userRoles[0] : userRoles;
                              return getRoleIcon(role);
                            })()}
                            {(() => {
                              const userRoles = user.roles || user.user_roles || [user.role] || ['subscriber'];
                              const role = Array.isArray(userRoles) ? userRoles[0] : userRoles;
                              return getRoleBadge(role);
                            })()}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>@{user.user_login || user.username || 'unknown'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              {user.user_email || user.email ? (
                                <span className="text-gray-700 dark:text-gray-300">
                                  {user.user_email || user.email}
                                </span>
                              ) : (
                                <span className="text-gray-500 italic text-xs">
                                  Private (WordPress security)
                                  <span className="block text-[10px] opacity-75">
                                    Requires WRM plugin update for email access
                                  </span>
                                </span>
                              )}
                            </div>
                            {(user.post_count !== undefined || user.posts_count !== undefined) && (
                              <div className="flex items-center space-x-1">
                                <Edit className="h-3 w-3" />
                                <span>{user.post_count || user.posts_count || 0} posts</span>
                              </div>
                            )}
                          </div>
                          
                          {(user.registered_date || user.user_registered) && (
                            <p className="text-xs text-gray-500 mt-1">
                              Registered: {new Date(user.registered_date || user.user_registered).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View user profile</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit user</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {(Array.isArray(user.roles) ? user.roles[0] : user.role) !== 'administrator' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete user</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Note about user data */}
        <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-200">User Data Privacy</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  For security reasons, WordPress user data may not be accessible via API. 
                  Use the WordPress Admin link above to manage users directly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
          </TooltipProvider>
        </div>
      </div>
    </AppLayout>
  );
}