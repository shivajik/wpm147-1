import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import ClientManagement from "@/pages/feature-client-management";
import PerformanceMonitoring from "@/pages/feature-performance-monitoring";
import SecurityScanning from "@/pages/feature-security-scanning";
import AutomatedMaintenance from "@/pages/feature-automated-maintenance";
import AdvancedAnalytics from "@/pages/feature-advanced-analytics";
import OneClickActions from "@/pages/feature-one-click-actions";

import Contact from "@/pages/contact";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
// Keep critical pages as regular imports
import Clients from "@/pages/clients";
import Websites from "@/pages/websites";
import Tasks from "@/pages/tasks";
import WebsiteDetail from "@/pages/website-detail";
import WebsiteSecurity from "@/pages/website-security";
import WebsitePerformance from "@/pages/website-performance";
import Subscription from "@/pages/subscription";
import SubscriptionPreview from "@/pages/subscription-preview";
import ViewReport from "@/pages/view-report";
import SeoReportPage from "@/pages/seo-report";

// Lazy load heavy components for performance
import { 
  LazyDashboard,
  LazyProfile,
  LazyWebsitePlugins,
  LazyWebsiteThemes,
  LazyWebsiteUsers,
  LazyWebsiteSEO,
  LazyWebsiteBackup,
  LazyClientReports,
  LazyCreateReport,
  LazyLinkMonitor,
  LazySecurityScanHistory,
  PageSkeleton 
} from "@/components/lazy/lazy-components";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, Suspense } from "react";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";
import { preloadCriticalAssets, addResourceHints } from "@/lib/preload-utils";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Track page views when routes change
  useAnalytics();

  // Check if we have a token in localStorage (for immediate access during login transition)
  const hasToken = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;

  // Show loading screen while checking authentication, but only if we don't have a token
  if (isLoading && !hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a token but auth query is still loading, show authenticated routes
  // This prevents the landing page flash when refreshing authenticated pages
  const shouldShowAuthenticatedRoutes = isAuthenticated || (hasToken && isLoading);

  return (
    <Switch>
      {!shouldShowAuthenticatedRoutes ? (
        <>
          <Route path="/features" component={Features} />
          <Route path="/features/client-management" component={ClientManagement} />
          <Route path="/features/performance-monitoring" component={PerformanceMonitoring} />
          <Route path="/features/security-scanning" component={SecurityScanning} />
          <Route path="/features/automated-maintenance" component={AutomatedMaintenance} />
          <Route path="/features/advanced-analytics" component={AdvancedAnalytics} />
          <Route path="/features/one-click-actions" component={OneClickActions} />
          <Route path="/pricing" component={Pricing} />

          <Route path="/contact" component={Contact} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/subscription-preview" component={SubscriptionPreview} />
          <Route path="/" component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={() => <Suspense fallback={<PageSkeleton />}><LazyDashboard /></Suspense>} />
          <Route path="/dashboard" component={() => <Suspense fallback={<PageSkeleton />}><LazyDashboard /></Suspense>} />
          <Route path="/clients" component={Clients} />
          <Route path="/websites" component={Websites} />
          <Route path="/websites/:id" component={WebsiteDetail} />
          <Route path="/websites/:id/plugins" component={() => <Suspense fallback={<PageSkeleton />}><LazyWebsitePlugins /></Suspense>} />
          <Route path="/websites/:id/themes" component={() => <Suspense fallback={<PageSkeleton />}><LazyWebsiteThemes /></Suspense>} />
          <Route path="/websites/:id/users" component={() => <Suspense fallback={<PageSkeleton />}><LazyWebsiteUsers /></Suspense>} />

          <Route path="/websites/:id/security" component={WebsiteSecurity} />
          <Route path="/websites/:id/security-scans" component={() => <Suspense fallback={<PageSkeleton />}><LazySecurityScanHistory /></Suspense>} />
          <Route path="/websites/:id/performance" component={WebsitePerformance} />
          <Route path="/websites/:id/backup" component={() => <Suspense fallback={<PageSkeleton />}><LazyWebsiteBackup /></Suspense>} />
          <Route path="/websites/:id/seo" component={() => <Suspense fallback={<PageSkeleton />}><LazyWebsiteSEO /></Suspense>} />
          <Route path="/websites/:id/link-monitor" component={() => <Suspense fallback={<PageSkeleton />}><LazyLinkMonitor /></Suspense>} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/reports" component={() => <Suspense fallback={<PageSkeleton />}><LazyClientReports /></Suspense>} />
          <Route path="/client-reports" component={() => <Suspense fallback={<PageSkeleton />}><LazyClientReports /></Suspense>} />
          <Route path="/client-reports/create" component={() => <Suspense fallback={<PageSkeleton />}><LazyCreateReport /></Suspense>} />
          <Route path="/client-reports/:id/view" component={ViewReport} />
          <Route path="/reports/:id" component={ViewReport} />
          <Route path="/profile" component={() => <Suspense fallback={<PageSkeleton />}><LazyProfile /></Suspense>} />
          <Route path="/subscription" component={Subscription} />
        </>
      )}
      {/* SEO reports should be accessible in both authenticated and unauthenticated modes */}
      <Route path="/seo-report/:id" component={SeoReportPage} />
      <Route path="/reports/:token" component={SeoReportPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics and performance optimizations when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
    
    // Initialize performance optimizations
    preloadCriticalAssets();
    addResourceHints();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="aio-webcare-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
