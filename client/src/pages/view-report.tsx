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
  client: {
    name: string;
    email: string;
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

  // Generate mock data for demonstration if no data is available
  const getMockReportData = (): ClientReportData => {
    return {
      id: parseInt(reportId || '1'),
      title: report?.title || 'Website Care Report - Premium',
      client: {
        name: 'Commander Harken',
        email: 'commander@alliance.logistics',
        contactPerson: 'Commander Harken'
      },
      website: {
        name: 'Alliance Logistics',
        url: 'http://demo4.managewp-demo.com/site1/',
        ipAddress: '72.14.189.129',
        wordpressVersion: '5.0.6'
      },
      dateFrom: report?.dateFrom ? new Date(report.dateFrom).toISOString() : '2024-08-24T00:00:00Z',
      dateTo: report?.dateTo ? new Date(report.dateTo).toISOString() : '2024-09-23T23:59:59Z',
      reportType: 'Premium',
      overview: {
        updatesPerformed: 3,
        backupsCreated: 88,
        uptimePercentage: 100.000,
        analyticsChange: 50,
        securityStatus: 'safe',
        performanceScore: 87,
        seoScore: 0,
        keywordsTracked: 1
      },
      customWork: [
        {
          title: 'AdWords campaign',
          description: 'Optimizing campaign to make sure we hit our ROI targets.',
          date: '2024-09-11T00:00:00Z'
        },
        {
          title: 'Custom Work Order 1',
          description: 'September focus on site optimization.',
          date: '2024-09-15T00:00:00Z'
        }
      ],
      updates: {
        total: 3,
        plugins: [
          {
            name: 'All In One SEO Pack',
            versionFrom: '3.2.5',
            versionTo: '3.2.7',
            date: '2024-09-12T00:00:00Z'
          },
          {
            name: 'All In One SEO Pack',
            versionFrom: '3.2.4',
            versionTo: '3.2.5',
            date: '2024-09-04T00:00:00Z'
          }
        ],
        themes: [
          {
            name: 'Twenty Sixteen',
            versionFrom: '1.7',
            versionTo: '2.0',
            date: '2024-09-17T00:00:00Z'
          }
        ]
      },
      backups: {
        total: 30,
        totalAvailable: 88,
        latest: {
          date: '2024-09-23T01:04:00Z',
          size: '96.01MB',
          wordpressVersion: '5.0.6',
          activeTheme: 'Twenty Fourteen v2.4',
          activePlugins: 5,
          publishedPosts: 39,
          approvedComments: 30
        }
      },
      uptime: {
        percentage: 100.000,
        last24h: 100,
        last7days: 100,
        last30days: 100,
        incidents: [
          {
            date: '2024-01-25T00:00:00Z',
            reason: '-',
            duration: '240d 23h'
          }
        ]
      },
      analytics: {
        changePercentage: 50,
        sessions: []
      },
      security: {
        totalScans: 31,
        lastScan: {
          date: '2024-09-23T00:37:00Z',
          status: 'clean',
          malware: 'clean',
          webTrust: 'clean',
          vulnerabilities: 0
        },
        scanHistory: [
          {
            date: '2024-09-23T00:37:00Z',
            malware: 'clean',
            vulnerabilities: 'clean',
            webTrust: 'clean'
          },
          {
            date: '2024-09-22T07:30:00Z',
            malware: 'clean',
            vulnerabilities: 'clean',
            webTrust: 'clean'
          },
          {
            date: '2024-09-21T05:07:00Z',
            malware: 'clean',
            vulnerabilities: 'clean',
            webTrust: 'clean'
          },
          {
            date: '2024-09-20T07:00:00Z',
            malware: 'clean',
            vulnerabilities: 'clean',
            webTrust: 'clean'
          },
          {
            date: '2024-09-19T02:30:00Z',
            malware: 'clean',
            vulnerabilities: 'clean',
            webTrust: 'clean'
          }
        ]
      },
      performance: {
        totalChecks: 30,
        lastScan: {
          date: '2024-09-23T05:41:00Z',
          pageSpeedScore: 87,
          pageSpeedGrade: 'B',
          ysloScore: 76,
          ysloGrade: 'C',
          loadTime: 1.26
        },
        history: [
          {
            date: '2024-09-23T05:41:00Z',
            loadTime: 1.26,
            pageSpeedScore: 87,
            ysloScore: 76
          },
          {
            date: '2024-09-22T07:44:00Z',
            loadTime: 1.25,
            pageSpeedScore: 87,
            ysloScore: 76
          },
          {
            date: '2024-09-21T05:21:00Z',
            loadTime: 1.38,
            pageSpeedScore: 87,
            ysloScore: 76
          },
          {
            date: '2024-09-20T03:06:00Z',
            loadTime: 1.43,
            pageSpeedScore: 87,
            ysloScore: 76
          },
          {
            date: '2024-09-19T05:37:00Z',
            loadTime: 1.25,
            pageSpeedScore: 87,
            ysloScore: 76
          }
        ]
      },
      seo: {
        visibilityChange: 0,
        competitors: 9,
        keywords: [
          {
            keyword: 'backup',
            currentRank: 0,
            previousRank: 0,
            page: '-'
          }
        ],
        topRankKeywords: 0,
        firstPageKeywords: 0,
        visibility: 0,
        topCompetitors: [
          {
            domain: 'searchdatabackup.techtarget.com',
            visibilityScore: 85.00
          },
          {
            domain: 'www.techopedia.com',
            visibilityScore: 70.00
          },
          {
            domain: 'dictionary.cambridge.org',
            visibilityScore: 64.00
          },
          {
            domain: 'www.computerhope.com',
            visibilityScore: 57.00
          },
          {
            domain: 'www.netapp.com',
            visibilityScore: 30.34
          },
          {
            domain: 'www.backblaze.com',
            visibilityScore: 27.42
          }
        ]
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

  if (!reportData) {
    return (
      <AppLayout title="Loading Report Data..." defaultOpen={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading report data...</p>
            {dataError && (
              <p className="text-red-500 mt-2">Error: {(dataError as any)?.message || 'Failed to load report data'}</p>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

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
            reportData={reportData!} 
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