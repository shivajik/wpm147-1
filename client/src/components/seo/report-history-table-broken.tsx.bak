import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { ComprehensiveSeoReport } from "./comprehensive-seo-report";
import {
  Eye,
  Download,
  Share2,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Copy,
  CheckCircle,
  Loader2,
  FileText,
  BarChart3
} from "lucide-react";

interface SeoReport {
  id: number;
  generatedAt: string;
  overallScore: number;
  metrics: {
    technicalSeo: number;
    contentQuality: number;
    userExperience: number;
    mobileOptimization: number;
    siteSpeed: number;
    security: number;
  };
  issues: {
    critical: number;
    warnings: number;
    suggestions: number;
  };
  recommendations: string[];
  technicalFindings?: any;
}

interface ReportHistoryTableProps {
  websiteId: string;
  websiteName: string;
  reports?: SeoReport[];
}

export function ReportHistoryTable({ websiteId, websiteName, reports = [] }: ReportHistoryTableProps) {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<SeoReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState<number | null>(null);

  // Fetch report history from API
  const { data: reportHistory = [], isLoading, error } = useQuery<SeoReport[]>({
    queryKey: ['/api/websites', websiteId, 'seo-reports'],
    enabled: !!websiteId,
  });

  // Debug logging
  console.log('ReportHistoryTable Debug:', {
    websiteId,
    reports,
    reportHistory,
    isLoading,
    error,
    reportsIsArray: Array.isArray(reports),
    reportHistoryIsArray: Array.isArray(reportHistory)
  });

  // Use reports from props if available, otherwise use API data
  // Add safety check to ensure we always have an array
  const finalReports = Array.isArray(reports) && reports.length > 0 
    ? reports 
    : Array.isArray(reportHistory) 
      ? reportHistory 
      : [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreTrend = (currentScore: number, previousScore?: number) => {
    if (!previousScore) return null;
    const diff = currentScore - previousScore;
    if (diff > 0) return { icon: TrendingUp, color: "text-green-600", text: `+${diff}` };
    if (diff < 0) return { icon: TrendingDown, color: "text-red-600", text: `${diff}` };
    return { icon: Minus, color: "text-gray-500", text: "0" };
  };

  const handleViewReport = (report: SeoReport) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleDownloadPDF = async (report: SeoReport) => {
    try {
      setLoadingPdf(report.id);
      
      toast({
        title: "PDF Generation Started",
        description: `Generating PDF for report from ${new Date(report.generatedAt).toLocaleDateString()}`,
      });

      const result = await apiCall(`/api/websites/${websiteId}/seo-reports/${report.id}/pdf`, {
        method: 'POST',
      });

      if (result.success) {
        // Create a download link
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "PDF Ready",
          description: "Your SEO report has been downloaded successfully",
        });
      } else {
        throw new Error(result.message || "PDF generation failed");
      }
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPdf(null);
    }
  };

  const handleShareReport = async (report: SeoReport) => {
    try {
      const result = await apiCall(`/api/websites/${websiteId}/seo-reports/${report.id}/share`);
      
      if (result.success) {
        await navigator.clipboard.writeText(result.shareUrl);
        
        toast({
          title: "Link Copied",
          description: "Shareable report link has been copied to clipboard",
        });
      } else {
        throw new Error(result.message || "Failed to generate share link");
      }
    } catch (error: any) {
      toast({
        title: "Share Failed",
        description: error.message || "Unable to generate share link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Report History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading report history...</span>
            </div>
          ) : finalReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports generated yet</p>
              <p className="text-sm">Generate your first SEO analysis to see history here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Generated</TableHead>
                  <TableHead>Overall Score</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(finalReports) && finalReports.map((report, index) => {
                  const previousReport = finalReports[index + 1];
                  const trend = getScoreTrend(report.overallScore, previousReport?.overallScore);
                  
                  return (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {new Date(report.generatedAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.generatedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${getScoreColor(report.overallScore)}`}>
                            {report.overallScore}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="destructive" className="text-xs">
                            {report.issues.critical} Critical
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {report.issues.warnings} Warnings
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {trend && (
                          <div className={`flex items-center gap-1 ${trend.color}`}>
                            <trend.icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{trend.text}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDownloadPDF(report)}
                                className="flex items-center gap-2"
                                disabled={loadingPdf === report.id}
                              >
                                {loadingPdf === report.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleShareReport(report)}
                                className="flex items-center gap-2"
                              >
                                <Share2 className="h-4 w-4" />
                                Share Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report View Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              SEO Report - {websiteName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="detailed" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Detailed Analysis
                </TabsTrigger>
                <TabsTrigger value="comprehensive" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Comprehensive Report
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  {/* Report Header */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="text-lg font-semibold">Overall SEO Score</h3>
                      <p className="text-sm text-muted-foreground">
                        Generated on {new Date(selectedReport.generatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(selectedReport.overallScore)}`}>
                        {selectedReport.overallScore}
                      </div>
                      <p className="text-sm text-muted-foreground">out of 100</p>
                    </div>
                  </div>

                  {/* Quick Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{selectedReport.issues.critical}</div>
                      <p className="text-sm text-muted-foreground">Critical Issues</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{selectedReport.issues.warnings}</div>
                      <p className="text-sm text-muted-foreground">Warnings</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedReport.issues.suggestions}</div>
                      <p className="text-sm text-muted-foreground">Suggestions</p>
                    </div>
                  </div>

                  {/* Key Recommendations */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Key Recommendations</h4>
                    {selectedReport.recommendations && selectedReport.recommendations.length > 0 ? (
                      selectedReport.recommendations.slice(0, 5).map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No recommendations available</div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="detailed">
                <div className="space-y-6">
                  {/* Detailed metrics and findings would go here */}
                  <div className="p-8 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Detailed analysis view coming soon</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="comprehensive">
                <ComprehensiveSeoReport 
                  report={{
                    ...selectedReport,
                    reportData: selectedReport.technicalFindings || {},
                    generatedAt: selectedReport.generatedAt
                  }}
                  websiteName={websiteName}
                  websiteUrl="https://example.com" // This would come from the website data
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
                  </p>
                </div>
                <div className={`text-4xl font-bold ${getScoreColor(selectedReport.overallScore)}`}>
                  {selectedReport.overallScore}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedReport.metrics.technicalSeo}
                  </div>
                  <p className="text-sm text-muted-foreground">Technical SEO</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedReport.metrics.contentQuality}
                  </div>
                  <p className="text-sm text-muted-foreground">Content Quality</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedReport.metrics.userExperience}
                  </div>
                  <p className="text-sm text-muted-foreground">User Experience</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedReport.metrics.mobileOptimization}
                  </div>
                  <p className="text-sm text-muted-foreground">Mobile Optimization</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedReport.metrics.siteSpeed}
                  </div>
                  <p className="text-sm text-muted-foreground">Site Speed</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedReport.metrics.security}
                  </div>
                  <p className="text-sm text-muted-foreground">Security</p>
                </div>
              </div>

              {/* Issues Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg border-red-200 bg-red-50">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedReport.issues.critical}
                  </div>
                  <p className="text-sm text-red-600">Critical Issues</p>
                </div>
                <div className="text-center p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedReport.issues.warnings}
                  </div>
                  <p className="text-sm text-yellow-600">Warnings</p>
                </div>
                <div className="text-center p-4 border rounded-lg border-blue-200 bg-blue-50">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedReport.issues.suggestions}
                  </div>
                  <p className="text-sm text-blue-600">Suggestions</p>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Key Recommendations</h4>
                <div className="space-y-2">
                  {Array.isArray(selectedReport.recommendations) && selectedReport.recommendations.length > 0 ? 
                    selectedReport.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    )) : (
                      <div className="text-sm text-muted-foreground">No recommendations available</div>
                    )
                  }
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPDF(selectedReport)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShareReport(selectedReport)}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share Report
                </Button>
                <Button onClick={() => setShowReportModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}