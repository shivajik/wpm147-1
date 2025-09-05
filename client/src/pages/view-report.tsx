import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
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

interface BrandingData {
  footerText?: string;
}

interface WhiteLabelConfig {
  brandLogo?: string;
  brandName?: string;
  brandColor?: string;
  brandWebsite?: string;
  brandingData?: BrandingData;
  whiteLabelEnabled: boolean;
  canCustomize: boolean;
}

interface SEOReportData {
  id: number;
  websiteId: number;
  generatedAt: string;
  overallScore: number;
  metrics: {
    technicalSeo: number;
    contentQuality: number;
    userExperience: number;
    backlinks: number;
    onPageSeo: number;
  };
  issues: {
    critical: number;
    warnings: number;
    suggestions: number;
  };
  scanDuration: number;
  technicalFindings: {
    pagespeed: {
      desktop: number;
      mobile: number;
    };
    sslEnabled: boolean;
    metaTags: {
      missingTitle: number;
      missingDescription: number;
      duplicateTitle: number;
    };
    headingStructure: {
      missingH1: number;
      improperHierarchy: number;
    };
  };
}

interface ClientReportData {
  id: number;
  title: string;
  websiteIds?: number[];
  client?: {
    name?: string;
    email?: string;
    contactPerson?: string;
  };
  website: {
    id: number;
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
  seo?: SEOReportData;
  branding?: {
    whiteLabelEnabled: boolean;
    brandName?: string;
    brandLogo?: string;
    brandColor?: string;
    brandWebsite?: string;
    brandingData?: {
      footerText?: string;
    };
    footerText?: string;
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

  // Extract website ID from reportData or report
  const websiteId = reportData?.website?.id || (report?.websiteIds as number[])?.[0];

  // Fetch branding data if website ID is available
  const { data: brandingData, isLoading: isLoadingBranding } = useQuery<WhiteLabelConfig>({
    queryKey: [`/api/websites/${websiteId}/white-label`],
    enabled: !!websiteId,
    retry: 1
  });

  // Fetch SEO data from the real endpoint
  const { data: seoData, isLoading: isLoadingSEO } = useQuery<{success: boolean; report: SEOReportData}>({
    queryKey: [`/api/websites/${websiteId}/seo-reports`],
    enabled: !!websiteId,
    retry: 1
  });

  // Debug logging - Comprehensive console logs
  useEffect(() => {
    console.log('=== DEBUG: REPORT INFORMATION ===');
    console.log('Report ID:', reportId);
    console.log('Report basic data loaded:', !!report);
    console.log('Report data loaded:', !!reportData);
    console.log('Branding data loaded:', !!brandingData);
    console.log('Loading states:', { isLoading, isLoadingData, isLoadingBranding });
    console.log('Error states:', { error, dataError });
    
    if (report) {
      console.log('=== REPORT BASIC STRUCTURE ===');
      console.log('Report title:', report.title);
      console.log('Report status:', report.status);
      console.log('Client ID:', report.clientId);
      console.log('Website IDs:', report.websiteIds);
      console.log('Date range:', report.dateFrom, 'to', report.dateTo);
      console.log('Created at:', report.createdAt);
      console.log('Full report object:', report);
    }
    
    if (seoData) {
      console.log('=== SEO DATA STRUCTURE ===');
      console.log('SEO report:', seoData.report);
      console.log('Overall score:', seoData.report?.overallScore);
      console.log('Technical findings:', seoData.report?.technicalFindings);
    }
    
    if (reportData) {
      console.log('=== REPORT DATA STRUCTURE ===');
      console.log('Report data ID:', reportData.id);
      console.log('Report data title:', reportData.title);
      console.log('Client info:', reportData.client);
      console.log('Website info:', reportData.website);
      console.log('Website ID for branding:', reportData.website?.id);
      console.log('Overview data:', reportData.overview);
      console.log('Full report data object:', reportData);
    }
    
    if (brandingData) {
      console.log('=== BRANDING DATA STRUCTURE ===');
      console.log('Brand name:', brandingData.brandName);
      console.log('Brand logo:', brandingData.brandLogo);
      console.log('Brand color:', brandingData.brandColor);
      console.log('White label enabled:', brandingData.whiteLabelEnabled);
      console.log('Can customize:', brandingData.canCustomize);
      console.log('Branding data:', brandingData.brandingData);
      console.log('Full branding object:', brandingData);
    }
  }, [report, reportData, brandingData, reportId, isLoading, isLoadingData, isLoadingBranding, error, dataError]);

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
    const mockData = {
      id: parseInt(reportId || '1'),
      title: report?.title || 'Website Care Report',
      client: {
        name: 'Client',
        email: '',
        contactPerson: 'Client'
      },
      website: {
        id: websiteId || 0,
        name: 'Website',
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
        securityStatus: 'safe' as const,
        performanceScore: 0,
        seoScore: seoData?.report?.overallScore || 0,
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
          status: 'clean' as const,
          malware: 'clean' as const,
          webTrust: 'clean' as const,
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
      seo: seoData?.report || {
        id: 0,
        websiteId: websiteId || 0,
        generatedAt: new Date().toISOString(),
        overallScore: 0,
        metrics: {
          technicalSeo: 0,
          contentQuality: 0,
          userExperience: 0,
          backlinks: 0,
          onPageSeo: 0
        },
        issues: {
          critical: 0,
          warnings: 0,
          suggestions: 0
        },
        scanDuration: 0,
        technicalFindings: {
          pagespeed: {
            desktop: 0,
            mobile: 0
          },
          sslEnabled: false,
          metaTags: {
            missingTitle: 0,
            missingDescription: 0,
            duplicateTitle: 0
          },
          headingStructure: {
            missingH1: 0,
            improperHierarchy: 0
          }
        }
      },
      branding: brandingData ? {
        whiteLabelEnabled: brandingData.whiteLabelEnabled,
        brandName: brandingData.brandName,
        brandLogo: brandingData.brandLogo,
        brandColor: brandingData.brandColor,
        brandWebsite: brandingData.brandWebsite,
        brandingData: brandingData.brandingData,
        footerText: brandingData.brandingData?.footerText
      } : undefined
    };
    
    console.log('=== MOCK REPORT DATA STRUCTURE ===');
    console.log('Generated mock data for fallback:', mockData);
    
    return mockData;
  };

  // Combine report data with branding data
  const getEnhancedReportData = (): ClientReportData => {
    if (!reportData) {
      return getMockReportData();
    }

    // Extract branding data from the report data if available
    let extractedBranding: any = undefined;
    if (report?.reportData && typeof report.reportData === 'object' && 'websites' in report.reportData) {
      const websites = (report.reportData as any).websites;
      if (Array.isArray(websites) && websites.length > 0) {
        const websiteData = websites[0];
        if (websiteData?.brandName || websiteData?.brandLogo || websiteData?.brandColor) {
          extractedBranding = {
            whiteLabelEnabled: Boolean(websiteData.white_label_enabled),
            brandName: websiteData.brandName,
            brandLogo: websiteData.brandLogo,
            brandColor: websiteData.brandColor,
            brandWebsite: websiteData.brandWebsite,
            brandingData: websiteData.brandingData,
            footerText: websiteData.brandingData?.footerText
          };
        }
      }
    }

    // Use extracted branding as primary, fallback to fetched branding data
    const finalBranding = extractedBranding || (brandingData ? {
      whiteLabelEnabled: brandingData.whiteLabelEnabled,
      brandName: brandingData.brandName,
      brandLogo: brandingData.brandLogo,
      brandColor: brandingData.brandColor,
      brandWebsite: brandingData.brandWebsite,
      brandingData: brandingData.brandingData,
      footerText: brandingData.brandingData?.footerText
    } : undefined);

    const enhancedData = {
      ...reportData,
      branding: finalBranding,
      seo: seoData?.report || reportData.seo
    };

    console.log('=== ENHANCED REPORT DATA ===');
    console.log('Extracted branding from report:', extractedBranding);
    console.log('Fetched branding data:', brandingData);
    console.log('Final branding used:', finalBranding);
    console.log('Combined report data with branding:', enhancedData);
    
    return enhancedData;
  };

  // Show loading if any query is loading
  if (isLoading || isLoadingData || isLoadingBranding || isLoadingSEO) {
    return (
      <AppLayout title="Loading Report..." defaultOpen={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading report, branding, and SEO data...</p>
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
            reportData={getEnhancedReportData()} 
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