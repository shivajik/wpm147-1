import { QuickActions } from '@/components/websites/quick-actions';

interface MaintenanceSidebarProps {
  websiteId: number;
  websiteName: string;
  websiteUrl: string;
}

export function MaintenanceSidebar({ websiteId, websiteName, websiteUrl }: MaintenanceSidebarProps) {
  return (
    <div className="w-80 flex-shrink-0">
      <div className="sticky top-6 space-y-4">
        {/* Quick Actions */}
        <QuickActions 
          websiteId={websiteId}
          websiteName={websiteName}
          websiteUrl={websiteUrl}
        />
      </div>
    </div>
  );
}