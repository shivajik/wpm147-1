import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Users, 
  Globe, 
  Calendar, 
  Settings, 
  FileText,
  Wrench,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Websites", href: "/websites", icon: Globe },
  { name: "Tasks", href: "/tasks", icon: Calendar },
];

const tools = [
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
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

  return (
    <aside className="bg-white w-64 min-h-screen shadow-sm border-r border-slate-200 hidden lg:block">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">AIO Webcare</h1>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-6 mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MAIN</p>
        </div>
        <ul className="space-y-1 px-3">
          {Array.isArray(navigation) && navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <span
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="px-6 mb-4 mt-8">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TOOLS</p>
        </div>
        <ul className="space-y-1 px-3">
          {Array.isArray(tools) && tools.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <span
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Profile Section */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>
              {getInitials(user?.firstName, user?.lastName, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || 'User'
              }
            </p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
