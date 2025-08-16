import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  Clock, 
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  FileText,
  Globe,
  Lock,
  Users,
  Settings
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface OutdatedSoftware {
  name: string;
  currentVersion: string;
  latestVersion: string;
  type: 'plugin' | 'theme' | 'core';
}

interface SecurityHeaders {
  x_frame_options: boolean;
  x_content_type_options: boolean;
  x_xss_protection: boolean;
  strict_transport_security: boolean;
  content_security_policy: boolean;
}

interface FilePermissionIssue {
  file: string;
  currentPermission: string;
  recommendedPermission: string;
  severity: 'low' | 'medium' | 'high';
}

interface SecurityScanHistory {
  id: number;
  websiteId: number;
  userId: number;
  scanStartedAt: string;
  scanCompletedAt: string | null;
  scanDuration: number | null;
  scanStatus: 'pending' | 'running' | 'completed' | 'failed';
  overallSecurityScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  malwareStatus: 'clean' | 'infected' | 'suspicious' | 'error';
  threatsDetected: number;
  infectedFiles: string[];
  blacklistStatus: 'clean' | 'blacklisted' | 'error';
  servicesChecked: string[];
  flaggedBy: string[];
  coreVulnerabilities: number;
  pluginVulnerabilities: number;
  themeVulnerabilities: number;
  outdatedSoftware: OutdatedSoftware[];
  securityHeaders: SecurityHeaders;
  coreFilesModified: number;
  suspiciousFiles: string[];
  filePermissionIssues: FilePermissionIssue[];
  sslEnabled: boolean;
  filePermissionsSecure: boolean;
  adminUserSecure: boolean;
  wpVersionHidden: boolean;
  loginAttemptsLimited: boolean;
  securityPluginsActive: string[];
  fullScanData: Record<string, unknown>;
  scanTrigger: 'manual' | 'scheduled' | 'automated';
  errorMessage: string | null;
  createdAt: string;
}

export default function SecurityScanHistoryPage() {
  const [match, params] = useRoute("/websites/:id/security-scans");
  const websiteId = params?.id ? parseInt(params.id) : null;
  const [selectedScan, setSelectedScan] = useState<SecurityScanHistory | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();

  // Get website info
  const { data: website } = useQuery({
    queryKey: [`/api/websites/${websiteId}`],
    enabled: !!websiteId,
  });

  // Get security scan history
  const { data: scanHistory, isLoading, error } = useQuery<SecurityScanHistory[]>({
    queryKey: [`/api/websites/${websiteId}/security-scans`],
    enabled: !!websiteId,
  });

  // Get latest security scan
  const { data: latestScan } = useQuery<SecurityScanHistory>({
    queryKey: [`/api/websites/${websiteId}/security-scans/latest`],
    enabled: !!websiteId,
  });

  // Start new scan mutation
  const startScanMutation = useMutation({
    mutationFn: () => apiRequest(`/api/websites/${websiteId}/security-scan`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/security-scans`] });
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/security-scans/latest`] });
    },
  });

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'low': return <ShieldCheck className="h-4 w-4" />;
      case 'medium': return <Shield className="h-4 w-4" />;
      case 'high': return <ShieldAlert className="h-4 w-4" />;
      case 'critical': return <ShieldX className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (!websiteId) {
    return <div>Invalid website ID</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load security scan history. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Scan History</h1>
          <p className="text-muted-foreground">
            {(website as any)?.name} - Security scan results and history
          </p>
        </div>
        <Button 
          onClick={() => startScanMutation.mutate()}
          disabled={startScanMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {startScanMutation.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Start New Scan
        </Button>
      </div>

      {/* Latest Scan Summary */}
      {latestScan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Latest Security Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Security Score</p>
                <div className="flex items-center gap-2">
                  <Progress value={latestScan.overallSecurityScore} className="flex-1" />
                  <span className="text-sm font-bold">{latestScan.overallSecurityScore}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Threat Level</p>
                <Badge className={getThreatLevelColor(latestScan.threatLevel)}>
                  {getThreatIcon(latestScan.threatLevel)}
                  <span className="ml-1 capitalize">{latestScan.threatLevel}</span>
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Threats</p>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="font-bold">{latestScan.threatsDetected}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Last Scan</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(latestScan.scanStartedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
          <CardDescription>
            View all security scans performed on this website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!scanHistory || scanHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 max-w-md mx-auto">
                <Shield className="h-16 w-16 mx-auto text-blue-500 mb-6" />
                <h3 className="text-xl font-semibold mb-3">Security Scan Required</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  No security scans have been performed on this website yet. 
                  Start your first comprehensive security analysis to identify potential 
                  vulnerabilities and security threats.
                </p>
                <div className="space-y-3 mb-6 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>Malware detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                    <span>Vulnerability assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Security headers analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldX className="h-4 w-4 text-red-500" />
                    <span>Blacklist monitoring</span>
                  </div>
                </div>
                <Button 
                  onClick={() => startScanMutation.mutate()}
                  disabled={startScanMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  {startScanMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Starting Scan...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Security Scan
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Scan typically completes in 10-15 seconds
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {scanHistory.map((scan: SecurityScanHistory) => (
                <Card key={scan.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(scan.scanStatus)}
                          <Badge className={getStatusColor(scan.scanStatus)}>
                            {scan.scanStatus}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">
                            {(() => {
                              try {
                                const date = new Date(scan.scanStartedAt);
                                if (isNaN(date.getTime())) return 'Invalid Date';
                                return formatDistanceToNow(date, { addSuffix: true });
                              } catch {
                                return 'Invalid Date';
                              }
                            })()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {scan.scanDuration ? `${scan.scanDuration}s` : 'Duration unknown'}
                            {scan.scanTrigger && ` • ${scan.scanTrigger}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {scan.scanStatus === 'completed' && (
                          <>
                            <div className="text-right">
                              <p className="text-sm font-medium">Score: {scan.overallSecurityScore}%</p>
                              <Badge className={getThreatLevelColor(scan.threatLevel)}>
                                {getThreatIcon(scan.threatLevel)}
                                <span className="ml-1">{scan.threatLevel}</span>
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Threats: {scan.threatsDetected}</p>
                              <p className="text-xs text-muted-foreground">
                                Vulnerabilities: {scan.coreVulnerabilities + scan.pluginVulnerabilities + scan.themeVulnerabilities}
                              </p>
                            </div>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedScan(scan);
                            setShowDetails(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Details Dialog/Modal would go here */}
      {showDetails && selectedScan && (
        <SecurityScanDetailsModal 
          scan={selectedScan} 
          onClose={() => setShowDetails(false)} 
        />
      )}
    </div>
  );
}

// Security Scan Details Modal Component
interface SecurityScanDetailsModalProps {
  scan: SecurityScanHistory;
  onClose: () => void;
}

function SecurityScanDetailsModal({ scan, onClose }: SecurityScanDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Security Scan Details</h2>
            <Button variant="outline" onClick={onClose}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="malware">Malware</TabsTrigger>
              <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Security Score</p>
                        <p className="text-2xl font-bold">{scan.overallSecurityScore}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">Threats</p>
                        <p className="text-2xl font-bold">{scan.threatsDetected}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">SSL Status</p>
                        <p className="text-lg font-bold">{scan.sslEnabled ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-lg font-bold">{scan.scanDuration || 0}s</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="malware">
              <Card>
                <CardHeader>
                  <CardTitle>Malware Scan Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={scan.malwareStatus === 'clean' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {scan.malwareStatus}
                      </Badge>
                      <span>Status: {scan.malwareStatus}</span>
                    </div>
                    {scan.threatsDetected > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Infected Files:</h4>
                        <ul className="space-y-1">
                          {scan.infectedFiles.map((file, index) => (
                            <li key={index} className="text-sm bg-red-50 p-2 rounded border">
                              {file}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vulnerabilities">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium">Core Vulnerabilities</h4>
                      <p className="text-2xl font-bold text-red-600">{scan.coreVulnerabilities}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium">Plugin Vulnerabilities</h4>
                      <p className="text-2xl font-bold text-orange-600">{scan.pluginVulnerabilities}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium">Theme Vulnerabilities</h4>
                      <p className="text-2xl font-bold text-yellow-600">{scan.themeVulnerabilities}</p>
                    </CardContent>
                  </Card>
                </div>
                {scan.outdatedSoftware.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Outdated Software</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Array.isArray(scan.outdatedSoftware) && scan.outdatedSoftware.map((software: any, index: number) => (
                          <li key={index} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                            <span>{software.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {software.current} → {software.latest}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Headers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(scan.securityHeaders || {}).map(([header, enabled]) => (
                        <div key={header} className="flex items-center justify-between">
                          <span className="capitalize">{header.replace(/_/g, '-')}</span>
                          <Badge className={enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {enabled ? 'Enabled' : 'Missing'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Security Plugins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(scan.securityPluginsActive) && scan.securityPluginsActive.length > 0 ? (
                      <ul className="space-y-1">
                        {scan.securityPluginsActive.map((plugin, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {plugin}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No security plugins detected</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="files">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>File Integrity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium">Core Files Modified: {scan.coreFilesModified}</p>
                      </div>
                      {Array.isArray(scan.suspiciousFiles) && scan.suspiciousFiles.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Suspicious Files:</h4>
                          <ul className="space-y-1">
                            {Array.isArray(scan.suspiciousFiles) && scan.suspiciousFiles.map((file, index) => (
                              <li key={index} className="text-sm bg-yellow-50 p-2 rounded border">
                                {file}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(scan.filePermissionIssues) && scan.filePermissionIssues.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Permission Issues:</h4>
                          <ul className="space-y-1">
                            {scan.filePermissionIssues.map((issue: any, index: number) => (
                              <li key={index} className="text-sm bg-orange-50 p-2 rounded border">
                                {issue.file}: {issue.permissions} (recommended: {issue.recommended})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}