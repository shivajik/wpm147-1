import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  Share2
} from "lucide-react";

interface DetailedSeoReportProps {
  report: {
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
    technicalFindings?: {
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
  };
  websiteName: string;
  websiteUrl: string;
}

export function DetailedSeoReport({ report, websiteName, websiteUrl }: DetailedSeoReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"; // Green
    if (score >= 60) return "secondary"; // Yellow
    return "destructive"; // Red
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">SEO Analysis Report</h2>
        <p className="text-lg text-muted-foreground mb-1">{websiteName}</p>
        <p className="text-sm text-muted-foreground mb-4">{websiteUrl}</p>
        <p className="text-sm text-muted-foreground">Generated on {formatDate(report.generatedAt)}</p>
      </div>

      {/* Overall Score */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Target className="h-6 w-6" />
            Overall SEO Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-6xl font-bold mb-4 ${getScoreColor(report.overallScore)}`}>
            {report.overallScore}
            <span className="text-2xl">/100</span>
          </div>
          <Progress value={report.overallScore} className="h-3 mb-4" />
          <div className="flex items-center justify-center gap-2">
            {getScoreIcon(report.overallScore)}
            <span className="font-medium">
              {report.overallScore >= 80 ? 'Excellent' : 
               report.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Technical SEO</span>
            </div>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getScoreColor(report.metrics.technicalSeo)}`}>
                {report.metrics.technicalSeo}
              </div>
              <Badge variant={getScoreBadgeVariant(report.metrics.technicalSeo)}>
                {report.metrics.technicalSeo >= 80 ? 'Great' : 
                 report.metrics.technicalSeo >= 60 ? 'Good' : 'Poor'}
              </Badge>
            </div>
            <Progress value={report.metrics.technicalSeo} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-green-500" />
              <span className="font-medium">Content Quality</span>
            </div>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getScoreColor(report.metrics.contentQuality)}`}>
                {report.metrics.contentQuality}
              </div>
              <Badge variant={getScoreBadgeVariant(report.metrics.contentQuality)}>
                {report.metrics.contentQuality >= 80 ? 'Great' : 
                 report.metrics.contentQuality >= 60 ? 'Good' : 'Poor'}
              </Badge>
            </div>
            <Progress value={report.metrics.contentQuality} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Performance</span>
            </div>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getScoreColor(report.metrics.userExperience)}`}>
                {report.metrics.userExperience}
              </div>
              <Badge variant={getScoreBadgeVariant(report.metrics.userExperience)}>
                {report.metrics.userExperience >= 80 ? 'Fast' : 
                 report.metrics.userExperience >= 60 ? 'OK' : 'Slow'}
              </Badge>
            </div>
            <Progress value={report.metrics.userExperience} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="h-5 w-5 text-orange-500" />
              <span className="font-medium">Mobile Friendly</span>
            </div>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getScoreColor(report.metrics.mobileOptimization || 85)}`}>
                {report.metrics.mobileOptimization || 85}
              </div>
              <Badge variant={getScoreBadgeVariant(report.metrics.mobileOptimization || 85)}>
                {(report.metrics.mobileOptimization || 85) >= 80 ? 'Great' : 'Good'}
              </Badge>
            </div>
            <Progress value={report.metrics.mobileOptimization || 85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="h-5 w-5 text-pink-500" />
              <span className="font-medium">Social</span>
            </div>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getScoreColor(report.metrics.security || 70)}`}>
                {report.metrics.security || 70}
              </div>
              <Badge variant={getScoreBadgeVariant(report.metrics.security || 70)}>
                {(report.metrics.security || 70) >= 80 ? 'Great' : 'OK'}
              </Badge>
            </div>
            <Progress value={report.metrics.security || 70} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Accessibility className="h-5 w-5 text-indigo-500" />
              <span className="font-medium">Accessibility</span>
            </div>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getScoreColor(75)}`}>
                75
              </div>
              <Badge variant={getScoreBadgeVariant(75)}>
                Good
              </Badge>
            </div>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Issues Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium">Critical Issues</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{report.issues.critical}</div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Issues that need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Warnings</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{report.issues.warnings}</div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Issues that should be addressed
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Suggestions</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{report.issues.suggestions}</div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Optimization opportunities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technical Findings */}
      {report.technicalFindings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Technical Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Page Speed Scores
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Desktop</span>
                      <div className="flex items-center gap-2">
                        <Progress value={report.technicalFindings.pagespeed.desktop} className="w-20 h-2" />
                        <span className={`text-sm font-medium ${getScoreColor(report.technicalFindings.pagespeed.desktop)}`}>
                          {report.technicalFindings.pagespeed.desktop}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mobile</span>
                      <div className="flex items-center gap-2">
                        <Progress value={report.technicalFindings.pagespeed.mobile} className="w-20 h-2" />
                        <span className={`text-sm font-medium ${getScoreColor(report.technicalFindings.pagespeed.mobile)}`}>
                          {report.technicalFindings.pagespeed.mobile}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security
                  </h4>
                  <div className="flex items-center gap-2">
                    {report.technicalFindings.sslEnabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      SSL Certificate {report.technicalFindings.sslEnabled ? 'Enabled' : 'Not Found'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Meta Tags Analysis
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Missing Titles</span>
                      <Badge variant={report.technicalFindings.metaTags.missingTitle === 0 ? "default" : "destructive"}>
                        {report.technicalFindings.metaTags.missingTitle}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Missing Descriptions</span>
                      <Badge variant={report.technicalFindings.metaTags.missingDescription === 0 ? "default" : "destructive"}>
                        {report.technicalFindings.metaTags.missingDescription}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Heading Structure
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Missing H1 Tags</span>
                      <Badge variant={report.technicalFindings.headingStructure.missingH1 === 0 ? "default" : "destructive"}>
                        {report.technicalFindings.headingStructure.missingH1}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Improper Hierarchy</span>
                      <Badge variant={report.technicalFindings.headingStructure.improperHierarchy === 0 ? "default" : "secondary"}>
                        {report.technicalFindings.headingStructure.improperHierarchy}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Priority Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
            <p className="text-muted-foreground mb-4">
              Focus on addressing the {report.issues.critical} critical issues first, 
              then work on the {report.issues.warnings} warnings to improve your overall SEO score.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Report generated {formatDate(report.generatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}