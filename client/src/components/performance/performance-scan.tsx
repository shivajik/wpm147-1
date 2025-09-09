import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Activity,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Globe,
  Timer,
  Database,
  HardDrive,
  Gauge,
  Code,
  Settings,
  Image,
  FileText
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/lib/queryClient';
import { format } from 'date-fns';

interface PerformanceScanProps {
  websiteId: number;
}

interface PerformanceScanResult {
  id: number;
  pagespeedScore: number;
  yslowScore: number;
  coreWebVitalsGrade: 'good' | 'needs-improvement' | 'poor';
  lcpScore: number;
  fidScore: number;
  clsScore: number;
  scanData: any;
  recommendations: PerformanceRecommendation[];
  scanTimestamp: string;
  scanRegion: string;
  previousScore?: number;
  scoreChange?: number;
}

interface PerformanceRecommendation {
  category: 'images' | 'css' | 'javascript' | 'server' | 'caching' | 'cdn';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  resources?: string[];
}

const scanRegions = [
  { value: 'us-east-1', label: 'US East (Virginia)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'EU West (Ireland)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
];

export function PerformanceScan({ websiteId }: PerformanceScanProps) {
  const [selectedRegion, setSelectedRegion] = useState('us-east-1');
  const queryClient = useQueryClient();

  // Fetch latest performance scan
  const { data: latestScan, isLoading: isLoadingLatest } = useQuery<PerformanceScanResult | null>({
    queryKey: [`/api/websites/${websiteId}/performance-scans/latest`],
    enabled: !!websiteId,
  });

  // Fetch SEO reports list to get the latest report ID
  const { data: seoReports, isLoading: isLoadingSeoReports } = useQuery<any[]>({
    queryKey: [`/api/websites/${websiteId}/seo-reports`],
    enabled: !!websiteId,
  });

  // Get the latest SEO report ID from the list
  const latestSeoReportId = seoReports && Array.isArray(seoReports) && seoReports.length > 0 ? seoReports[0]?.id : null;

  // Fetch the full SEO report details using the same approach as seo-report.tsx
  const { data: seoReportDetails, isLoading: isLoadingSeoDetails } = useQuery<any>({
    queryKey: [`/api/websites/${websiteId}/seo-reports/${latestSeoReportId}`],
    enabled: !!websiteId && !!latestSeoReportId,
  });

  // Extract technical data from the SEO report details (same as comprehensive SEO report)
  const finalTechnicalData = seoReportDetails?.reportData || {};

  // Check if we have technical data available
  const hasTechnicalData = finalTechnicalData.httpRequests && (
    finalTechnicalData.httpRequests.css?.total > 0 || 
    finalTechnicalData.httpRequests.javascript?.total > 0 || 
    finalTechnicalData.httpRequests.images?.total > 0
  );

  // Fetch performance scan history
  const { data: scanHistory, isLoading: isLoadingHistory } = useQuery<PerformanceScanResult[]>({
    queryKey: [`/api/websites/${websiteId}/performance-scans`],
    enabled: !!websiteId,
  });

  // Run performance scan mutation
  const runScanMutation = useMutation({
    mutationFn: async (region: string) => {
      return await apiCall(`/api/websites/${websiteId}/performance-scan`, {
        method: 'POST',
        body: JSON.stringify({ region }),
      });
    },
    onSuccess: (data) => {
      // Update the latest scan cache with the new data
      queryClient.setQueryData([`/api/websites/${websiteId}/performance-scans/latest`], data);
      // Invalidate scan history to refetch
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/performance-scans`] });
      // Also invalidate SEO reports to refetch latest technical data
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/seo-reports`] });
    },
  });

  const handleRunScan = () => {
    runScanMutation.mutate(selectedRegion);
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

  const getCoreWebVitalsBadge = (grade: string) => {
    switch (grade) {
      case 'good':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Good</Badge>;
      case 'needs-improvement':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Needs Improvement</Badge>;
      case 'poor':
        return <Badge variant="destructive">Poor</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Target className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'images':
        return <Activity className="w-4 h-4" />;
      case 'css':
        return <Database className="w-4 h-4" />;
      case 'javascript':
        return <Database className="w-4 h-4" />;
      case 'server':
        return <HardDrive className="w-4 h-4" />;
      case 'caching':
        return <RotateCcw className="w-4 h-4" />;
      case 'cdn':
        return <Globe className="w-4 h-4" />;
      default:
        return <Gauge className="w-4 h-4" />;
    }
  };

  if (isLoadingLatest && isLoadingHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Performance Scanner</span>
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
            <Zap className="w-5 h-5" />
            <span>Performance Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Scan Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scan region" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(scanRegions) && scanRegions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleRunScan}
                disabled={runScanMutation.isPending}
                className="flex items-center space-x-2"
              >
                {runScanMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Gauge className="w-4 h-4" />
                    <span>Run Performance Scan</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {runScanMutation.isPending && (
            <Alert>
              <Timer className="h-4 w-4" />
              <AlertDescription>
                Running comprehensive performance analysis using Google PageSpeed and Yahoo! YSlow rulesets. This may take 30-60 seconds.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Latest Scan Results */}
      {latestScan && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">PageSpeed Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className={`text-3xl font-bold ${getScoreColor(latestScan.pagespeedScore)}`}>
                      {latestScan.pagespeedScore}
                    </span>
                    <Badge variant={getScoreBadgeVariant(latestScan.pagespeedScore)}>
                      {latestScan.pagespeedScore >= 90 ? 'Good' : latestScan.pagespeedScore >= 70 ? 'Needs Work' : 'Poor'}
                    </Badge>
                  </div>
                  <Progress value={latestScan.pagespeedScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">YSlow Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className={`text-3xl font-bold ${getScoreColor(latestScan.yslowScore)}`}>
                      {latestScan.yslowScore}
                    </span>
                    <Badge variant={getScoreBadgeVariant(latestScan.yslowScore)}>
                      {latestScan.yslowScore >= 90 ? 'Good' : latestScan.yslowScore >= 70 ? 'Needs Work' : 'Poor'}
                    </Badge>
                  </div>
                  <Progress value={latestScan.yslowScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Core Web Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {getCoreWebVitalsBadge(latestScan.coreWebVitalsGrade)}
                    {latestScan.scoreChange && (
                      <div className="flex items-center space-x-1">
                        {latestScan.scoreChange > 0 ? (
                          <ArrowUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">
                          {Math.abs(latestScan.scoreChange)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>LCP Score</span>
                      <span className={getScoreColor(latestScan.lcpScore)}>{latestScan.lcpScore}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>FID Score</span>
                      <span className={getScoreColor(latestScan.fidScore)}>{latestScan.fidScore}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>CLS Score</span>
                      <span className={getScoreColor(latestScan.clsScore)}>{latestScan.clsScore}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scan Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scan Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Scan Time</span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {latestScan.scanTimestamp ? format(new Date(latestScan.scanTimestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Region</span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {scanRegions.find(r => r.value === latestScan.scanRegion)?.label || latestScan.scanRegion}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Overall Score</span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {Math.round((latestScan.pagespeedScore + latestScan.yslowScore) / 2)}/100
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Recommendations</span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {latestScan.recommendations?.length || 0} items
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HTTP Requests Analysis */}
            {latestScan.scanData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    HTTP Requests Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      The webpage makes {finalTechnicalData.httpRequests?.total || latestScan.scanData.yslow_metrics?.num_requests || 'several'} HTTP requests with a total size of {latestScan.scanData.yslow_metrics?.page_size ? `${(latestScan.scanData.yslow_metrics.page_size / 1024 / 1024).toFixed(2)} MB` : 'calculating...'}.
                    </p>
                    {!hasTechnicalData && (
                      <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          📊 For detailed resource analysis, visit the <strong>SEO</strong> section and run a comprehensive analysis to get accurate CSS, JavaScript, and Image counts.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* JavaScript Analysis Card */}
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-green-800 dark:text-green-200 flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          JavaScript
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {finalTechnicalData.httpRequests?.javascript?.total || latestScan.scanData.yslow_metrics?.js_files || 'N/A'}
                        </div>
                        <div className="text-xs text-green-700 dark:text-green-300">Total Scripts</div>
                        
                        {finalTechnicalData.httpRequests?.javascript && (
                          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                            <div className="flex justify-between">
                              <span>External:</span>
                              <Badge variant="outline" className="text-xs h-5">{finalTechnicalData.httpRequests.javascript.external || 0}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Inline:</span>
                              <Badge variant="outline" className="text-xs h-5">{finalTechnicalData.httpRequests.javascript.inline || 0}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Async:</span>
                              <Badge variant="default" className="text-xs h-5">{finalTechnicalData.httpRequests.javascript.async || 0}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Blocking:</span>
                              <Badge variant="destructive" className="text-xs h-5">{finalTechnicalData.httpRequests.javascript.blocking || 0}</Badge>
                            </div>
                          </div>
                        )}
                        
                        {!finalTechnicalData.httpRequests?.javascript?.total && !latestScan.scanData.yslow_metrics?.js_files && (
                          <div className="text-xs text-green-600 mt-1">Run SEO analysis for detailed breakdown</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* CSS Analysis Card */}
                    <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-purple-800 dark:text-purple-200 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          CSS
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {finalTechnicalData.httpRequests?.css?.total || latestScan.scanData.yslow_metrics?.css_files || 'N/A'}
                        </div>
                        <div className="text-xs text-purple-700 dark:text-purple-300">Total Stylesheets</div>
                        
                        {finalTechnicalData.httpRequests?.css && (
                          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                            <div className="flex justify-between">
                              <span>External:</span>
                              <Badge variant="outline" className="text-xs h-5">{finalTechnicalData.httpRequests.css.external || 0}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Inline:</span>
                              <Badge variant="outline" className="text-xs h-5">{finalTechnicalData.httpRequests.css.inline || 0}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Critical:</span>
                              <Badge variant="default" className="text-xs h-5">{finalTechnicalData.httpRequests.css.critical || 0}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Blocking:</span>
                              <Badge variant="destructive" className="text-xs h-5">{finalTechnicalData.httpRequests.css.blocking || 0}</Badge>
                            </div>
                          </div>
                        )}
                        
                        {!finalTechnicalData.httpRequests?.css?.total && !latestScan.scanData.yslow_metrics?.css_files && (
                          <div className="text-xs text-purple-600 mt-1">Run SEO analysis for detailed breakdown</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Images Analysis Card */}
                    <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-orange-800 dark:text-orange-200 flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Images
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {finalTechnicalData.httpRequests?.images?.total || latestScan.scanData.yslow_metrics?.image_files || 'N/A'}
                        </div>
                        <div className="text-xs text-orange-700 dark:text-orange-300">Total Images</div>
                        
                        {finalTechnicalData.httpRequests?.images && (
                          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                            <div className="flex justify-between">
                              <span>Optimized:</span>
                              <Badge variant="default" className="text-xs h-5">{finalTechnicalData.httpRequests.images.optimized || 0}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Legacy:</span>
                              <Badge variant="destructive" className="text-xs h-5">{finalTechnicalData.httpRequests.images.unoptimized || 0}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>WebP/AVIF:</span>
                              <Badge variant="outline" className="text-xs h-5">{finalTechnicalData.httpRequests.images.optimized || 0}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Alt Missing:</span>
                              <Badge variant="destructive" className="text-xs h-5">{finalTechnicalData.images?.missingAlt || 0}</Badge>
                            </div>
                          </div>
                        )}
                        
                        {!finalTechnicalData.httpRequests?.images?.total && !latestScan.scanData.yslow_metrics?.image_files && (
                          <div className="text-xs text-orange-600 mt-1">Run SEO analysis for detailed breakdown</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Resource Breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Resource Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>External:</span>
                        <Badge variant="outline">{latestScan.scanData.yslow_metrics?.external_requests || 0}</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>Internal:</span>
                        <Badge variant="outline">{latestScan.scanData.yslow_metrics?.internal_requests || 0}</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>Blocking:</span>
                        <Badge variant="destructive">{latestScan.scanData.yslow_metrics?.blocking_requests || 0}</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>Async:</span>
                        <Badge variant="default">{latestScan.scanData.yslow_metrics?.async_requests || 0}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Performance Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Load Time</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {latestScan.scanData.yslow_metrics?.load_time ? `${(latestScan.scanData.yslow_metrics.load_time / 1000).toFixed(2)}s` : 'N/A'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Time to fully load the webpage</div>
                      </div>
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Page Size</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {latestScan.scanData.yslow_metrics?.page_size ? `${(latestScan.scanData.yslow_metrics.page_size / 1024).toFixed(2)} KB` : 'N/A'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Total document size including resources</div>
                      </div>
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">CDN Usage</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {latestScan.scanData.yslow_metrics?.cdn_usage ? 'Enabled' : 'Not Detected'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Content delivery network optimization</div>
                      </div>
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">GZIP Compression</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {latestScan.scanData.yslow_metrics?.gzip_compression ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Text content compression status</div>
                      </div>
                    </div>
                  </div>

                  {/* Lighthouse Scores */}
                  {latestScan.scanData.lighthouse_metrics && (
                    <div className="mt-6 space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Lighthouse Scores</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className={`text-xl font-bold ${getScoreColor(latestScan.scanData.lighthouse_metrics.performance_score)}`}>
                            {latestScan.scanData.lighthouse_metrics.performance_score}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Performance</div>
                        </div>
                        <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className={`text-xl font-bold ${getScoreColor(latestScan.scanData.lighthouse_metrics.accessibility_score)}`}>
                            {latestScan.scanData.lighthouse_metrics.accessibility_score}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Accessibility</div>
                        </div>
                        <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className={`text-xl font-bold ${getScoreColor(latestScan.scanData.lighthouse_metrics.best_practices_score)}`}>
                            {latestScan.scanData.lighthouse_metrics.best_practices_score}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Best Practices</div>
                        </div>
                        <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className={`text-xl font-bold ${getScoreColor(latestScan.scanData.lighthouse_metrics.seo_score)}`}>
                            {latestScan.scanData.lighthouse_metrics.seo_score}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">SEO</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {latestScan.scanData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PageSpeed Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Gauge className="w-5 h-5" />
                      <span>PageSpeed Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">First Contentful Paint</span>
                      <span className="text-sm font-medium">
                        {latestScan.scanData.pagespeed_metrics?.first_contentful_paint?.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Largest Contentful Paint</span>
                      <span className="text-sm font-medium">
                        {latestScan.scanData.pagespeed_metrics?.largest_contentful_paint?.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Speed Index</span>
                      <span className="text-sm font-medium">
                        {latestScan.scanData.pagespeed_metrics?.speed_index?.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">First Input Delay</span>
                      <span className="text-sm font-medium">
                        {latestScan.scanData.pagespeed_metrics?.first_input_delay?.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cumulative Layout Shift</span>
                      <span className="text-sm font-medium">
                        {latestScan.scanData.pagespeed_metrics?.cumulative_layout_shift?.toFixed(3)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* YSlow Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>YSlow Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">HTTP Requests</span>
                      <span className="text-sm font-medium">
                        {latestScan.scanData.yslow_metrics?.num_requests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Page Size</span>
                      <span className="text-sm font-medium">
                        {(latestScan.scanData.yslow_metrics?.page_size / 1024)?.toFixed(1)}KB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Load Time</span>
                      <span className="text-sm font-medium">
                        {latestScan.scanData.yslow_metrics?.load_time}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">CDN Usage</span>
                      <span className="text-sm font-medium">
                        {latestScan.scanData.yslow_metrics?.cdn_usage ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">GZIP Compression</span>
                      <span className="text-sm font-medium">
                        {latestScan.scanData.yslow_metrics?.gzip_compression ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {latestScan.recommendations && latestScan.recommendations.length > 0 ? (
              <div className="space-y-4">
                {Array.isArray(latestScan.recommendations) && latestScan.recommendations.map((rec: PerformanceRecommendation, index: number) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPriorityIcon(rec.priority)}
                          {getCategoryIcon(rec.category)}
                          <CardTitle className="text-base">{rec.title}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}>
                            {rec.priority}
                          </Badge>
                          <Badge variant="outline">
                            +{rec.impact} pts
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {rec.description}
                      </p>
                      {rec.resources && rec.resources.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Resources:</span>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {Array.isArray(rec.resources) && rec.resources.map((resource: string, idx: number) => (
                              <li key={idx} className="ml-2">• {resource}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Excellent Performance!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No performance recommendations at this time. Your website is well optimized.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {scanHistory && scanHistory.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Performance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(scanHistory) && scanHistory.map((scan: PerformanceScanResult) => (
                      <div key={scan.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">
                              {scan.scanTimestamp ? format(new Date(scan.scanTimestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {scanRegions.find(r => r.value === scan.scanRegion)?.label || scan.scanRegion}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">PageSpeed</p>
                            <p className={`font-bold ${getScoreColor(scan.pagespeedScore)}`}>
                              {scan.pagespeedScore}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">YSlow</p>
                            <p className={`font-bold ${getScoreColor(scan.yslowScore)}`}>
                              {scan.yslowScore}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Core Web Vitals</p>
                            {getCoreWebVitalsBadge(scan.coreWebVitalsGrade)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Scan History</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Run your first performance scan to start tracking performance over time.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* No scans yet */}
      {!latestScan && !isLoadingLatest && (
        <Card>
          <CardContent className="text-center py-12">
            <Gauge className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Performance Scanner Ready</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Run your first performance scan to analyze your website's speed and optimization using Google PageSpeed and Yahoo! YSlow rulesets.
            </p>
            <Button onClick={handleRunScan} disabled={runScanMutation.isPending}>
              {runScanMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Scan...
                </>
              ) : (
                <>
                  <Gauge className="w-4 h-4 mr-2" />
                  Run First Performance Scan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}