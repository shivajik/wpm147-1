import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Share2, 
  FileText,
  Loader2,
  Eye
} from 'lucide-react';
import AppLayout from '@/components/layout/app-layout';
import { EnhancedReportTemplate } from '@/components/reports/enhanced-report-template';
import type { ClientReport } from '@shared/schema';

interface ClientReportData {
  id: number;
  title: string;
  client?: {
    name?: string;
    email?: string;
    contactPerson?: string;
  };
  website: {
    name: string;
    url: string;
    ipAddress?: string;
    wordpressVersion?: string;
  };
  dateFrom: string;
  dateTo: string;
  reportType: string;
  overview: {
    updatesPerformed: number;
    backupsCreated: number;
    uptimePercentage: number;
    analyticsChange: number;
    securityStatus: 'safe' | 'warning' | 'critical';
    performanceScore: number;
    seoScore: number;
    keywordsTracked: number;
  };
  customWork?: Array<{
    title: string;
    description: string;
    date: string;
  }>;
  updates: {
    total: number;
    plugins: Array<{
      name: string;
      versionFrom: string;
      versionTo: string;
      date: string;
    }>;
    themes: Array<{
      name: string;
      versionFrom: string;
      versionTo: string;
      date: string;
    }>;
    core?: Array<{
      versionFrom: string;
      versionTo: string;
      date: string;
    }>;
  };
  backups: {
    total: number;
    totalAvailable: number;
    latest: {
      date: string;
      size: string;
      wordpressVersion: string;
      activeTheme: string;
      activePlugins: number;
      publishedPosts: number;
      approvedComments: number;
    };
  };
  uptime: {
    percentage: number;
    last24h: number;
    last7days: number;
    last30days: number;
    incidents: Array<{
      date: string;
      reason: string;
      duration: string;
    }>;
  };
  analytics: {
    changePercentage: number;
    sessions: Array<{
      date: string;
      count: number;
    }>;
  };
  security: {
    totalScans: number;
    lastScan: {
      date: string;
      status: 'clean' | 'issues';
      malware: 'clean' | 'infected';
      webTrust: 'clean' | 'warning';
      vulnerabilities: number;
    };
    scanHistory: Array<{
      date: string;
      malware: 'clean' | 'infected';
      vulnerabilities: 'clean' | 'warning';
      webTrust: 'clean' | 'warning';
    }>;
  };
  performance: {
    totalChecks: number;
    lastScan: {
      date: string;
      pageSpeedScore: number;
      pageSpeedGrade: string;
      ysloScore: number;
      ysloGrade: string;
      loadTime: number;
    };
    history: Array<{
      date: string;
      loadTime: number;
      pageSpeedScore: number;
      ysloScore: number;
    }>;
  };
  seo: {
    visibilityChange: number;
    competitors: number;
    keywords: Array<{
      keyword: string;
      currentRank: number;
      previousRank: number;
      page?: string;
    }>;
    topRankKeywords: number;
    firstPageKeywords: number;
    visibility: number;
    topCompetitors: Array<{
      domain: string;
      visibilityScore: number;
    }>;
  };
}

export default function ViewReport() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const reportId = params.id;
  const [isPrintMode, setIsPrintMode] = useState(false);

  const { data: report, isLoading, error } = useQuery<ClientReport>({
    queryKey: [`/api/client-reports/${reportId}`],
    enabled: !!reportId,
  });

  const { data: reportData, isLoading: isLoadingData, error: dataError } = useQuery<ClientReportData>({
    queryKey: [`/api/client-reports/${reportId}/data`],
    enabled: !!reportId && !!report,
    retry: 1
  });

  // Debug logging
  console.log('Debug info:', { 
    reportId, 
    report: !!report, 
    reportData: !!reportData, 
    isLoadingData, 
    dataError 
  });

  const handleDownloadPDF = () => {
    const token = localStorage.getItem('auth_token');
    if (token && reportId) {
      window.open(`/api/client-reports/${reportId}/pdf?token=${token}`, '_blank');
    }
  };

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
  };

  const handleShare = async () => {
    if (navigator.share && reportId) {
      try {
        await navigator.share({
          title: report?.title || 'Client Report',
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        alert('Report URL copied to clipboard!');
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Report URL copied to clipboard!');
    }
  };

  // Fallback data structure with empty/null values - no fake data
  const getMockReportData = (): ClientReportData => {
    return {
      id: parseInt(reportId || '1'),
      title: report?.title || 'Website Care Report',
      client: {
        name: report?.clientName || 'Client',
        email: '',
        contactPerson: report?.clientName || 'Client'
      },
      website: {
        name: report?.websiteName || 'Website',
        url: '',
        ipAddress: '',
        wordpressVersion: ''
      },
      dateFrom: report?.dateFrom ? new Date(report.dateFrom).toISOString() : new Date().toISOString(),
      dateTo: report?.dateTo ? new Date(report.dateTo).toISOString() : new Date().toISOString(),
      reportType: 'Website Care Report',
      overview: {
        updatesPerformed: 0,
        backupsCreated: 0,
        uptimePercentage: 0,
        analyticsChange: 0,
        securityStatus: 'safe',
        performanceScore: 0,
        seoScore: 0,
        keywordsTracked: 0
      },
      customWork: [],
      updates: {
        total: 0,
        plugins: [],
        themes: [],
        core: []
      },
      backups: {
        total: 0,
        totalAvailable: 0,
        latest: {
          date: '',
          size: '',
          wordpressVersion: '',
          activeTheme: '',
          activePlugins: 0,
          publishedPosts: 0,
          approvedComments: 0
        }
      },
      uptime: {
        percentage: 0,
        last24h: 0,
        last7days: 0,
        last30days: 0,
        incidents: []
      },
      analytics: {
        changePercentage: 0,
        sessions: []
      },
      security: {
        totalScans: 0,
        lastScan: {
          date: '',
          status: 'clean',
          malware: 'clean',
          webTrust: 'clean',
          vulnerabilities: 0
        },
        scanHistory: []
      },
      performance: {
        totalChecks: 0,
        lastScan: {
          date: '',
          pageSpeedScore: 0,
          pageSpeedGrade: '',
          ysloScore: 0,
          ysloGrade: '',
          loadTime: 0
        },
        history: []
      },
      seo: {
        visibilityChange: 0,
        competitors: 0,
        keywords: [],
        topRankKeywords: 0,
        firstPageKeywords: 0,
        visibility: 0,
        topCompetitors: []
      }
    };
  };

  // Show loading if either query is loading
  if (isLoading || isLoadingData) {
    return (
      <AppLayout title="Loading Report..." defaultOpen={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading report...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !report) {
    return (
      <AppLayout title="Report Not Found" defaultOpen={false}>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Report Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The report you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => setLocation('/client-reports')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Note: Remove the blocking check for reportData to allow fallback to mock data

  return (
    <AppLayout title={`Report: ${report.title}`} defaultOpen={false}>
      <div className="container mx-auto px-4 py-6">
        {/* Header Actions */}
        <div className={`${isPrintMode ? 'print:hidden' : ''} flex items-center justify-between mb-6`}>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/client-reports')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{report.title}</h1>
              <p className="text-muted-foreground">
                Created on {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown date'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={
              report.status === 'generated' ? 'default' : 
              report.status === 'sent' ? 'secondary' : 
              'outline'
            }>
              {report.status}
            </Badge>
            
            <Button 
              variant="outline" 
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            
            <Button 
              onClick={handleDownloadPDF}
              disabled={report.status === 'draft'}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <EnhancedReportTemplate 
            reportData={reportData || getMockReportData()} 
            isPrintMode={isPrintMode}
          />
        </div>

        {/* Footer */}
        <div className={`${isPrintMode ? 'print:hidden' : ''} mt-8 text-center text-muted-foreground`}>
          <p>Generated on {new Date().toLocaleDateString()} • WordPress Maintenance Dashboard</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          @page {
            margin: 0.5in;
            size: A4;
          }
          
          .container {
            max-width: none !important;
          }
          
          .rounded-lg {
            border-radius: 0 !important;
          }
          
          .shadow-sm {
            box-shadow: none !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}