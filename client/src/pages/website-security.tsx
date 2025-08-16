import { useParams, useLocation } from "wouter";
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/app-layout';
import { MaintenanceSidebar } from '@/components/maintenance/maintenance-sidebar';
import { SecurityScan } from '@/components/security/security-scan-new';
import type { Website } from '@shared/schema';

export default function WebsiteSecurityPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  // Check if websiteId is valid
  if (!id || id === 'undefined' || id === 'null' || isNaN(Number(id))) {
    return (
      <AppLayout title="Invalid Website" defaultOpen={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Invalid Website ID</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The website ID "{id}" is not valid.
          </p>
          <Button onClick={() => setLocation('/websites')}>
            Back to Websites
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  const websiteId = parseInt(id);

  const { data: website } = useQuery<Website>({
    queryKey: ['/api/websites', id],
    enabled: !!id,
  });

  return (
    <AppLayout defaultOpen={false}>
      <div className="flex gap-6">
        {/* Left Sidebar - Maintenance Sidebar */}
        <MaintenanceSidebar 
          websiteId={websiteId}
          websiteName={website?.name || 'Loading...'}
          websiteUrl={website?.url || ''}
        />

        {/* Main Content - Security Scan */}
        <div className="flex-1">
          <SecurityScan websiteId={websiteId} />
        </div>
      </div>
    </AppLayout>
  );
}