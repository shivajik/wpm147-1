import { useParams, useLocation } from "wouter";
import type { Website } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Gauge, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/app-layout";
import { MaintenanceSidebar } from "@/components/maintenance/maintenance-sidebar";
import { PerformanceScan } from "@/components/performance/performance-scan";

export default function WebsitePerformance() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const websiteId = params.id;

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

  const { data: website, isLoading } = useQuery<Website>({
    queryKey: ['/api/websites', websiteId],
    enabled: !!websiteId,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading website performance data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!website) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Website not found.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`${website.name} - Performance`} defaultOpen={false}>
      <div className="flex gap-6">
        {/* Maintenance Sidebar */}
        {website && (
          <MaintenanceSidebar 
            websiteId={parseInt(websiteId!)}
            websiteName={website.name}
            websiteUrl={website.url}
          />
        )}
        
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Gauge className="h-6 w-6 text-purple-600" />
                Performance Analysis
              </h1>
              <p className="text-muted-foreground mt-1">
                Website speed and optimization metrics
              </p>
            </div>
          </div>

          {/* Use the existing PerformanceScan component */}
          <PerformanceScan websiteId={parseInt(websiteId!)} />
        </div>
      </div>
    </AppLayout>
  );
}