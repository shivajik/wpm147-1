import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Settings, User, LogOut } from "lucide-react";
import AddClientDialog from "@/components/clients/add-client-dialog";
import AddWebsiteDialog from "@/components/websites/add-website-dialog";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const [location] = useLocation();
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isAddWebsiteDialogOpen, setIsAddWebsiteDialogOpen] = useState(false);
  const { user, logout } = useAuth();

  const getInitials = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  // Determine what to add based on current route
  const getAddButtonConfig = () => {
    if (location === "/websites") {
      return {
        text: "Add Website",
        onClick: () => setIsAddWebsiteDialogOpen(true),
      };
    }
    // Default to Add Client for other pages
    return {
      text: "Add Client",
      onClick: () => setIsAddClientDialogOpen(true),
    };
  };

  const addButtonConfig = getAddButtonConfig();

  return (
    <>
      <header className="border-b border-border/40 px-6 py-4 bg-background/95 dark:bg-background/95 sticky top-0 z-40 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-foreground">
                {title}
              </h2>
              {location === "/" && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                  Live
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search clients, sites..."
                className="pl-10 w-72 bg-muted/50 border-border/60 focus:border-primary/60 transition-colors"
              />
            </div>
            
            {/* Quick Actions */}
            <Button 
              size="sm" 
              onClick={addButtonConfig.onClick}
              className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              {addButtonConfig.text}
            </Button>
            
            {/* Mobile Add Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addButtonConfig.onClick}
              className="sm:hidden w-9 h-9 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {/* Notifications */}
            <NotificationCenter />
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-slate-200 dark:hover:ring-slate-700 transition-all">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {getInitials(user?.firstName, user?.lastName, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email?.split('@')[0] || 'User'
                      }
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <AddClientDialog 
        open={isAddClientDialogOpen} 
        onOpenChange={setIsAddClientDialogOpen} 
      />
      <AddWebsiteDialog 
        open={isAddWebsiteDialogOpen} 
        onOpenChange={setIsAddWebsiteDialogOpen} 
      />
    </>
  );
}
