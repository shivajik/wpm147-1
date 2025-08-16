import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Settings, 
  ExternalLink
} from 'lucide-react';
import AppLayout from '@/components/layout/app-layout';
import type { Website } from '@shared/schema';
import EditWebsiteDialog from '@/components/websites/edit-website-dialog';
import WordPressSyncButton from '@/components/websites/wordpress-sync-button';
import ComprehensiveDashboard from '@/components/websites/comprehensive-dashboard';
import { MaintenanceSidebar } from '@/components/maintenance/maintenance-sidebar';

export default function WebsiteDetail() {
  const { id: websiteId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  // Debug logging
  console.log('WebsiteDetail - Raw websiteId from URL params:', websiteId);
  
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
    enabled: !!websiteId && websiteId !== 'undefined',
  });

  const { data: wordpressData } = useQuery({
    queryKey: ['/api/websites', websiteId, 'wordpress-data'],
    enabled: !!websiteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
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

  return (
    <AppLayout title={website?.name || "Website Details"} defaultOpen={false}>
      {/* Website Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 -mx-6 -mt-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Monitor className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{website.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <a 
                  href={website.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                >
                  <span>{website.url}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Badge variant={website.connectionStatus === 'connected' ? 'default' : 'destructive'}>
                  {website.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                WordPress {website.wpVersion || (wordpressData as any)?.systemInfo?.wordpress_version || '6.4.2'} • 
                Last synced: {website.lastSync ? new Date(website.lastSync).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <EditWebsiteDialog 
              website={website}
              trigger={
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              }
            />
            <WordPressSyncButton 
              websiteId={parseInt(websiteId!)} 
              isConnected={website?.connectionStatus === 'connected'}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex gap-6">
        {/* Left Sidebar - Maintenance Sidebar */}
        <MaintenanceSidebar 
          websiteId={parseInt(websiteId!)}
          websiteName={website.name}
          websiteUrl={website.url}
        />

        {/* Main Content - Comprehensive Dashboard */}
        <div className="flex-1">
          <ComprehensiveDashboard websiteId={parseInt(websiteId!)} />
        </div>
      </div>
    </AppLayout>
  );
}