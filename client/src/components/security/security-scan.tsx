import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Globe,
  FileWarning,
  Bug,
  Search,
  RefreshCw,
  Timer,
  Activity,
  Database,
  Info,
  ExternalLink
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/lib/queryClient';
import { format } from 'date-fns';

interface SecurityScanProps {
  websiteId: number;
}

interface SecurityScanResult {
  ssl_enabled: boolean;
  file_permissions_secure: boolean;
  admin_user_secure: boolean;
  wp_version_hidden: boolean;
  login_attempts_limited: boolean;
  security_plugins_active: string[];
  malware_scan: {
    status: 'clean' | 'infected' | 'warning';
    last_scan: string;
    infected_files: string[];
    threats_detected: number;
    scan_duration: string;
  };
  blacklist_check: {
    status: 'clean' | 'flagged';
    services_checked: string[];
    flagged_by: string[];
    last_check: string;
  };
  vulnerability_scan: {
    core_vulnerabilities: number;
    plugin_vulnerabilities: number;
    theme_vulnerabilities: number;
    outdated_software: string[];
    security_score: number;
  };
  security_headers: {
    x_frame_options: boolean;
    x_content_type_options: boolean;
    x_xss_protection: boolean;
    strict_transport_security: boolean;
    content_security_policy: boolean;
  };
  file_integrity: {
    core_files_modified: number;
    suspicious_files: string[];
    file_permissions_issues: string[];
    last_integrity_check: string;
  };
}

export function SecurityScan({ websiteId }: SecurityScanProps) {
  const [selectedScanType, setSelectedScanType] = useState('comprehensive');
  const queryClient = useQueryClient();

  // Fetch latest security scan results
  const { data: latestSecurityScan, isLoading: isLoadingSecurity, error: securityError } = useQuery<any>({
    queryKey: [`/api/websites/${websiteId}/security-scans/latest`],
    enabled: !!websiteId,
    retry: false, // Don't retry on 404 for missing scans
  });

  // Debug the actual data structure
  console.log('=== SECURITY SCAN DEBUG ===');
  console.log('latestSecurityScan:', latestSecurityScan);
  console.log('isLoadingSecurity:', isLoadingSecurity);
  console.log('securityError:', securityError);
  console.log('==========================');



  // Run security scan mutation
  const runSecurityScanMutation = useMutation({
    mutationFn: async () => {
      return await apiCall(`/api/websites/${websiteId}/security-scan`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/security-scans/latest`] });
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/security-scans`] });
    },
    onError: (error) => {
      console.error('Security scan failed:', error);
    },
  });

  const handleRunScan = () => {
    runSecurityScanMutation.mutate();
  };

  const getSecurityScore = () => {
    if (!latestSecurityScan) return 0;
    return latestSecurityScan.overallSecurityScore || 0;
  };

  const getTotalThreats = () => {
    if (!latestSecurityScan) return 0;
    return (latestSecurityScan.threatsDetected || 0) +
           (latestSecurityScan.coreVulnerabilities || 0) +
           (latestSecurityScan.pluginVulnerabilities || 0) +
           (latestSecurityScan.themeVulnerabilities || 0);
  };

  const getOverallStatus = () => {
    if (!latestSecurityScan) return 'unknown';
    const score = getSecurityScore();
    const threats = getTotalThreats();
    
    if (threats > 0 || score < 50) return 'critical';
    if (score < 70) return 'warning';
    return 'clean';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      );
    }
    
    switch (status) {
      case 'clean':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'infected':
      case 'flagged':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: boolean | string, trueText = 'Secure', falseText = 'At Risk') => {
    if (typeof status === 'boolean') {
      return (
        <Badge variant={status ? 'default' : 'destructive'}>
          {status ? trueText : falseText}
        </Badge>
      );
    }
    
    switch (status) {
      case 'clean':
        return <Badge variant="default">Clean</Badge>;
      case 'infected':
        return <Badge variant="destructive">Infected</Badge>;
      case 'flagged':
        return <Badge variant="destructive">Flagged</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Check if there's no scan data available (404 or empty response)
  const hasNoScanData = !isLoadingSecurity && (!latestSecurityScan || securityError);
  const hasScanError = securityError && (securityError.message?.includes('404') || securityError.message?.includes('No security scans found'));

  if (isLoadingSecurity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scan Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Comprehensive Security Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Malware detection, vulnerability assessment, security configuration review
              </p>
            </div>
            <Button 
              onClick={handleRunScan}
              disabled={runSecurityScanMutation.isPending}
              className="flex items-center space-x-2"
            >
              {runSecurityScanMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Run Security Scan</span>
                </>
              )}
            </Button>
          </div>

          {runSecurityScanMutation.isPending && (
            <Alert>
              <Timer className="h-4 w-4" />
              <AlertDescription>
                Running comprehensive security analysis including malware detection, vulnerability assessment, and security configuration review.
              </AlertDescription>
            </Alert>
          )}

          {runSecurityScanMutation.isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Security scan failed: {runSecurityScanMutation.error?.message || 'Unknown error occurred'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Empty State - No Scans */}
      {(hasNoScanData || hasScanError) && !runSecurityScanMutation.isPending && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Security Scans Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click 'Run Security Scan' to get started with your website security analysis.
            </p>
            <Button onClick={handleRunScan} disabled={runSecurityScanMutation.isPending}>
              <Shield className="w-4 h-4 mr-2" />
              Run Your First Security Scan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security Results */}
      {latestSecurityScan && !runSecurityScanMutation.isPending && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="malware">Malware & Threats</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="ssl">SSL/TLS</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Security Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className={`text-3xl font-bold ${getScoreColor(getSecurityScore())}`}>
                      {getSecurityScore()}
                    </span>
                    <Badge variant={getScoreBadgeVariant(getSecurityScore())}>
                      {getSecurityScore() >= 90 ? 'Excellent' : getSecurityScore() >= 70 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                  <Progress value={getSecurityScore()} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {getTotalThreats()}
                    </span>
                    {getStatusBadge(getOverallStatus(), 'Secure', 'Issues Found')}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Malware: {latestSecurityScan.threatsDetected || 0} | 
                    Vulnerabilities: {(latestSecurityScan.coreVulnerabilities || 0) + 
                                    (latestSecurityScan.pluginVulnerabilities || 0) + 
                                    (latestSecurityScan.themeVulnerabilities || 0)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {(latestSecurityScan.coreVulnerabilities || 0) + 
                       (latestSecurityScan.pluginVulnerabilities || 0) + 
                       (latestSecurityScan.themeVulnerabilities || 0)}
                    </span>
                    {getStatusBadge(
                      ((latestSecurityScan.coreVulnerabilities || 0) + 
                       (latestSecurityScan.pluginVulnerabilities || 0) + 
                       (latestSecurityScan.themeVulnerabilities || 0)) === 0,
                      'Secure', 'Found'
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <p>Core: {latestSecurityScan.coreVulnerabilities || 0}</p>
                    <p>Plugins: {latestSecurityScan.pluginVulnerabilities || 0}</p>
                    <p>Themes: {latestSecurityScan.themeVulnerabilities || 0}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Issues & Recommendations */}
            {getSecurityScore() < 100 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span>Security Issues Found</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The following issues are affecting your security score:
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Malware Issues */}
                  {latestSecurityScan.malwareStatus === 'infected' && (
                    <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-100">Critical: Malware Detected</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {latestSecurityScan.threatsDetected} threats found. Immediate cleanup required.
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Impact: -30 points</p>
                      </div>
                    </div>
                  )}

                  {latestSecurityScan.malwareStatus === 'suspicious' && (
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Warning: Suspicious Activity</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Potentially suspicious content detected. Review recommended.
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Impact: -15 points</p>
                      </div>
                    </div>
                  )}

                  {/* Blacklist Issues */}
                  {latestSecurityScan.blacklistStatus === 'blacklisted' && (
                    <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-100">Critical: Site Blacklisted</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Your site appears on security blacklists. Contact hosting provider.
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Impact: -25 points</p>
                      </div>
                    </div>
                  )}

                  {/* Vulnerability Issues */}
                  {((latestSecurityScan.coreVulnerabilities || 0) + (latestSecurityScan.pluginVulnerabilities || 0) + (latestSecurityScan.themeVulnerabilities || 0)) > 0 && (
                    <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900 dark:text-orange-100">Vulnerabilities Found</h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          {(latestSecurityScan.coreVulnerabilities || 0) + (latestSecurityScan.pluginVulnerabilities || 0) + (latestSecurityScan.themeVulnerabilities || 0)} known vulnerabilities. Update WordPress core, plugins, and themes.
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          Impact: -{Math.min(((latestSecurityScan.coreVulnerabilities || 0) + (latestSecurityScan.pluginVulnerabilities || 0) + (latestSecurityScan.themeVulnerabilities || 0)) * 2, 25)} points
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SSL Issues */}
                  {!latestSecurityScan.sslEnabled && (
                    <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-100">No SSL Certificate</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Your site doesn't use HTTPS encryption. Install SSL certificate.
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Impact: -8 points</p>
                      </div>
                    </div>
                  )}

                  {/* Basic Security Issues */}
                  {!latestSecurityScan.wpVersionHidden && (
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <Info className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">WordPress Version Exposed</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Hide WordPress version to reduce attack surface.
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Impact: -2 points</p>
                      </div>
                    </div>
                  )}

                  {!latestSecurityScan.loginAttemptsLimited && (
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <Info className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">No Login Protection</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Install a security plugin to limit login attempts.
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Impact: -1 point</p>
                      </div>
                    </div>
                  )}

                  {!latestSecurityScan.filePermissionsSecure && (
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <Info className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">File Permission Issues</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Review file permissions and secure sensitive files.
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Impact: -2 points</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(latestSecurityScan.sslEnabled)}
                      <span className="font-medium">SSL Certificate</span>
                    </div>
                    {getStatusBadge(latestSecurityScan.sslEnabled, 'Valid', 'Invalid')}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(latestSecurityScan.filePermissionsSecure)}
                      <span className="font-medium">File Permissions</span>
                    </div>
                    {getStatusBadge(latestSecurityScan.filePermissionsSecure)}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(latestSecurityScan.loginAttemptsLimited)}
                      <span className="font-medium">Login Protection</span>
                    </div>
                    {getStatusBadge(latestSecurityScan.loginAttemptsLimited, 'Protected', 'Vulnerable')}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(latestSecurityScan.wpVersionHidden)}
                      <span className="font-medium">Version Hidden</span>
                    </div>
                    {getStatusBadge(latestSecurityScan.wpVersionHidden, 'Hidden', 'Exposed')}
                  </div>
                </div>
                
                {latestSecurityScan.securityPluginsActive && latestSecurityScan.securityPluginsActive.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Active Security Plugins</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(latestSecurityScan.securityPluginsActive) && latestSecurityScan.securityPluginsActive.map((plugin: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {plugin}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="malware" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bug className="w-5 h-5" />
                  <span>Malware & Threat Detection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(latestSecurityScan.malwareStatus)}
                    <div>
                      <h4 className="font-medium">Malware Scan</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {latestSecurityScan.threatsDetected || 0} threats detected
                      </p>
                      <p className="text-xs text-gray-500">
                        Scan duration: {latestSecurityScan.scanDuration || 0} seconds
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(latestSecurityScan.malwareStatus)}
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(latestSecurityScan.blacklistStatus)}
                    <div>
                      <h4 className="font-medium">Blacklist Check</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Checked against {latestSecurityScan.servicesChecked?.length || 0} services
                      </p>
                      <p className="text-xs text-gray-500">
                        Last check: {latestSecurityScan.scanCompletedAt ? 
                          format(new Date(latestSecurityScan.scanCompletedAt), 'MMM dd, HH:mm') : 'Never'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(latestSecurityScan.blacklistStatus)}
                </div>

                {latestSecurityScan.servicesChecked && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Services Checked</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(latestSecurityScan.servicesChecked) && latestSecurityScan.servicesChecked.map((service: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vulnerabilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Vulnerability Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {latestSecurityScan.coreVulnerabilities || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Core Vulnerabilities</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {latestSecurityScan.pluginVulnerabilities || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Plugin Vulnerabilities</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {latestSecurityScan.themeVulnerabilities || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Theme Vulnerabilities</p>
                  </div>
                </div>

                {latestSecurityScan.outdatedSoftware && 
                 latestSecurityScan.outdatedSoftware.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Pending Updates ({latestSecurityScan.outdatedSoftware.length})</h4>
                    <div className="space-y-2">
                      {Array.isArray(latestSecurityScan.outdatedSoftware) && latestSecurityScan.outdatedSoftware.map((software: any, index: number) => (
                        <div key={index} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <div>
                                <span className="text-sm font-medium">
                                  {typeof software === 'string' ? software : software.name || 'Unknown Software'}
                                </span>
                                {software.currentVersion && software.latestVersion && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {software.currentVersion} → {software.latestVersion}
                                  </p>
                                )}
                              </div>
                            </div>
                            {software.severity && (
                              <Badge variant={
                                software.severity === 'high' ? 'destructive' : 
                                software.severity === 'medium' ? 'secondary' : 
                                'outline'
                              }>
                                {software.severity}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Security Headers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">X-Frame-Options</span>
                    {getStatusIcon(latestSecurityScan.securityHeaders?.['x-frame-options'])}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">X-Content-Type-Options</span>
                    {getStatusIcon(latestSecurityScan.securityHeaders?.['x-content-type-options'])}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">X-XSS-Protection</span>
                    {getStatusIcon(latestSecurityScan.securityHeaders?.['x-xss-protection'])}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Strict-Transport-Security</span>
                    {getStatusIcon(latestSecurityScan.securityHeaders?.['strict-transport-security'])}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Content-Security-Policy</span>
                    {getStatusIcon(latestSecurityScan.securityHeaders?.['content-security-policy'])}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileWarning className="w-5 h-5" />
                    <span>File Integrity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Core Files Modified</span>
                    <span className="text-sm font-medium">
                      {latestSecurityScan.coreFilesModified || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Suspicious Files</span>
                    <span className="text-sm font-medium">
                      {latestSecurityScan.suspiciousFiles?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Permission Issues</span>
                    <span className="text-sm font-medium">
                      {latestSecurityScan.filePermissionIssues?.length || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Last check: {(() => {
                      if (!latestSecurityScan.scanCompletedAt) return 'Never';
                      try {
                        const date = new Date(latestSecurityScan.scanCompletedAt);
                        if (isNaN(date.getTime())) return 'Invalid Date';
                        return format(date, 'MMM dd, HH:mm');
                      } catch {
                        return 'Invalid Date';
                      }
                    })()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SSL/TLS Analysis Tab */}
          <TabsContent value="ssl" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>SSL/TLS Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">SSL Certificate Status</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Certificate validation and security
                        </p>
                      </div>
                      {getStatusBadge(latestSecurityScan.sslEnabled, 'Valid', 'Invalid')}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">HTTPS Redirect</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Automatic HTTPS enforcement
                        </p>
                      </div>
                      {getStatusBadge(latestSecurityScan.sslEnabled, 'Enabled', 'Not Found')}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">SSL Security Headers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded border">
                      <span className="text-sm">Strict-Transport-Security</span>
                      {getStatusIcon(latestSecurityScan.securityHeaders?.['strict-transport-security'])}
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded border">
                      <span className="text-sm">X-Frame-Options</span>
                      {getStatusIcon(latestSecurityScan.securityHeaders?.['x-frame-options'])}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      )}
    </div>
  );
}