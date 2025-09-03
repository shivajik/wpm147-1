import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { 
  RefreshCw, 
  Download, 
  Shield, 
  Zap, 
  Database,
  Search,
  FileText,
  Settings,
  ExternalLink,
  Gauge,
  Lock,
  Monitor,
  Users,
  LayoutDashboard,
  Palette,
  Plug,
  Activity,
  BarChart3,
  LinkIcon,
  Clock,
  TrendingUp,
  Award,
  Wrench,
  MessageSquare,
  Crown,
  Star
} from "lucide-react";
import { Link, useLocation } from "wouter";
import EditWebsiteDialog from "@/components/websites/edit-website-dialog";
import BrandingManagement from "@/components/websites/branding-management";

interface UserSubscription {
  subscriptionPlan: string;
  subscriptionStatus: string;
}

interface QuickActionsProps {
  websiteId: number;
  websiteName: string;
  websiteUrl: string;
}

export function QuickActions({ websiteId, websiteName, websiteUrl }: QuickActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPerformingAction, setIsPerformingAction] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBrandingDialog, setShowBrandingDialog] = useState(false);
  const [, setLocation] = useLocation();

  // Check user subscription status
  const { data: subscription } = useQuery<UserSubscription>({
    queryKey: ['/api/user/subscription'],
  });

  // Get website data for the branding dialog
  const { data: website } = useQuery({
    queryKey: [`/api/websites/${websiteId}`],
    enabled: !!websiteId,
  });

  const isPaidUser = subscription?.subscriptionPlan && subscription.subscriptionPlan !== 'free';

  const performActionMutation = useMutation({
    mutationFn: async ({ action, endpoint }: { action: string; endpoint: string }) => {
      setIsPerformingAction(action);
      const response = await apiCall(endpoint, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Action Completed",
        description: `${variables.action} completed successfully`,
      });
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId] });
    },
    onError: (error: any, variables) => {
      toast({
        title: "Action Failed",
        description: error.message || `Failed to ${variables.action.toLowerCase()}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsPerformingAction(null);
    },
  });

  const handleAction = (action: string, endpoint: string) => {
    performActionMutation.mutate({ action, endpoint });
  };

  const handleWhiteLabelClick = () => {
    if (isPaidUser) {
      // For paid users, show branding dialog for this website
      setShowBrandingDialog(true);
    } else {
      // For free users, show upgrade modal
      setShowUpgradeModal(true);
    }
  };

  const isLoading = performActionMutation.isPending;

  const quickActions = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Website overview',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50 hover:bg-slate-100',
      href: `/websites/${websiteId}`,
      isAction: false,
    },

    {
      id: 'backup',
      label: 'Backups',
      icon: Download,
      description: 'Backup management',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      href: `/websites/${websiteId}/backup`,
      isAction: false,
    },
    {
      id: 'plugins',
      label: 'Plugins',
      icon: Plug,
      description: 'Manage plugins',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      href: `/websites/${websiteId}/plugins`,
      isAction: false,
    },
    {
      id: 'themes',
      label: 'Themes',
      icon: Palette,
      description: 'Theme management',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      href: `/websites/${websiteId}/themes`,
      isAction: false,
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'User management',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
      href: `/websites/${websiteId}/users`,
      isAction: false,
    },
    {
      id: 'comments',
      label: 'Comments',
      icon: MessageSquare,
      description: 'Manage comments',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      href: `/websites/${websiteId}/comments`,
      isAction: false,
    },

    {
      id: 'link-monitor',
      label: 'Link Monitor',
      icon: LinkIcon,
      description: 'Monitor broken links',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 hover:bg-teal-100',
      href: `/websites/${websiteId}/link-monitor`,
      isAction: false,
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      description: 'Security scanning',
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
      href: `/websites/${websiteId}/security`,
      isAction: false,
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: Gauge,
      description: 'Speed optimization',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      href: `/websites/${websiteId}/performance`,
      isAction: false,
    },
    {
      id: 'uptime-monitor',
      label: 'Uptime Monitor',
      icon: Activity,
      description: 'Monitor uptime',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
      isComingSoon: true,
      isAction: false,
    },
    {
      id: 'seo-ranking',
      label: 'SEO Ranking',
      icon: TrendingUp,
      description: 'SEO analysis',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
      href: `/websites/${websiteId}/seo`,
      isAction: false,
    },
    {
      id: 'maintenance-report',
      label: 'Maintenance Report',
      icon: Wrench,
      description: 'Maintenance reports',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      href: `/websites/${websiteId}/maintenance-reports`,
      isAction: false,
    },
    {
      id: 'white-label',
      label: 'White Label',
      icon: Award,
      description: 'Branding settings',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 hover:bg-amber-100',
      onClick: handleWhiteLabelClick,
      isAction: true,
    },
  ];

  return (
    <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-yellow-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Website Info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">{websiteName}</h4>
              <p className="text-xs text-muted-foreground truncate">{websiteUrl}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(websiteUrl, '_blank')}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2">
          {Array.isArray(quickActions) && quickActions.map((action) => {
            const Icon = action.icon;
            const isCurrentAction = isPerformingAction === action.label;
            
            if (!action.isAction && action.href) {
              // Navigation link
              return (
                <Button
                  key={action.id}
                  variant="ghost"
                  className={`justify-start h-auto p-3 ${action.bgColor} border border-transparent hover:border-slate-200 dark:hover:border-slate-700`}
                  asChild
                >
                  <Link href={action.href}>
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-2 rounded-lg bg-white dark:bg-slate-700 ${action.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{action.label}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              );
            }

            if (!action.isAction && action.isComingSoon) {
              // Coming soon item
              return (
                <Button
                  key={action.id}
                  variant="ghost"
                  className={`justify-start h-auto p-3 ${action.bgColor} border border-transparent opacity-75 cursor-not-allowed`}
                  disabled
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`p-2 rounded-lg bg-white dark:bg-slate-700 ${action.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                      Coming Soon
                    </Badge>
                  </div>
                </Button>
              );
            }
            
            // Action button
            return (
              <Button
                key={action.id}
                variant="ghost"
                className={`justify-start h-auto p-3 ${action.bgColor} border border-transparent hover:border-slate-200 dark:hover:border-slate-700`}
                onClick={action.onClick}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-lg bg-white dark:bg-slate-700 ${action.color}`}>
                    <Icon className={`h-4 w-4 ${isCurrentAction ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                  {isCurrentAction && (
                    <Badge variant="secondary" className="text-xs">
                      Running...
                    </Badge>
                  )}
                </div>
              </Button>
            );
          })}
        </div>



        {/* Status Indicator */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>WordPress connection active</span>
          </div>
        </div>
      </CardContent>

      {/* Upgrade Modal for Free Users */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription>
              White-label branding is a premium feature available with paid plans.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Premium Features Include:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>✓ Custom brand logo and colors</li>
                <li>✓ Personalized footer text</li>
                <li>✓ White-label client reports</li>
                <li>✓ Remove AIO Webcare branding</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Maybe Later
            </Button>
            <Button 
              onClick={() => {
                setShowUpgradeModal(false);
                setLocation('/subscription');
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Star className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Branding Management Dialog */}
      <Dialog open={showBrandingDialog} onOpenChange={setShowBrandingDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              White-Label Branding - {websiteName}
            </DialogTitle>
            <DialogDescription>
              Customize your reports with your own branding for this website.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <BrandingManagement websiteId={websiteId} />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBrandingDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
}