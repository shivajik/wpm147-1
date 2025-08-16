import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar-export";
import TopBar from "./topbar";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  defaultOpen?: boolean;
}

export default function AppLayout({ children, title, defaultOpen = true }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="relative">
        <TopBar title={title || "Dashboard"} />
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        

      </SidebarInset>
    </SidebarProvider>
  );
}