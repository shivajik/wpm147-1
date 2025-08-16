import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, Settings } from "lucide-react";
import WordPressSyncButton from "@/components/websites/wordpress-sync-button";
import EditWebsiteDialog from "@/components/websites/edit-website-dialog";
import WebsiteCards from "@/components/websites/website-cards";
import type { Website } from "@shared/schema";

export default function Websites() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: websites, isLoading: websitesLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppLayout title="Websites">
      <div className="space-y-8">
        {websitesLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <WebsiteCards 
            websites={websites || []}
            viewMode="grid"
            showViewToggle={true}
          />
        )}
        
        {/* Additional Website Management Tools */}
        {websites && websites.length > 0 && (
          <div className="border-t pt-8 space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Bulk Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Sync All Websites
              </Button>
              <Button variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Export List
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Health Check All
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
