// Lazy-loaded components for performance optimization
import { lazy } from 'react';

// Large page components that can be lazy loaded
export const LazyDashboard = lazy(() => import('@/pages/dashboard'));
export const LazyProfile = lazy(() => import('@/pages/profile'));
export const LazyWebsitePlugins = lazy(() => import('@/pages/website-plugins'));
export const LazyWebsiteThemes = lazy(() => import('@/pages/website-themes'));
export const LazyWebsiteUsers = lazy(() => import('@/pages/website-users'));
export const LazyWebsiteSEO = lazy(() => import('@/pages/website-seo'));
export const LazyWebsiteBackup = lazy(() => import('@/pages/website-backup'));
export const LazyClientReports = lazy(() => import('@/pages/client-reports'));
export const LazyCreateReport = lazy(() => import('@/pages/create-report'));
export const LazyLinkMonitor = lazy(() => import('@/pages/link-monitor'));
export const LazySecurityScanHistory = lazy(() => import('@/pages/security-scan-history'));

// Loading component for lazy components
export const PageSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-8">
    <div className="text-center max-w-lg mx-auto space-y-6">
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="flex items-center gap-3 justify-center">
          <div className="h-4 w-4 bg-primary/20 rounded animate-pulse" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full animate-pulse transition-all duration-500" style={{ width: '65%' }}></div>
        </div>
      </div>
    </div>
  </div>
);