import { useParams } from "wouter";
import type { Website, BackupConfiguration, BackupHistory } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { isValidWebsiteId, InvalidWebsiteIdPage } from "@/lib/website-validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Download, 
  RefreshCw, 
  Calendar,
  Clock,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Database,
  FileText,
  Settings,
  RotateCcw,
  Cloud,
  Shield,
  Info,
  ExternalLink,
  Zap,
  Wrench
} from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import { useToast } from '@/hooks/use-toast';
import { apiCall, queryClient } from '@/lib/queryClient';
import { useState } from "react";

export default function WebsiteBackupPage() {
  const { id: websiteId } = useParams();
  const { toast } = useToast();

  // Validate website ID
  if (!isValidWebsiteId(websiteId)) {
    return <InvalidWebsiteIdPage websiteId={websiteId} />;
  }
  const [showRestoreOptions, setShowRestoreOptions] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<number | null>(null);
  const [manualTriggerInstructions, setManualTriggerInstructions] = useState<{
    show: boolean;
    instructions?: any;
    dashboardUrl?: string;
    backupType?: string;
  }>({ show: false });

  // Get website data
  const { data: website, isLoading: websiteLoading } = useQuery<Website>({
    queryKey: ['/api/websites', websiteId],
    enabled: !!websiteId,
  });

  // Get backup configuration
  const { data: backupConfig, isLoading: configLoading } = useQuery<BackupConfiguration>({
    queryKey: ['/api/websites', websiteId, 'backup-config'],
    enabled: !!websiteId,
  });

  // Get backup history
  const { data: backupHistory, isLoading: historyLoading } = useQuery<BackupHistory[]>({
    queryKey: ['/api/websites', websiteId, 'backup-history'],
    enabled: !!websiteId,
  });

  // Get backup stats
  const { data: backupStats } = useQuery({
    queryKey: ['/api/backup-stats'],
  });

  const createBackup = useMutation({
    mutationFn: async (backupType: string = 'full') => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      return apiCall(`/api/websites/${websiteId}/backup/trigger`, {
        method: 'POST',
        body: JSON.stringify({ backupType }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    },
    onSuccess: (data) => {
      if (data.requiresManualTrigger) {
        // Show manual trigger instructions
        toast({
          title: "Manual Trigger Required",
          description: "Please go to WordPress admin to complete the backup trigger. Instructions below.",
          variant: "destructive",
          duration: 8000,
        });
        
        // Store the instructions to show in UI
        setManualTriggerInstructions({
          show: true,
          instructions: data.instructions,
          dashboardUrl: data.dashboardUrl,
          backupType: data.data?.backupType
        });
      } else {
        toast({
          title: "Backup Created Successfully", 
          description: data.message || "UpdraftPlus backup has been initiated.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'backup-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'backup-config'] });
    },
    onError: (error: any) => {
      toast({
        title: "Backup Creation Failed",
        description: error.message || "Unable to create backup. Please check configuration.",
        variant: "destructive",
      });
    },
  });

  const restoreBackup = useMutation({
    mutationFn: async (backupId: number) => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      return apiCall(`/api/websites/${websiteId}/backup/restore`, {
        method: 'POST',
        body: JSON.stringify({ backupId }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Restore Initiated",
        description: "Restore process started. Monitor in WordPress admin for completion.",
      });
      setShowRestoreOptions(false);
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'backup-history'] });
    },
    onError: () => {
      toast({
        title: "Restore Failed",
        description: "Unable to restore backup. Check backup integrity and try again.",
        variant: "destructive",
      });
    },
  });

  const setupUpdraftPlus = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      return apiCall(`/api/websites/${websiteId}/backup/setup-updraft`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    },
    onSuccess: (data) => {
      if (data.data?.requiresManualInstall) {
        toast({
          title: "Manual Installation Required",
          description: "UpdraftPlus couldn't be installed automatically. Please install it manually from your WordPress admin.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Setup Completed Successfully!",
          description: `UpdraftPlus is now configured with ${data?.data?.setup?.version || 'latest version'}. You can now create backups.`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'backup-config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'backup-history'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.details || error?.message || "Unknown error occurred";
      toast({
        title: "Setup Failed",
        description: `Unable to setup UpdraftPlus: ${errorMessage}. Please check WordPress admin access.`,
        variant: "destructive",
      });
    },
  });

  if (websiteLoading) {
    return <div>Loading...</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300';
    }
  };

  const isUpdraftSetup = backupConfig?.pluginInstalled && backupConfig?.configurationStatus === 'configured';
  const requiresManualInstall = backupConfig?.configurationStatus === 'manual_install';

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Backup Management</h1>
          <p className="text-muted-foreground">
            {website?.name} - Free WordPress backups with UpdraftPlus & Google Drive
          </p>
        </div>

        {/* Manual Installation Required Notice */}
        {requiresManualInstall && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
                <AlertTriangle className="h-5 w-5" />
                Manual Installation Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 dark:text-orange-400 mb-4">
                UpdraftPlus couldn't be installed automatically. Please install it manually:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-orange-700 dark:text-orange-400 mb-4">
                <li>Go to your WordPress admin dashboard</li>
                <li>Navigate to Plugins → Add New</li>
                <li>Search for "UpdraftPlus"</li>
                <li>Install and activate the plugin</li>
                <li>Return here to configure backup settings</li>
              </ol>
              <div className="flex gap-3">
                <Button variant="outline" asChild className="border-orange-300 text-orange-800 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300">
                  <a 
                    href={`${website?.url}/wp-admin/plugin-install.php?s=updraftplus&tab=search&type=term`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Install UpdraftPlus
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Backup Trigger Instructions */}
        {manualTriggerInstructions.show && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Info className="h-5 w-5" />
                Manual Backup Trigger Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700 dark:text-amber-400 mb-4">
                To complete your {manualTriggerInstructions.backupType} backup, please follow these steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-amber-700 dark:text-amber-400 mb-4">
                {manualTriggerInstructions.instructions && Object.values(manualTriggerInstructions.instructions).map((step: any, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              <div className="flex gap-3">
                <Button variant="outline" asChild className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300">
                  <a 
                    href={manualTriggerInstructions.dashboardUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open WordPress Admin
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setManualTriggerInstructions({ show: false })}
                  className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
                >
                  Dismiss
                </Button>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  After completing the backup in WordPress, the status will automatically update here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* UpdraftPlus Setup Guide */}
        {!isUpdraftSetup && !requiresManualInstall && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <Settings className="h-5 w-5" />
                UpdraftPlus Setup Required
              </CardTitle>
              <div className="text-blue-600 dark:text-blue-400">
                Set up free WordPress backups using UpdraftPlus plugin with Google Drive storage (15GB free)
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Manual Setup Steps:
                  </h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside text-blue-700 dark:text-blue-300">
                    <li>Install UpdraftPlus plugin from WordPress admin</li>
                    <li>Go to Settings → UpdraftPlus Backups</li>
                    <li>Choose Google Drive as remote storage</li>
                    <li>Connect your Google Drive account</li>
                    <li>Set backup schedule (Daily recommended)</li>
                    <li>Run your first backup</li>
                  </ol>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Benefits:
                  </h4>
                  <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• 15GB free Google Drive storage</li>
                    <li>• Automated daily backups</li>
                    <li>• One-click restore functionality</li>
                    <li>• No server storage required</li>
                    <li>• Email notifications</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-blue-200 dark:border-blue-800">
                <Button
                  onClick={() => setupUpdraftPlus.mutate()}
                  disabled={setupUpdraftPlus.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {setupUpdraftPlus.isPending ? "Setting up..." : "Auto-Setup UpdraftPlus"}
                </Button>
                <Button variant="outline" asChild>
                  <a 
                    href={`${website?.url}/wp-admin/admin.php?page=updraftplus`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    WordPress Admin
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Backup Configuration Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Backup Configuration
            </CardTitle>
            {isUpdraftSetup && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`${website?.url}/wp-admin/admin.php?page=updraftplus`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Configure
                </a>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {/* Configuration Success Message */}
            {isUpdraftSetup && backupConfig?.configurationStatus === 'configured' && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-300 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold text-lg">UpdraftPlus Configuration Detected!</span>
                </div>
                <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
                  <p>✓ Plugin version {backupConfig?.pluginVersion} is installed and active</p>
                  <p>✓ Backup system is ready to use</p>
                  <p>✓ You can now create backups and configure schedules</p>
                </div>
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Ready to create your first backup? Use the "Create Backup Now" button below!
                  </p>
                </div>
              </div>
            )}

            {/* Manual Installation Required Message */}
            {requiresManualInstall && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-950/20 dark:border-orange-800">
                <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Manual Installation Required</span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                  Please install UpdraftPlus manually from your WordPress admin to enable backup functionality.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Status</p>
                <Badge 
                  variant={isUpdraftSetup ? "default" : requiresManualInstall ? "destructive" : "secondary"} 
                  className="flex items-center gap-1"
                >
                  {isUpdraftSetup ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </>
                  ) : requiresManualInstall ? (
                    <>
                      <AlertTriangle className="h-3 w-3" />
                      Manual Install Required
                    </>
                  ) : (
                    "Not Setup"
                  )}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Storage</p>
                <div className="flex items-center gap-1">
                  <Cloud className="h-3 w-3" />
                  <p className="text-sm text-muted-foreground">
                    {backupConfig?.storageProvider === 'googledrive' ? 'Google Drive' : backupConfig?.storageProvider || "Google Drive"}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Schedule</p>
                <p className="text-sm text-muted-foreground">
                  {backupConfig?.backupFrequency === 'daily' ? 'Daily' : backupConfig?.backupFrequency || "Daily"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Retention</p>
                <p className="text-sm text-muted-foreground">
                  {backupConfig?.retentionDays || 30} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Create Backups Guide */}
        {isUpdraftSetup && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <Info className="h-5 w-5" />
                How to Create Backups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-green-700 dark:text-green-400">
                <p className="font-medium mb-2">Now that UpdraftPlus is configured, you can create backups in 3 ways:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-green-800 dark:text-green-300">1.</span>
                    <div>
                      <span className="font-medium">One-Click Backup:</span> Use the buttons below to instantly create backups
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-green-800 dark:text-green-300">2.</span>
                    <div>
                      <span className="font-medium">Automatic Backups:</span> Set up daily/weekly schedules in WordPress
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-green-800 dark:text-green-300">3.</span>
                    <div>
                      <span className="font-medium">Manual in WordPress:</span> Go to WordPress admin → UpdraftPlus
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {isUpdraftSetup && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Create Backup Now
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose what type of backup to create. Full backup is recommended for complete protection.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => createBackup.mutate('full')}
                  disabled={createBackup.isPending}
                  className="flex items-center gap-2"
                  data-testid="button-full-backup"
                >
                  <Database className="h-4 w-4" />
                  {createBackup.isPending ? "Creating..." : "Create Full Backup Now"}
                </Button>
                <Button 
                  onClick={() => createBackup.mutate('database')}
                  disabled={createBackup.isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                  data-testid="button-database-backup"
                >
                  <Database className="h-4 w-4" />
                  {createBackup.isPending ? "Creating..." : "Database Only"}
                </Button>
                <Button 
                  onClick={() => createBackup.mutate('files')}
                  disabled={createBackup.isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                  data-testid="button-files-backup"
                >
                  <FileText className="h-4 w-4" />
                  {createBackup.isPending ? "Creating..." : "Files Only"}
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  className="flex items-center gap-2"
                  data-testid="button-schedule-backup"
                >
                  <a 
                    href={`${website?.url}/wp-admin/admin.php?page=updraftplus&tab=settings`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Calendar className="h-4 w-4" />
                    Setup Schedule
                  </a>
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  className="flex items-center gap-2"
                  data-testid="button-storage-settings"
                >
                  <a 
                    href={`${website?.url}/wp-admin/admin.php?page=updraftplus&tab=settings#upload`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Cloud className="h-4 w-4" />
                    Storage Settings
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a 
                    href={`${website?.url}/wp-admin/admin.php?page=updraftplus`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                    data-testid="link-wordpress-admin"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Manage in WordPress
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Backup Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold" data-testid="stat-total-backups">
                    0
                  </p>
                  <p className="text-sm text-muted-foreground">Total Backups</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold" data-testid="stat-successful-backups">
                    0
                  </p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold" data-testid="stat-total-storage">
                    0 GB
                  </p>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold" data-testid="stat-last-backup">
                    {backupHistory?.[0]?.createdAt 
                      ? formatDate(backupHistory[0].createdAt.toString()).split(',')[0]
                      : "Never"}
                  </p>
                  <p className="text-sm text-muted-foreground">Last Backup</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Backup History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <p>Loading backup history...</p>
            ) : !backupHistory?.length ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No backups found</p>
                <p className="text-sm text-muted-foreground">
                  {isUpdraftSetup ? "Create your first backup above" : "Setup UpdraftPlus to start creating backups"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {backupHistory.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`backup-item-${backup.id}`}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {backup.backupStatus === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : backup.backupStatus === 'failed' ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                        )}
                        <div>
                          <p className="font-medium">{backup.backupType} Backup</p>
                          <p className="text-sm text-muted-foreground">
                            {backup.createdAt ? formatDate(backup.createdAt.toString()) : 'Unknown date'} • {backup.backupSize ? `${(backup.backupSize / (1024 * 1024)).toFixed(1)} MB` : 'Unknown size'}
                          </p>
                          {backup.errorMessage && (
                            <p className="text-sm text-red-600">{backup.errorMessage}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(backup.backupStatus || 'unknown')}>
                        {backup.backupStatus ? backup.backupStatus.charAt(0).toUpperCase() + backup.backupStatus.slice(1) : 'Unknown'}
                      </Badge>
                      {backup.backupStatus === 'completed' && (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBackupId(backup.id);
                              setShowRestoreOptions(true);
                            }}
                            data-testid={`restore-backup-${backup.id}`}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restore Confirmation Dialog */}
        <Dialog open={showRestoreOptions} onOpenChange={setShowRestoreOptions}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Confirm Backup Restore
              </DialogTitle>
              <DialogDescription>
                This action will restore your website from the selected backup. 
                All current data will be overwritten and cannot be recovered.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <p className="font-medium">Warning:</p>
                    <p>This will overwrite your current website completely. Consider creating a backup of your current state first.</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={() => selectedBackupId && restoreBackup.mutate(selectedBackupId)}
                  disabled={restoreBackup.isPending}
                  className="flex items-center gap-2"
                  data-testid="button-confirm-restore"
                >
                  <RotateCcw className="h-4 w-4" />
                  {restoreBackup.isPending ? "Restoring..." : "Restore Backup"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRestoreOptions(false)}
                  data-testid="button-cancel-restore"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}