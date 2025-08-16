import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UpdatesCard from "./updates-card";
import UpdateLogs from "./update-logs";
import OptimizationCard from "./optimization-card";
import { WRMDebugPanel } from "../debug/wrm-debug-panel";
import { 
  Shield, 
  Zap, 
  Database, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Server,
  HardDrive,
  Activity,
  TrendingUp,
  Eye,
  MousePointer
} from "lucide-react";
import { format } from "date-fns";

interface ComprehensiveDashboardProps {
  websiteId: number;
}

export default function ComprehensiveDashboard({ websiteId }: ComprehensiveDashboardProps) {
  // Fetch website data
  const { data: website } = useQuery({
    queryKey: [`/api/websites/${websiteId}`],
  });

  // Fetch WordPress data
  const { data: wpData, isLoading: wpDataLoading } = useQuery({
    queryKey: [`/api/websites/${websiteId}/wordpress-data`],
  });

  // Fetch health data
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: [`/api/websites/${websiteId}/wrm/health`],
  });

  // Fetch status data
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: [`/api/websites/${websiteId}/wrm/status`],
  });

  // Fetch security scan data
  const { data: securityScan, isLoading: securityLoading, error: securityError } = useQuery({
    queryKey: [`/api/websites/${websiteId}/security-scans/latest`],
    retry: false, // Don't retry on 404
  });

  // Fetch performance scan data
  const { data: performanceScan, isLoading: performanceLoading } = useQuery({
    queryKey: [`/api/websites/${websiteId}/performance-scans`],
    retry: false, // Don't retry on 404
  });

  // Get health score - only show real data, no defaults or mock data
  const healthScore = healthLoading || statusLoading ? null : 
    (health && typeof health === 'object' && 'overall_score' in health && (health as any).overall_score !== 85) ? (health as any).overall_score :
    (status && typeof status === 'object' && 'health_score' in status && (status as any).health_score !== 85) ? (status as any).health_score :
    null; // Exclude common mock values like 85%
    
  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getEmptyStateDisplay = (type: 'health' | 'uptime' | 'backup') => {
    switch (type) {
      case 'health':
        return {
          text: 'Pending',
          subtext: 'Run health check',
          icon: 'text-gray-400'
        };
      case 'uptime':
        return {
          text: 'No Data',
          subtext: 'Monitoring disabled',
          icon: 'text-gray-400'
        };
      case 'backup':
        return {
          text: 'None',
          subtext: 'No backups created',
          icon: 'text-purple-400'
        };
      default:
        return {
          text: 'N/A',
          subtext: '',
          icon: 'text-gray-400'
        };
    }
  };


  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{(website as any)?.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{(website as any)?.url}</span>
            <Badge variant={(website as any)?.connectionStatus === 'connected' ? 'default' : 'destructive'}>
              {(website as any)?.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.open((website as any)?.url, '_blank')}>
          <Globe className="h-4 w-4 mr-2" />
          Visit Site
        </Button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Health Score</p>
                {healthScore && typeof healthScore === 'number' ? (
                  <p className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
                    {healthScore}%
                  </p>
                ) : (
                  <div>
                    <p className="text-lg font-semibold text-gray-400 dark:text-gray-500">
                      {getEmptyStateDisplay('health').text}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">
                      {getEmptyStateDisplay('health').subtext}
                    </p>
                  </div>
                )}
              </div>
              <Shield className={`h-8 w-8 ${healthScore && typeof healthScore === 'number' ? getHealthColor(healthScore) : getEmptyStateDisplay('health').icon}`} />
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                <div>
                  <p className="text-lg font-semibold text-gray-400 dark:text-gray-500">
                    {getEmptyStateDisplay('uptime').text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">
                    {getEmptyStateDisplay('uptime').subtext}
                  </p>
                </div>
              </div>
              <Activity className={`h-8 w-8 ${getEmptyStateDisplay('uptime').icon}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Backup</p>
                {(website as any)?.lastBackup ? (
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {format(new Date((website as any).lastBackup), 'MMM dd')}
                  </p>
                ) : (
                  <div>
                    <p className="text-lg font-semibold text-gray-400 dark:text-gray-500">
                      {getEmptyStateDisplay('backup').text}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">
                      {getEmptyStateDisplay('backup').subtext}
                    </p>
                  </div>
                )}
              </div>
              <Database className={`h-8 w-8 ${(website as any)?.lastBackup ? 'text-purple-500' : getEmptyStateDisplay('backup').icon}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Updates and System Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Updates Section */}
          <UpdatesCard websiteId={websiteId} />

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wpDataLoading || statusLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">WordPress Version</p>
                      <p className="font-medium">{(wpData as any)?.systemInfo?.wordpress_version || (status as any)?.wordpress_version || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">PHP Version</p>
                      <p className="font-medium">{(wpData as any)?.systemInfo?.php_version || (status as any)?.php_version || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Database</p>
                      <p className="font-medium">
                        {(() => {
                          const version = (wpData as any)?.systemInfo?.mysql_version || (status as any)?.mysql_version;
                          if (version) {
                            // Extract just the major.minor version (e.g., "8.0" from "8.0.42-0ubuntu0.24.04.2")
                            const cleanVersion = version.match(/^(\d+\.\d+)/)?.[1] || version;
                            if (version.toLowerCase().includes('mariadb')) {
                              return `MariaDB ${cleanVersion}`;
                            }
                            return `MySQL ${cleanVersion}`;
                          }
                          return (wpData as any)?.systemInfo?.database_type || (status as any)?.database_type || 'N/A';
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Server</p>
                      <p className="font-medium">
                        {(() => {
                          const server = (wpData as any)?.systemInfo?.server_software || (status as any)?.server_info;
                          if (!server || server === 'Unknown') {
                            return 'N/A';
                          }
                          // Clean up server string to show just the main server name
                          if (server.toLowerCase().includes('apache')) {
                            return 'Apache';
                          } else if (server.toLowerCase().includes('nginx')) {
                            return 'Nginx';
                          } else if (server.toLowerCase().includes('litespeed')) {
                            return 'LiteSpeed';
                          }
                          return server;
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SSL Status</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={(wpData as any)?.systemInfo?.ssl_status || (wpData as any)?.systemInfo?.ssl_enabled || (status as any)?.ssl_enabled ? 'default' : 'destructive'}>
                          {(wpData as any)?.systemInfo?.ssl_status || (wpData as any)?.systemInfo?.ssl_enabled || (status as any)?.ssl_enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Backup</p>
                      <p className="font-medium">
                        {(website as any)?.lastBackup ? format(new Date((website as any).lastBackup), 'MMM dd, yyyy') : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Optimization Section */}
          <OptimizationCard websiteId={websiteId} />

          {/* Update Logs */}
          <UpdateLogs websiteId={websiteId} />

          {/* WRM Debug Panel */}
          <WRMDebugPanel websiteId={websiteId} />
        </div>

        {/* Right Column - Quick Actions and Status */}
        <div className="space-y-6">
          {/* Security Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              {securityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : securityScan && !securityError ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security Score</span>
                    <Badge variant={(securityScan as any).overallSecurityScore >= 80 ? 'default' : 'destructive'}>
                      {(securityScan as any).overallSecurityScore || 0}/100
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${(securityScan as any).overallSecurityScore >= 80 ? 'bg-green-500' : (securityScan as any).overallSecurityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${(securityScan as any).overallSecurityScore || 0}%` }}
                    ></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {(securityScan as any).sslEnabled ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span>SSL Certificate {(securityScan as any).sslEnabled ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(securityScan as any).threatsDetected === 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span>{(securityScan as any).threatsDetected || 0} Threats Detected</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    View Security Details
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Security Scan Data
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Run a security scan to view your website's security status
                  </p>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Run Security Scan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : performanceScan && Array.isArray(performanceScan) && performanceScan.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{performanceScan[0].pagespeedScore || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Performance Score</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>PageSpeed Score</span>
                      <span className="font-medium">{performanceScan[0].pagespeedScore || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Core Web Vitals</span>
                      <Badge variant={performanceScan[0].coreWebVitalsGrade === 'good' ? 'default' : 'secondary'}>
                        {performanceScan[0].coreWebVitalsGrade || 'Not Available'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>YSlow Score</span>
                      <span className="font-medium">{performanceScan[0].yslowScore || 'N/A'}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    View Performance Details
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Performance Data
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Run a performance scan to analyze your website's speed
                  </p>
                  <Button variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    Run Performance Test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Backup Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(website as any)?.lastBackup ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Backup</span>
                      <Badge variant="default">Success</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date((website as any).lastBackup), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        <span>Size: {(website as any)?.backupSize || 'Unknown'}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Database className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No backups yet
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Create your first backup to protect your website data
                    </p>
                  </div>
                )}
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}