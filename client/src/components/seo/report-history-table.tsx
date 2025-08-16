import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import {
  Eye,
  Download,
  Share2,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Copy,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface SeoReport {
  id: number;
  websiteId?: number;
  generatedAt: string;
  overallScore: number;
  scanStatus?: string;
  scanDuration?: number;
  metrics?: {
    technicalSeo: number;
    contentQuality: number;
    userExperience: number;
    backlinks: number;
    onPageSeo: number;
  };
  issues?: {
    critical: number;
    warnings: number;
    suggestions: number;
  };
  recommendations?: string[];
  reportData?: any;
}

interface ReportHistoryTableProps {
  reports: SeoReport[];
  onViewReport: (reportId: string) => void;
}

export function ReportHistoryTable({ reports = [], onViewReport }: ReportHistoryTableProps) {
  const { toast } = useToast();
  const [loadingPdf, setLoadingPdf] = useState<number | null>(null);
  const [copiedReportId, setCopiedReportId] = useState<number | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getScoreTrend = (currentScore: number, previousScore?: number) => {
    if (!previousScore) return null;
    
    if (currentScore > previousScore) {
      return {
        icon: TrendingUp,
        text: `+${currentScore - previousScore}`,
        color: "text-green-600"
      };
    } else if (currentScore < previousScore) {
      return {
        icon: TrendingDown,
        text: `${currentScore - previousScore}`,
        color: "text-red-600"
      };
    } else {
      return {
        icon: Minus,
        text: "No change",
        color: "text-gray-600"
      };
    }
  };

  const handleViewReport = (report: SeoReport) => {
    onViewReport(report.id.toString());
  };

  const handleDownloadPDF = async (report: SeoReport) => {
    setLoadingPdf(report.id);
    try {
      // Call PDF generation endpoint
      const response = await apiCall('POST', `/api/websites/${report.websiteId}/seo-reports/${report.id}/pdf`);
      
      if (response.success && response.pdfUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = response.pdfUrl;
        link.download = `seo-report-${report.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "PDF Downloaded",
          description: "The SEO report has been downloaded successfully.",
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the PDF report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingPdf(null);
    }
  };

  const handleShareReport = async (report: SeoReport) => {
    const reportUrl = `${window.location.origin}/seo-report/${report.id}`;
    
    try {
      await navigator.clipboard.writeText(reportUrl);
      setCopiedReportId(report.id);
      
      toast({
        title: "Link Copied",
        description: "The report link has been copied to your clipboard.",
      });
      
      setTimeout(() => setCopiedReportId(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy the link. Please try again.",
        variant: "destructive"
      });
    }
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

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">No SEO reports found</div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Start your first SEO analysis to see reports here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date Generated</TableHead>
            <TableHead>Overall Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Critical Issues</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report, index) => {
            const previousReport = reports[index + 1];
            const trend = getScoreTrend(report.overallScore, previousReport?.overallScore);
            
            return (
              <TableRow key={report.id} className="group">
                <TableCell className="font-medium">
                  {formatDate(report.generatedAt)}
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={getScoreBadgeVariant(report.overallScore)}
                      className="px-2 py-1"
                    >
                      {report.overallScore}/100
                    </Badge>
                    {trend && (
                      <div className={`flex items-center gap-1 ${trend.color}`}>
                        <trend.icon className="h-3 w-3" />
                        <span className="text-xs">{trend.text}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant={report.scanStatus === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {report.scanStatus === 'completed' ? 'Completed' : report.scanStatus || 'Unknown'}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-red-600 font-medium">
                      {report.issues?.critical || 0}
                    </span>
                    <span className="text-xs text-gray-500">critical</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {report.scanDuration ? `${Math.round(report.scanDuration / 1000)}s` : 'N/A'}
                  </span>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(report)}
                      data-testid={`button-view-report-${report.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewReport(report)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Window
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareReport(report)}>
                          {copiedReportId === report.id ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(report)}>
                          {loadingPdf === report.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </>
                          )}
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
      
      {reports.length > 5 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing latest {Math.min(10, reports.length)} reports
          </p>
        </div>
      )}
    </div>
  );
}