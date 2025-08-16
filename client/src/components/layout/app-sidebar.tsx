import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Users, 
  Globe, 
  Calendar, 
  Settings, 
  FileText,
  Star
} from "lucide-react";
import { SiWordpress } from "react-icons/si";
import { cn } from "@/lib/utils";

// Dynamic navigation will be generated inside component

const tools = [
  { name: "Reports", href: "/reports", icon: FileText, badge: null },
];

export default function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Fetch real data for badges
  const { data: websites = [] } = useQuery({ 
    queryKey: ['/api/websites'], 
    enabled: !!user 
  }) as { data: any[] };
  
  const { data: clients = [] } = useQuery({ 
    queryKey: ['/api/clients'], 
    enabled: !!user 
  }) as { data: any[] };
  
  const { data: tasks = [] } = useQuery({ 
    queryKey: ['/api/tasks'], 
    enabled: !!user 
  }) as { data: any[] };

  // Calculate real counts
  const pendingTasks = Array.isArray(tasks) ? tasks.filter((task: any) => task.status !== "completed").length : 0;
  const websiteCount = Array.isArray(websites) ? websites.length : 0;
  const clientCount = Array.isArray(clients) ? clients.length : 0;
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3, badge: null },
    { name: "Clients", href: "/clients", icon: Users, badge: clientCount > 0 ? clientCount.toString() : null },
    { name: "Websites", href: "/websites", icon: Globe, badge: websiteCount > 0 ? websiteCount.toString() : null },
    { name: "Tasks", href: "/tasks", icon: Calendar, badge: pendingTasks > 0 ? pendingTasks.toString() : null },
  ];

  const accountNavigation = [
    { name: "Account Settings", href: "/profile", icon: Settings, badge: null },
    { name: "Subscription", href: "/subscription", icon: Star, badge: null },
  ];

  return (
    <Sidebar collapsible="icon" className="bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-lg">
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 relative" style={{ position: 'static', top: 'auto' }}>
        <div className="p-6 group-data-[collapsible=icon]:p-4">
          <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:space-y-3">
            <div className="flex items-center space-x-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:space-x-0 group-data-[collapsible=icon]:space-y-2">
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <SiWordpress className="h-6 w-6 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></div>
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  WP ProCare
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  WordPress Management Platform
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <SidebarTrigger className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors" />
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3 group-data-[collapsible=icon]:hidden">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {Array.isArray(navigation) && navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={cn(
                        "h-10 rounded-lg transition-all duration-200 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:mx-1",
                        isActive 
                          ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium shadow-sm border-l-3 border-blue-600" 
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                      )}
                    >
                      <Link href={item.href} className="group-data-[collapsible=icon]:justify-center flex items-center justify-between w-full px-3 group-data-[collapsible=icon]:px-2">
                        <div className="flex items-center min-w-0">
                          <item.icon className="w-5 h-5 mr-3 group-data-[collapsible=icon]:mr-0 flex-shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden font-medium text-sm truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className="group-data-[collapsible=icon]:hidden ml-auto h-5 px-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3 group-data-[collapsible=icon]:hidden">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {Array.isArray(tools) && tools.map((item) => {
                const isActive = location === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={cn(
                        "h-10 rounded-lg transition-all duration-200 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:mx-1",
                        isActive 
                          ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium shadow-sm border-l-3 border-blue-600" 
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                      )}
                    >
                      <Link href={item.href} className="group-data-[collapsible=icon]:justify-center flex items-center w-full px-3 group-data-[collapsible=icon]:px-2">
                        <item.icon className="w-5 h-5 mr-3 group-data-[collapsible=icon]:mr-0 flex-shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden font-medium text-sm">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3 group-data-[collapsible=icon]:hidden">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {Array.isArray(accountNavigation) && accountNavigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={cn(
                        "h-10 rounded-lg transition-all duration-200 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:mx-1",
                        isActive 
                          ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium shadow-sm border-l-3 border-blue-600" 
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                      )}
                    >
                      <Link href={item.href} className="group-data-[collapsible=icon]:justify-center flex items-center w-full px-3 group-data-[collapsible=icon]:px-2">
                        <item.icon className="w-5 h-5 mr-3 group-data-[collapsible=icon]:mr-0 flex-shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden font-medium text-sm">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}