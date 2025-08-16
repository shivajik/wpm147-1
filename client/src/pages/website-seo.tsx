import { useParams, useLocation } from "wouter";
import type { Website } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { isValidWebsiteId, InvalidWebsiteIdPage } from "@/lib/website-validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  RefreshCw, 
  Globe,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  History,
  Eye
} from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import { MaintenanceSidebar } from "@/components/maintenance/maintenance-sidebar";
import { useToast } from '@/hooks/use-toast';
import { apiCall } from '@/lib/queryClient';
import { useState } from "react";
import { SeoAnalysisProgress } from "@/components/seo/seo-analysis-progress";
import { ReportHistoryTable } from "@/components/seo/report-history-table";

export default function WebsiteSEO() {
  const params = useParams();
  const websiteId = params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Validate website ID
  if (!isValidWebsiteId(websiteId)) {
    return <InvalidWebsiteIdPage websiteId={websiteId} />;
  }

  const { data: website, isLoading } = useQuery<Website>({
    queryKey: ['/api/websites', websiteId],
    enabled: !!websiteId,
  });

  // Fetch real SEO reports only
  const { data: seoReports, isLoading: reportsLoading, refetch: refetchReports } = useQuery<any[]>({
    queryKey: ['/api/websites', websiteId, 'seo-reports'],
    enabled: !!websiteId,
  });

  // Get the latest report if available
  const latestReport = seoReports && Array.isArray(seoReports) && seoReports.length > 0 ? seoReports[0] : null;

  const handleStartAnalysis = async () => {
    if (!websiteId) return;
    
    setIsRunningAnalysis(true);
    setShowProgressModal(true);
    
    try {
      await apiCall(`/api/websites/${websiteId}/seo-analysis`, {
        method: 'POST',
      });
      
      // Poll for completion - the analysis runs asynchronously 
      const pollInterval = setInterval(async () => {
        try {
          const updatedReports = await refetchReports();
          if (updatedReports.data && updatedReports.data.length > 0) {
            const newestReport = updatedReports.data[0];
            if (newestReport.scanStatus === 'completed') {
              clearInterval(pollInterval);
              setIsRunningAnalysis(false);
              
              toast({
                title: "SEO Analysis Completed",
                description: `Analysis completed with an overall score of ${newestReport.overallScore}/100`,
              });
              
              setTimeout(() => {
                setShowProgressModal(false);
              }, 2000);
            }
          }
        } catch (error) {
          console.error('Error polling for reports:', error);
        }
      }, 3000); // Poll every 3 seconds
      
      // Set timeout to stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setIsRunningAnalysis(false);
        setShowProgressModal(false);
      }, 300000);
      
    } catch (error) {
      console.error('Error starting analysis:', error);
      setIsRunningAnalysis(false);
      setShowProgressModal(false);
      toast({
        title: "Analysis Failed",
        description: "Failed to start SEO analysis. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openReportInNewWindow = (reportId: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please refresh the page and log in again to view reports.",
        variant: "destructive"
      });
      return;
    }
    
    const reportUrl = `${window.location.origin}/seo-report/${reportId}?token=${encodeURIComponent(token)}`;
    window.open(reportUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-screen">
          <MaintenanceSidebar 
            websiteId={parseInt(websiteId || '0')}
            websiteName="Loading..."
            websiteUrl=""
          />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!website) {
    return (
      <AppLayout>
        <div className="flex h-screen">
          <MaintenanceSidebar 
            websiteId={parseInt(websiteId || '0')}
            websiteName="Unknown"
            websiteUrl=""
          />
          <div className="flex-1 p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Website not found</h1>
              <p className="text-gray-600 dark:text-gray-400">The requested website could not be found.</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-screen">
        <MaintenanceSidebar 
          websiteId={parseInt(websiteId || '0')}
          websiteName={website.name}
          websiteUrl={website.url}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Search className="h-8 w-8 text-blue-600" />
                  SEO Analysis
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Analyze and optimize the SEO performance of {website.name}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleStartAnalysis} 
                  disabled={isRunningAnalysis}
                  data-testid="button-start-analysis"
                >
                  {isRunningAnalysis ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Start New Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Website Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Website Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Website Name</p>
                    <p className="text-lg font-semibold">{website.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</p>
                    <a 
                      href={website.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {website.url}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Analysis</p>
                    <p className="text-lg font-semibold">
                      {latestReport ? formatDate(latestReport.generatedAt) : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Latest Report Summary */}
            {latestReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Latest SEO Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${getScoreColor(latestReport.overallScore)}`}>
                        {latestReport.overallScore}/100
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Overall SEO Score</p>
                      <Progress value={latestReport.overallScore} className="h-3" />
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Status</p>
                      <Badge 
                        variant={latestReport.scanStatus === 'completed' ? 'default' : 'secondary'}
                        className="mb-3"
                      >
                        {latestReport.scanStatus === 'completed' ? 'Completed' : 'Processing'}
                      </Badge>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(latestReport.generatedAt)}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Key Metrics</p>
                      <div className="space-y-1">
                        {latestReport.reportData?.detailedFindings && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                Critical Issues
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                {latestReport.reportData.detailedFindings.criticalIssues?.length || 0}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                Positive Findings
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {latestReport.reportData.detailedFindings.positiveFindings?.length || 0}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      <Button 
                        onClick={() => openReportInNewWindow(latestReport.id)}
                        className="w-full"
                        data-testid="button-view-report"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Reports Message */}
            {!latestReport && !reportsLoading && (
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No SEO Analysis Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                    Start your first SEO analysis to get comprehensive insights about your website's 
                    search engine optimization performance.
                  </p>
                  <Button 
                    onClick={handleStartAnalysis} 
                    disabled={isRunningAnalysis}
                    size="lg"
                    data-testid="button-first-analysis"
                  >
                    {isRunningAnalysis ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Starting Analysis...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Start SEO Analysis
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Report History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-600" />
                  Report History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading reports...</span>
                  </div>
                ) : (
                  <ReportHistoryTable 
                    reports={seoReports || []} 
                    onViewReport={openReportInNewWindow}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Progress Modal */}
      {showProgressModal && websiteId && (
        <SeoAnalysisProgress 
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          websiteId={websiteId}
          websiteName={website.name}
          onComplete={(report) => {
            refetchReports();
            setShowProgressModal(false);
          }}
        />
      )}
    </AppLayout>
  );
}