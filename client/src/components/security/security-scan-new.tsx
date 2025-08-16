import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX,
  Bug, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Activity,
  Lock,
  Globe,
  FileText,
  Zap,
  RefreshCw,
  Calendar,
  Eye
} from 'lucide-react';
import { apiCall } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SecurityScanData {
  id: number;
  websiteId: number;
  scanStatus: 'pending' | 'running' | 'completed' | 'failed';
  scanStartedAt: string;
  scanCompletedAt?: string;
  scanDuration?: number;
  overallSecurityScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Direct properties from database for backward compatibility
  malwareStatus?: string;
  threatsDetected?: number;
  infectedFiles?: string[];
  blacklistStatus?: string;
  servicesChecked?: string[];
  flaggedBy?: string[];
  coreVulnerabilities?: number;
  pluginVulnerabilities?: number;
  themeVulnerabilities?: number;
  outdatedSoftware?: Array<{
    name: string;
    currentVersion: string;
    latestVersion: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  sslEnabled?: boolean;
  certificateValid?: boolean;
  sslGrade?: string;
  trustedBy?: Array<{
    service: string;
    status: 'trusted' | 'flagged' | 'unknown';
    lastCheck: string;
  }>;
  filePermissionsSecure?: boolean;
  adminUserSecure?: boolean;
  wpVersionHidden?: boolean;
  loginAttemptsLimited?: boolean;
  securityPluginsActive?: string[];
  
  // Nested result objects (new structure)
  malwareResult?: {
    status: 'clean' | 'infected' | 'suspicious' | 'error';
    threatsDetected: number;
    infectedFiles: string[];
    scanDuration: string;
    lastScan: string;
  };
  blacklistResult?: {
    status: 'clean' | 'blacklisted' | 'error';
    servicesChecked: string[];
    flaggedBy: string[];
    lastCheck: string;
  };
  vulnerabilityResult?: {
    coreVulnerabilities: number;
    pluginVulnerabilities: number;
    themeVulnerabilities: number;
    totalVulnerabilities: number;
    outdatedSoftware: Array<{
      name: string;
      currentVersion: string;
      latestVersion: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  };
  securityHeaders?: {
    'strict-transport-security': boolean;
    'content-security-policy': boolean;
    'x-content-type-options': boolean;
    'x-frame-options': boolean;
    'x-xss-protection': boolean;
    'referrer-policy': boolean;
    'permissions-policy': boolean;
    score: number;
  };
  webTrustResult?: {
    sslStatus: boolean;
    certificateValid: boolean;
    sslGrade: string;
    trustedBy: Array<{
      service: string;
      status: 'trusted' | 'flagged' | 'unknown';
      lastCheck: string;
    }>;
  };
  basicSecurityChecks?: {
    filePermissionsSecure: boolean;
    adminUserSecure: boolean;
    wpVersionHidden: boolean;
    loginAttemptsLimited: boolean;
    securityPluginsActive: string[];
  };
}

interface SecurityScanHistory {
  id: number;
  scanStartedAt: string;
  scanCompletedAt?: string;
  scanStatus: string;
  overallSecurityScore: number;
  threatLevel: string;
  scanDuration?: number;
}

interface SecurityScanProps {
  websiteId: number;
}

export function SecurityScan({ websiteId }: SecurityScanProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Helper function to safely get arrays from the scan data
  const getSafeArray = (array: any): any[] => {
    return Array.isArray(array) ? array : [];
  };

  // Helper function to safely get object entries
  const getSafeObjectEntries = (obj: any): [string, any][] => {
    if (!obj || typeof obj !== 'object') return [];
    try {
      return Object.entries(obj);
    } catch (error) {
      console.warn('Error getting object entries:', error);
      return [];
    }
  };

  // Fetch website details
  const { data: website } = useQuery({
    queryKey: [`/api/websites/${websiteId}`],
    enabled: !!websiteId,
  });

  // Fetch latest security scan
  const { data: latestScan, isLoading: isLoadingLatest, error: latestError } = useQuery<SecurityScanData>({
    queryKey: [`/api/websites/${websiteId}/security-scans/latest`],
    enabled: !!websiteId,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  // Fetch security scan history
  const { data: scanHistory = [], isLoading: isLoadingHistory } = useQuery<SecurityScanHistory[]>({
    queryKey: [`/api/websites/${websiteId}/security-scans`],
    enabled: !!websiteId,
  });

  // Run security scan mutation
  const runSecurityScanMutation = useMutation({
    mutationFn: async () => {
      return await apiCall(`/api/websites/${websiteId}/security-scan`, {
        method: 'POST',
        body: JSON.stringify({})
      });
    },
    onSuccess: (data) => {
      // Vercel API returns score at data.results.overallScore
      const score = data.results?.overallScore || data.data?.overallSecurityScore || data.overallSecurityScore || 'N/A';
      toast({
        title: "Security Scan Completed",
        description: `Scan finished with security score: ${score}/100`
      });
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/security-scans/latest`] });
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/security-scans`] });
    },
    onError: (error: any) => {
      toast({
        title: "Security Scan Failed",
        description: error.message || "Failed to perform security scan",
        variant: "destructive"
      });
    }
  });

  const handleRunScan = () => {
    runSecurityScanMutation.mutate();
  };

  // Clean up - remove debug logs since issue is resolved
  // Security scan data now loads correctly after API routing fix

  // Helper functions
  const getThreatLevelIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <ShieldCheck className="w-5 h-5 text-green-500" />;
      case 'medium':
        return <Shield className="w-5 h-5 text-yellow-500" />;
      case 'high':
        return <ShieldAlert className="w-5 h-5 text-orange-500" />;
      case 'critical':
        return <ShieldX className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getThreatLevelBadge = (level: string) => {
    const variants = {
      low: 'default' as const,
      medium: 'secondary' as const,
      high: 'destructive' as const,
      critical: 'destructive' as const
    };
    return variants[level as keyof typeof variants] || 'outline';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
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
      case 'trusted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'infected':
      case 'blacklisted':
      case 'flagged':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'suspicious':
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: boolean | string, trueText = 'Secure', falseText = 'At Risk') => {
    if (typeof status === 'boolean') {
      return (
        <Badge variant={status ? 'default' : 'destructive'} className="text-xs">
          {status ? trueText : falseText}
        </Badge>
      );
    }
    
    const statusConfig = {
      clean: { variant: 'default' as const, text: 'Clean' },
      trusted: { variant: 'default' as const, text: 'Trusted' },
      infected: { variant: 'destructive' as const, text: 'Infected' },
      blacklisted: { variant: 'destructive' as const, text: 'Blacklisted' },
      flagged: { variant: 'destructive' as const, text: 'Flagged' },
      suspicious: { variant: 'secondary' as const, text: 'Suspicious' },
      error: { variant: 'outline' as const, text: 'Error' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline' as const, text: status };
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  // Loading state
  if (isLoadingLatest) {
    return (
      <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
    );
  }

  // Error state or no scan data
  if (latestError && !latestScan) {
    const isAuthError = latestError?.message?.includes('token') || latestError?.message?.includes('Unauthorized');
    const is404Error = latestError?.message?.includes('404') || latestError?.message?.includes('not found');
    
    return (
      <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Security Check</h1>
              <p className="text-muted-foreground">
                Comprehensive security scanning and threat detection
              </p>
            </div>
            <Button 
              onClick={handleRunScan} 
              disabled={runSecurityScanMutation.isPending}
              data-testid="button-start-scan"
            >
              {runSecurityScanMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Start Security Scan
                </>
              )}
            </Button>
          </div>

          {/* Show error details for debugging */}
          {latestError && !is404Error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {isAuthError 
                  ? "Authentication issue detected. Please refresh the page and try again."
                  : `Error loading security scan data: ${latestError.message}`
                }
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Security Scans Available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Run your first comprehensive security scan to check for malware, vulnerabilities, and security issues.
              </p>
              <Button 
                onClick={handleRunScan} 
                disabled={runSecurityScanMutation.isPending}
                data-testid="button-first-scan"
              >
                {runSecurityScanMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running Scan...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Start First Scan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
    );
  }

  // Main content with scan data - provide safe defaults if data is missing
  const scanData = latestScan || {
    id: 0,
    websiteId: websiteId,
    scanStatus: 'pending' as const,
    scanStartedAt: new Date().toISOString(),
    scanCompletedAt: undefined,
    scanDuration: undefined,
    overallSecurityScore: 0,
    threatLevel: 'low' as const,
    // Direct properties from database for backward compatibility
    malwareStatus: 'clean',
    threatsDetected: 0,
    infectedFiles: [],
    blacklistStatus: 'clean',
    servicesChecked: [],
    flaggedBy: [],
    coreVulnerabilities: 0,
    pluginVulnerabilities: 0,
    themeVulnerabilities: 0,
    outdatedSoftware: [],
    sslEnabled: true,
    certificateValid: true,
    sslGrade: 'A',
    trustedBy: [],
    filePermissionsSecure: true,
    adminUserSecure: true,
    wpVersionHidden: true,
    loginAttemptsLimited: true,
    securityPluginsActive: [],
    // Nested result objects (new structure)
    malwareResult: {
      status: 'clean' as const,
      threatsDetected: 0,
      infectedFiles: [],
      scanDuration: 'N/A',
      lastScan: new Date().toISOString(),
    },
    blacklistResult: {
      status: 'clean' as const,
      servicesChecked: [],
      flaggedBy: [],
      lastCheck: new Date().toISOString(),
    },
    vulnerabilityResult: {
      coreVulnerabilities: 0,
      pluginVulnerabilities: 0,
      themeVulnerabilities: 0,
      totalVulnerabilities: 0,
      outdatedSoftware: [],
    },
    securityHeaders: {
      'strict-transport-security': true,
      'content-security-policy': false,
      'x-content-type-options': true,
      'x-frame-options': true,
      'x-xss-protection': true,
      'referrer-policy': false,
      'permissions-policy': false,
      score: 60,
    },
    webTrustResult: {
      sslStatus: true,
      certificateValid: true,
      sslGrade: 'A',
      trustedBy: [],
    },
    basicSecurityChecks: {
      filePermissionsSecure: true,
      adminUserSecure: true,
      wpVersionHidden: true,
      loginAttemptsLimited: true,
      securityPluginsActive: [],
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Security Check
            </h1>
            <p className="text-muted-foreground">
              Latest scan: {scanData.scanCompletedAt ? formatDate(scanData.scanCompletedAt) : 'In progress'}
            </p>
          </div>
          <Button 
            onClick={handleRunScan} 
            disabled={runSecurityScanMutation.isPending}
            data-testid="button-run-scan"
          >
            {runSecurityScanMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Scan Now
              </>
            )}
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card data-testid="card-security-score">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(scanData.overallSecurityScore)}`}>
                    {scanData.overallSecurityScore}/100
                  </p>
                </div>
                <Shield className={`w-8 h-8 ${getScoreColor(scanData.overallSecurityScore)}`} />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-threat-level">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Threat Level</p>
                  <p className={`text-2xl font-bold capitalize ${getThreatLevelColor(scanData.threatLevel)}`}>
                    {scanData.threatLevel}
                  </p>
                </div>
                {getThreatLevelIcon(scanData.threatLevel)}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-malware-status">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Malware Status</p>
                  <p className="text-2xl font-bold capitalize">
                    {scanData.malwareResult?.status || scanData.malwareStatus || 'clean'}
                  </p>
                </div>
                <Bug className={`w-8 h-8 ${
                  (scanData.malwareResult?.status || scanData.malwareStatus) === 'clean' ? 'text-green-500' : 
                  (scanData.malwareResult?.status || scanData.malwareStatus) === 'infected' ? 'text-red-500' : 'text-yellow-500'
                }`} />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-vulnerabilities">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vulnerabilities</p>
                  <p className="text-2xl font-bold">
                    {scanData.vulnerabilityResult?.totalVulnerabilities || 
                     ((scanData.coreVulnerabilities || 0) + (scanData.pluginVulnerabilities || 0) + (scanData.themeVulnerabilities || 0)) || 0}
                  </p>
                </div>
                <AlertTriangle className={`w-8 h-8 ${
                  (() => {
                    const totalVulns = scanData.vulnerabilityResult?.totalVulnerabilities || 
                      ((scanData.coreVulnerabilities || 0) + (scanData.pluginVulnerabilities || 0) + (scanData.themeVulnerabilities || 0)) || 0;
                    return totalVulns === 0 ? 'text-green-500' : totalVulns > 5 ? 'text-red-500' : 'text-yellow-500';
                  })()
                }`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="vulnerabilities" data-testid="tab-vulnerabilities">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="webtrust" data-testid="tab-webtrust">Web Trust</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Malware Detection */}
              <Card data-testid="card-malware-detail">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bug className="w-5 h-5" />
                    <span>Malware Detection</span>
                    {getStatusBadge(scanData.malwareResult?.status || scanData.malwareStatus || 'clean')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Threats Detected</span>
                    <span className="font-medium">{scanData.malwareResult?.threatsDetected || scanData.threatsDetected || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Scan Duration</span>
                    <span className="font-medium">{scanData.malwareResult?.scanDuration || scanData.scanDuration || 'N/A'}</span>
                  </div>
                  {getSafeArray(scanData.malwareResult?.infectedFiles || scanData.infectedFiles).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Infected Files:</p>
                      <div className="space-y-1">
                        {getSafeArray(scanData.malwareResult?.infectedFiles || scanData.infectedFiles).slice(0, 3).map((file, index) => (
                          <p key={index} className="text-xs text-muted-foreground bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {file}
                          </p>
                        ))}
                        {getSafeArray(scanData.malwareResult?.infectedFiles || scanData.infectedFiles).length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{getSafeArray(scanData.malwareResult?.infectedFiles || scanData.infectedFiles).length - 3} more files
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Blacklist Status */}
              <Card data-testid="card-blacklist-detail">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Blacklist Status</span>
                    {getStatusBadge(scanData.blacklistResult?.status || scanData.blacklistStatus || 'clean')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Services Checked</span>
                    <span className="font-medium">{getSafeArray(scanData.blacklistResult?.servicesChecked || scanData.servicesChecked).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Flagged By</span>
                    <span className="font-medium">{getSafeArray(scanData.blacklistResult?.flaggedBy || scanData.flaggedBy).length}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Services Checked:</p>
                    <div className="flex flex-wrap gap-1">
                      {getSafeArray(scanData.blacklistResult?.servicesChecked || scanData.servicesChecked).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {getSafeArray(scanData.blacklistResult?.flaggedBy || scanData.flaggedBy).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-red-600">Flagged By:</p>
                      <div className="flex flex-wrap gap-1">
                        {getSafeArray(scanData.blacklistResult?.flaggedBy || scanData.flaggedBy).map((service, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Headers */}
              <Card data-testid="card-security-headers">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Security Headers</span>
                    <Badge variant={(scanData.securityHeaders?.score || 0) >= 70 ? 'default' : 'destructive'} className="text-xs">
                      {scanData.securityHeaders?.score || 0}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getSafeObjectEntries(scanData.securityHeaders || {}).map(([header, enabled]) => {
                    if (header === 'score') return null;
                    
                    return (
                      <div key={header} className="flex items-center justify-between">
                        <span className="text-sm capitalize">
                          {header.replace(/-/g, ' ').replace(/^x /, 'X-')}
                        </span>
                        {getStatusIcon(typeof enabled === 'boolean' ? enabled : false)}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Basic Security */}
              <Card data-testid="card-basic-security">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Basic Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SSL Enabled</span>
                    {getStatusIcon(scanData.webTrustResult?.sslStatus || scanData.sslEnabled || false)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">File Permissions</span>
                    {getStatusIcon(scanData.basicSecurityChecks?.filePermissionsSecure || scanData.filePermissionsSecure || false)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admin User Secure</span>
                    {getStatusIcon(scanData.basicSecurityChecks?.adminUserSecure || scanData.adminUserSecure || false)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">WP Version Hidden</span>
                    {getStatusIcon(scanData.basicSecurityChecks?.wpVersionHidden || scanData.wpVersionHidden || false)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Login Protection</span>
                    {getStatusIcon(scanData.basicSecurityChecks?.loginAttemptsLimited || scanData.loginAttemptsLimited || false)}
                  </div>
                  {getSafeArray(scanData.basicSecurityChecks?.securityPluginsActive || scanData.securityPluginsActive).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Security Plugins:</p>
                      <div className="flex flex-wrap gap-1">
                        {getSafeArray(scanData.basicSecurityChecks?.securityPluginsActive || scanData.securityPluginsActive).map((plugin, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {plugin}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vulnerabilities" className="space-y-4">
            <Card data-testid="card-vulnerability-details">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Vulnerability Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(scanData.vulnerabilityResult?.totalVulnerabilities || 
                  ((scanData.coreVulnerabilities || 0) + (scanData.pluginVulnerabilities || 0) + (scanData.themeVulnerabilities || 0)) || 0) === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-semibold mb-2">No Vulnerabilities Detected</h3>
                    <p className="text-muted-foreground">
                      Your website appears to be free from known security vulnerabilities.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{scanData.vulnerabilityResult?.coreVulnerabilities || scanData.coreVulnerabilities || 0}</p>
                        <p className="text-sm text-muted-foreground">Core</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{scanData.vulnerabilityResult?.pluginVulnerabilities || scanData.pluginVulnerabilities || 0}</p>
                        <p className="text-sm text-muted-foreground">Plugins</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{scanData.vulnerabilityResult?.themeVulnerabilities || scanData.themeVulnerabilities || 0}</p>
                        <p className="text-sm text-muted-foreground">Themes</p>
                      </div>
                    </div>

                    {getSafeArray(scanData.vulnerabilityResult?.outdatedSoftware || scanData.outdatedSoftware).length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Outdated Software</h4>
                        <div className="space-y-2">
                          {getSafeArray(scanData.vulnerabilityResult?.outdatedSoftware || scanData.outdatedSoftware).map((software, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium">{software.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {software.currentVersion} → {software.latestVersion}
                                </p>
                              </div>
                              <Badge variant={
                                software.severity === 'critical' ? 'destructive' :
                                software.severity === 'high' ? 'destructive' :
                                software.severity === 'medium' ? 'secondary' : 'outline'
                              }>
                                {software.severity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webtrust" className="space-y-4">
            <Card data-testid="card-web-trust">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Web Trust & SSL</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold">SSL Configuration</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SSL Enabled</span>
                        {getStatusBadge(scanData.webTrustResult?.sslStatus || scanData.sslEnabled || false, 'Enabled', 'Disabled')}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Certificate Valid</span>
                        {getStatusBadge(scanData.webTrustResult?.certificateValid || scanData.certificateValid || false, 'Valid', 'Invalid')}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SSL Grade</span>
                        <Badge variant={(scanData.webTrustResult?.sslGrade || scanData.sslGrade || 'F') === 'A' ? 'default' : 'destructive'}>
                          {scanData.webTrustResult?.sslGrade || scanData.sslGrade || 'F'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Trust Services</h4>
                    <div className="space-y-2">
                      {getSafeArray(scanData.webTrustResult?.trustedBy || scanData.trustedBy).map((trust, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{trust.service}</span>
                          {getStatusBadge(trust.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card data-testid="card-scan-history">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Scan History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !Array.isArray(scanHistory) || scanHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">No Scan History</h3>
                    <p className="text-muted-foreground">
                      Security scan history will appear here after running scans.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getSafeArray(scanHistory).map((scan) => (
                      <div key={scan.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getThreatLevelIcon(scan.threatLevel)}
                            <div>
                              <p className="font-medium">{formatDate(scan.scanStartedAt)}</p>
                              <p className="text-sm text-muted-foreground">
                                {scan.scanStatus === 'completed' ? `Completed in ${formatDuration(scan.scanDuration)}` : scan.scanStatus}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className={`font-semibold ${getScoreColor(scan.overallSecurityScore)}`}>
                              {scan.overallSecurityScore}/100
                            </p>
                            <Badge variant={getThreatLevelBadge(scan.threatLevel)} className="text-xs">
                              {scan.threatLevel}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm" data-testid={`button-view-scan-${scan.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
}