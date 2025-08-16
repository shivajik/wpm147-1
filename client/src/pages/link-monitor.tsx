import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Website } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MaintenanceSidebar } from "@/components/maintenance/maintenance-sidebar";
import AppLayout from "@/components/layout/app-layout";

import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { 
  LinkIcon, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Clock,
  Globe,
  FileImage,
  Code,
  Palette,
  TrendingUp,
  Search,
  XCircle,
  Shield,
  AlertCircle,
  BarChart3,
  History,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BrokenLink {
  url: string;
  sourceUrl: string;
  linkText: string;
  linkType: 'internal' | 'external' | 'image' | 'script' | 'stylesheet' | 'other';
  statusCode?: number;
  error: string;
  priority: 'high' | 'medium' | 'low';
  checkedAt: string;
}

interface LinkScanResult {
  success: boolean;
  message: string;
  data: {
    websiteId: number;
    websiteUrl: string;
    scannedAt: string;
    scanDuration: number | null;
    summary: {
      totalLinksFound: number;
      brokenLinksFound: number;
      internalBrokenLinks: number;
      externalBrokenLinks: number;
      imageBrokenLinks: number;
      otherBrokenLinks: number;
    };
    brokenLinks: BrokenLink[];
    progress: {
      totalPages: number;
      scannedPages: number;
      totalLinks: number;
      checkedLinks: number;
      brokenLinks: number;
      isComplete: boolean;
      startedAt: string;
      completedAt?: string;
    };
  };
}

interface LinkScanHistory {
  id: number;
  websiteId: number;
  userId: number;
  scanStartedAt: string;
  scanCompletedAt?: string;
  scanDuration?: number;
  totalPages: number;
  totalLinksFound: number;
  brokenLinksFound: number;
  internalBrokenLinks: number;
  externalBrokenLinks: number;
  imageBrokenLinks: number;
  otherBrokenLinks: number;
  brokenLinksData?: BrokenLink[];
  scanStatus: 'pending' | 'running' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt?: string;
}

export default function LinkMonitorPage() {
  const params = useParams();
  const websiteId = params.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastScanResult, setLastScanResult] = useState<LinkScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Fetch website details
  const { data: website, isLoading, error: websiteError } = useQuery<Website>({
    queryKey: ['/api/websites', websiteId],
    enabled: !!websiteId,
  });

  // Fetch scan history
  const { data: scanHistory, isLoading: historyLoading, error: historyError } = useQuery<LinkScanHistory[]>({
    queryKey: ['/api/websites', websiteId, 'link-monitor', 'history'],
    enabled: !!websiteId,
  });

  // Debug logging for production troubleshooting
  useEffect(() => {
    if (websiteId) {
      console.log('[LINK-MONITOR] Website ID:', websiteId);
      console.log('[LINK-MONITOR] History loading:', historyLoading);
      console.log('[LINK-MONITOR] History error:', historyError);
      console.log('[LINK-MONITOR] Scan history data:', scanHistory);
    }
  }, [websiteId, historyLoading, historyError, scanHistory]);

  // Automatically populate lastScanResult from most recent completed scan
  useEffect(() => {
    if (scanHistory && scanHistory.length > 0 && !lastScanResult) {
      // Find the most recent completed scan
      const recentScan = scanHistory
        .filter(scan => scan.scanStatus === 'completed')
        .sort((a, b) => new Date(b.scanStartedAt).getTime() - new Date(a.scanStartedAt).getTime())[0];
      
      if (recentScan) {
        console.log('[LINK-MONITOR] Loading recent scan data:', recentScan);
        console.log('[LINK-MONITOR] Broken links data:', recentScan.brokenLinksData);
        
        // Convert LinkScanHistory to LinkScanResult format
        const convertedResult: LinkScanResult = {
          success: true,
          message: `Scan completed. Found ${recentScan.brokenLinksFound} broken links out of ${recentScan.totalLinksFound} total links.`,
          data: {
            websiteId: recentScan.websiteId,
            websiteUrl: website?.url || '',
            scannedAt: recentScan.scanCompletedAt || recentScan.scanStartedAt,
            scanDuration: recentScan.scanDuration || null,
            summary: {
              totalLinksFound: recentScan.totalLinksFound,
              brokenLinksFound: recentScan.brokenLinksFound,
              internalBrokenLinks: recentScan.internalBrokenLinks,
              externalBrokenLinks: recentScan.externalBrokenLinks,
              imageBrokenLinks: recentScan.imageBrokenLinks,
              otherBrokenLinks: recentScan.otherBrokenLinks,
            },
            brokenLinks: recentScan.brokenLinksData || [],
            progress: {
              totalPages: recentScan.totalPages,
              scannedPages: recentScan.totalPages,
              totalLinks: recentScan.totalLinksFound,
              checkedLinks: recentScan.totalLinksFound,
              brokenLinks: recentScan.brokenLinksFound,
              isComplete: true,
              startedAt: recentScan.scanStartedAt,
              completedAt: recentScan.scanCompletedAt,
            }
          }
        };
        setLastScanResult(convertedResult);
      }
    }
  }, [scanHistory, website?.url, lastScanResult]);

  // Link scan mutation
  const linkScanMutation = useMutation({
    mutationFn: async () => {
      if (!websiteId) throw new Error("Website ID is required");
      setIsScanning(true);
      
      const response = await apiCall(`/api/websites/${websiteId}/link-monitor`, {
        method: 'POST',
      });
      return response as LinkScanResult;
    },
    onSuccess: (data) => {
      setLastScanResult(data);
      // Invalidate history cache to refresh with new scan
      queryClient.invalidateQueries({
        queryKey: ['/api/websites', websiteId, 'link-monitor', 'history']
      });
      toast({
        title: "Link Scan Completed",
        description: data.message,
      });
    },
    onError: (error: any) => {
      console.error('[LINK-MONITOR] Scan error:', error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan for broken links",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsScanning(false);
    },
  });

  const handleStartScan = () => {
    linkScanMutation.mutate();
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getLinkTypeIcon = (linkType: string) => {
    switch (linkType) {
      case 'internal':
        return <Globe className="h-4 w-4" />;
      case 'external':  
        return <ExternalLink className="h-4 w-4" />;
      case 'image':
        return <FileImage className="h-4 w-4" />;
      case 'script':
        return <Code className="h-4 w-4" />;
      case 'stylesheet':
        return <Palette className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <AppLayout defaultOpen={false}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading link monitor data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show error state if website failed to load
  if (websiteError) {
    return (
      <AppLayout defaultOpen={false}>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Failed to load website data</p>
          <p className="text-sm text-muted-foreground">Error: {(websiteError as any)?.message || 'Unknown error'}</p>
        </div>
      </AppLayout>
    );
  }

  if (!website) {
    return (
      <AppLayout defaultOpen={false}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Website not found.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout defaultOpen={false}>
      <div className="flex gap-6">
        <MaintenanceSidebar 
          websiteId={parseInt(websiteId?.toString() || '0')} 
          websiteName={website.name}
          websiteUrl={website.url}
        />
        
        <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <LinkIcon className="h-8 w-8 text-teal-600" />
              Link Monitor
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and detect broken links across your website
            </p>
          </div>
          <Button 
            onClick={handleStartScan} 
            disabled={isScanning}
            className="flex items-center gap-2"
          >
            {isScanning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isScanning ? "Scanning..." : "Start Link Scan"}
          </Button>
        </div>

        {/* Overview Cards */}
        {lastScanResult && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Links</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lastScanResult.data.summary.totalLinksFound}</div>
                <p className="text-xs text-muted-foreground">Links found across website</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Broken Links</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{lastScanResult.data.summary.brokenLinksFound}</div>
                <p className="text-xs text-muted-foreground">Links that need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Internal Issues</CardTitle>
                <Globe className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{lastScanResult.data.summary.internalBrokenLinks}</div>
                <p className="text-xs text-muted-foreground">Internal broken links</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(((lastScanResult.data.summary.totalLinksFound - lastScanResult.data.summary.brokenLinksFound) / lastScanResult.data.summary.totalLinksFound) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">Links working correctly</p>
              </CardContent>
            </Card>
              </div>
          )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="broken-links">Broken Links</TabsTrigger>
            <TabsTrigger value="scan-history">Scan History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Link Health Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lastScanResult ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Link Distribution</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Internal Links</span>
                                <span className="text-sm font-medium">{lastScanResult.data.summary.internalBrokenLinks}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">External Links</span>
                                <span className="text-sm font-medium">{lastScanResult.data.summary.externalBrokenLinks}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Images</span>
                                <span className="text-sm font-medium">{lastScanResult.data.summary.imageBrokenLinks}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Other Resources</span>
                                <span className="text-sm font-medium">{lastScanResult.data.summary.otherBrokenLinks}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">Scan Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Last Scan:</span>
                                <span>{new Date(lastScanResult.data.scannedAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Duration:</span>
                                <span>{lastScanResult.data.scanDuration ? `${lastScanResult.data.scanDuration}s` : 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Pages Scanned:</span>
                                <span>{lastScanResult.data.progress.totalPages}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Overall Health</span>
                            <span className="text-sm">
                              {Math.round(((lastScanResult.data.summary.totalLinksFound - lastScanResult.data.summary.brokenLinksFound) / lastScanResult.data.summary.totalLinksFound) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={((lastScanResult.data.summary.totalLinksFound - lastScanResult.data.summary.brokenLinksFound) / lastScanResult.data.summary.totalLinksFound) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No scan data available</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Run your first link scan to see detailed analytics and broken link reports
                        </p>
                        <Button onClick={handleStartScan} disabled={isScanning}>
                          {isScanning ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Scanning...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Start First Scan
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="broken-links" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Broken Links Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lastScanResult && lastScanResult.data.brokenLinks.length > 0 ? (
                      <div className="space-y-4">
                        {lastScanResult.data.brokenLinks.map((link, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getLinkTypeIcon(link.linkType)}
                                <span className="font-medium">{link.linkText || 'No text'}</span>
                                <Badge variant={getPriorityColor(link.priority)}>
                                  {link.priority}
                                </Badge>
                              </div>
                              {getPriorityIcon(link.priority)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">URL:</span>
                                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                                  {link.url}
                                </code>
                                {link.statusCode && (
                                  <Badge variant="outline" className="text-xs">
                                    {link.statusCode}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">Found on:</span>
                                <span>{link.sourceUrl}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Error:</span>
                                <span className="text-red-600 dark:text-red-400">{link.error}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {lastScanResult ? 'No broken links found!' : 'No scan data available'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {lastScanResult 
                            ? 'All links on your website are working correctly.' 
                            : 'Run a link scan to check for broken links on your website.'
                          }
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scan-history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Scan History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {historyLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : historyError ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load scan history</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Error: {(historyError as any)?.message || 'Unknown error'}
                        </p>
                        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'link-monitor', 'history'] })}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    ) : scanHistory && scanHistory.length > 0 ? (
                      <div className="space-y-4">
                        {scanHistory.map((scan) => (
                          <div key={scan.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">
                                  {formatDistanceToNow(new Date(scan.scanStartedAt), { addSuffix: true })}
                                </span>
                                <Badge variant={
                                  scan.scanStatus === 'completed' ? 'secondary' :
                                  scan.scanStatus === 'failed' ? 'destructive' :
                                  scan.scanStatus === 'running' ? 'outline' : 'outline'
                                }>
                                  {scan.scanStatus}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500">
                                {scan.scanCompletedAt && formatDistanceToNow(new Date(scan.scanCompletedAt), { addSuffix: true })}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {scan.totalLinksFound}
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Total Links</div>
                              </div>
                              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                  {scan.brokenLinksFound}
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-400">Broken Links</div>
                              </div>
                              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                  {scan.internalBrokenLinks}
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400">Internal</div>
                              </div>
                              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                  {scan.externalBrokenLinks}
                                </div>
                                <div className="text-sm text-purple-600 dark:text-purple-400">External</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center gap-4">
                                <span>Pages: {scan.totalPages}</span>
                                {scan.scanDuration && <span>Duration: {scan.scanDuration}s</span>}
                              </div>
                              {scan.scanStatus === 'completed' && scan.brokenLinksFound > 0 && (
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                  {scan.brokenLinksFound} issues found
                                </span>
                              )}
                              {scan.scanStatus === 'failed' && scan.errorMessage && (
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                  Error: {scan.errorMessage}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No scan history</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Run your first link scan to start tracking your website's link health over time.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}