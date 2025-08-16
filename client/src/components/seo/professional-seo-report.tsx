import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Globe,
  Smartphone,
  Clock,
  Search,
  FileText,
  Image,
  Link2,
  Target,
  BarChart3,
  TrendingUp,
  Eye,
  Accessibility,
  Share2,
  Download,
  ExternalLink,
  Info
} from "lucide-react";

interface ProfessionalSeoReportProps {
  report: any;
  websiteName: string;
  websiteUrl: string;
}

export function ProfessionalSeoReport({ report, websiteName, websiteUrl }: ProfessionalSeoReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (score >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Extract technical findings from report data
  const technicalData = report.reportData || {};
  
  const technicalChecks = [
    {
      category: "Basic SEO",
      checks: [
        {
          name: "Title Tag",
          status: technicalData.title ? "pass" : "fail",
          description: technicalData.title ? `Title: "${technicalData.title.substring(0, 60)}..."` : "Missing title tag",
          recommendation: technicalData.title ? "Title tag present" : "Add a descriptive title tag (30-60 characters)"
        },
        {
          name: "Meta Description",
          status: technicalData.metaDescription ? "pass" : "fail", 
          description: technicalData.metaDescription ? `Description: "${technicalData.metaDescription.substring(0, 80)}..."` : "Missing meta description",
          recommendation: technicalData.metaDescription ? "Meta description present" : "Add a compelling meta description (150-160 characters)"
        },
        {
          name: "H1 Tag",
          status: technicalData.h1Tags?.length > 0 ? "pass" : "fail",
          description: technicalData.h1Tags?.length > 0 ? `H1: "${technicalData.h1Tags[0]}"` : "No H1 tag found",
          recommendation: technicalData.h1Tags?.length === 1 ? "Proper H1 tag usage" : technicalData.h1Tags?.length > 1 ? "Use only one H1 tag per page" : "Add an H1 tag to the page"
        }
      ]
    },
    {
      category: "Technical SEO",
      checks: [
        {
          name: "SSL Certificate",
          status: technicalData.technicalSeo?.hasSSL ? "pass" : "fail",
          description: technicalData.technicalSeo?.hasSSL ? "SSL certificate is active" : "No SSL certificate detected",
          recommendation: technicalData.technicalSeo?.hasSSL ? "SSL properly configured" : "Install and configure SSL certificate"
        },
        {
          name: "Robots.txt",
          status: technicalData.technicalSeo?.hasRobotsTxt ? "pass" : "warning",
          description: technicalData.technicalSeo?.hasRobotsTxt ? "Robots.txt file found" : "Robots.txt file not found",
          recommendation: technicalData.technicalSeo?.hasRobotsTxt ? "Robots.txt is configured" : "Create a robots.txt file to guide search engines"
        },
        {
          name: "XML Sitemap",
          status: technicalData.technicalSeo?.hasSitemap ? "pass" : "warning",
          description: technicalData.technicalSeo?.hasSitemap ? "XML sitemap detected" : "XML sitemap not found",
          recommendation: technicalData.technicalSeo?.hasSitemap ? "Sitemap is available" : "Generate and submit an XML sitemap"
        },
        {
          name: "Mobile Responsiveness",
          status: technicalData.technicalSeo?.isResponsive ? "pass" : "fail",
          description: technicalData.technicalSeo?.isResponsive ? "Site is mobile-responsive" : "Site is not mobile-responsive",
          recommendation: technicalData.technicalSeo?.isResponsive ? "Mobile optimization is good" : "Implement responsive design for mobile devices"
        }
      ]
    },
    {
      category: "Content Analysis",
      checks: [
        {
          name: "Content Length",
          status: (technicalData.pageContent?.wordCount || 0) > 300 ? "pass" : "warning",
          description: `Word count: ${technicalData.pageContent?.wordCount || 0} words`,
          recommendation: (technicalData.pageContent?.wordCount || 0) > 300 ? "Good content length" : "Consider adding more content (300+ words recommended)"
        },
        {
          name: "Image Alt Tags",
          status: (technicalData.images?.missingAlt || 0) === 0 ? "pass" : "warning",
          description: `${technicalData.images?.missingAlt || 0} images missing alt text`,
          recommendation: (technicalData.images?.missingAlt || 0) === 0 ? "All images have alt text" : `Add alt text to ${technicalData.images?.missingAlt} images`
        },
        {
          name: "Internal Links",
          status: (technicalData.links?.internal || 0) > 0 ? "pass" : "warning",
          description: `${technicalData.links?.internal || 0} internal links found`,
          recommendation: (technicalData.links?.internal || 0) > 3 ? "Good internal linking" : "Add more internal links to improve site navigation"
        }
      ]
    },
    {
      category: "Performance",
      checks: [
        {
          name: "Page Load Time",
          status: (technicalData.performance?.loadTime || 0) < 3000 ? "pass" : (technicalData.performance?.loadTime || 0) < 5000 ? "warning" : "fail",
          description: `Load time: ${((technicalData.performance?.loadTime || 0) / 1000).toFixed(2)}s`,
          recommendation: (technicalData.performance?.loadTime || 0) < 3000 ? "Good page speed" : "Optimize images and reduce server response time"
        },
        {
          name: "Image Optimization",
          status: (technicalData.images?.total || 0) > 0 ? "warning" : "pass",
          description: `${technicalData.images?.total || 0} images detected`,
          recommendation: "Ensure all images are optimized and compressed"
        }
      ]
    },
    {
      category: "Social Media",
      checks: [
        {
          name: "Open Graph Tags",
          status: technicalData.social?.hasOpenGraph ? "pass" : "warning",
          description: technicalData.social?.hasOpenGraph ? "Open Graph tags present" : "Open Graph tags missing",
          recommendation: technicalData.social?.hasOpenGraph ? "Social sharing optimized" : "Add Open Graph meta tags for better social sharing"
        },
        {
          name: "Twitter Cards",
          status: technicalData.social?.hasTwitterCard ? "pass" : "warning",
          description: technicalData.social?.hasTwitterCard ? "Twitter Card tags present" : "Twitter Card tags missing",
          recommendation: technicalData.social?.hasTwitterCard ? "Twitter sharing optimized" : "Add Twitter Card meta tags"
        }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "pass": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "fail": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "pass": return "text-green-600";
      case "warning": return "text-yellow-600"; 
      case "fail": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pass": return <Badge className="bg-green-100 text-green-800 border-green-200">Pass</Badge>;
      case "warning": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>;
      case "fail": return <Badge className="bg-red-100 text-red-800 border-red-200">Fail</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 bg-white dark:bg-gray-900">
      {/* Report Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-3xl font-bold">SEO Analysis Report</CardTitle>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{websiteName}</h2>
            <p className="text-blue-600 flex items-center justify-center gap-1">
              <Globe className="h-4 w-4" />
              {websiteUrl}
            </p>
            <p className="text-sm text-muted-foreground">Generated on {formatDate(report.generatedAt)}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(report.overallScore)}`}>
                {report.overallScore}/100
              </div>
              <p className="text-sm text-muted-foreground mb-3">Overall SEO Score</p>
              <Progress value={report.overallScore} className="h-3" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Technical SEO</span>
                <div className="flex items-center gap-2">
                  <Progress value={report.technicalScore || 0} className="w-16 h-2" />
                  <span className="text-sm font-medium">{report.technicalScore || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Content Quality</span>
                <div className="flex items-center gap-2">
                  <Progress value={report.contentScore || 0} className="w-16 h-2" />
                  <span className="text-sm font-medium">{report.contentScore || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">User Experience</span>
                <div className="flex items-center gap-2">
                  <Progress value={report.userExperienceScore || 0} className="w-16 h-2" />
                  <span className="text-sm font-medium">{report.userExperienceScore || 0}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Critical Issues</span>
                </div>
                <Badge variant="destructive">{report.criticalIssues || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Warnings</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">{report.warnings || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Opportunities</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">{report.notices || 0}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Detailed Analysis
        </h3>
        
        {technicalChecks.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.checks.map((check, checkIndex) => (
                  <div key={checkIndex} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(check.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{check.name}</h4>
                        {getStatusBadge(check.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{check.description}</p>
                      <p className="text-xs text-blue-600">{check.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Priority Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.recommendations?.slice(0, 10).map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed">{recommendation}</p>
              </div>
            )) || (
              <p className="text-muted-foreground text-center py-4">No specific recommendations available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Footer */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Share Report
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Analysis completed in {((report.scanDuration || 0) / 1000).toFixed(1)} seconds</p>
              <p>Next recommended scan: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}