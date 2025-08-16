import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Star,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Target,
  BarChart3,
  Eye,
  MousePointer,
  Zap,
  Settings
} from 'lucide-react';

interface SEOSectionProps {
  websiteId: number;
}

interface SEOData {
  overallScore: number;
  issues: {
    critical: number;
    warnings: number;
    notices: number;
  };
  rankings: Array<{
    keyword: string;
    position: number;
    change: number;
    searchVolume: number;
    url: string;
  }>;
  technicalSEO: {
    pageSpeed: number;
    mobileOptimization: number;
    httpsEnabled: boolean;
    xmlSitemap: boolean;
    robotsTxt: boolean;
    metaDescriptions: number;
    titleTags: number;
    altTags: number;
  };
  contentAnalysis: {
    totalPages: number;
    indexedPages: number;
    duplicateContent: number;
    thinContent: number;
    missingMetaDesc: number;
  };
}

export function SEOSection({ websiteId }: SEOSectionProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: seoData, isLoading, error, refetch } = useQuery<SEOData>({
    queryKey: [`/api/websites/${websiteId}/seo`],
    enabled: !!websiteId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const formatPosition = (position: number) => {
    if (position <= 10) return `#${position}`;
    if (position <= 100) return `#${position}`;
    return `100+`;
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (position <= 10) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (position <= 50) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Analysis
          </CardTitle>
          <CardDescription>
            Analyzing your website's SEO performance...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Running SEO analysis...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This may take a few moments to complete
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !seoData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">SEO Monitoring Available</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Track your website's search engine rankings, monitor keyword performance, and get actionable SEO insights.
            </p>
            <div className="space-y-3">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Target className="h-4 w-4 mr-2" />
                Activate SEO Monitoring
              </Button>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Track rankings
                </span>
                <span>•</span>
                <span>Monitor keywords</span>
                <span>•</span>
                <span>Technical SEO audit</span>
              </div>
              <p className="text-xs text-muted-foreground">Starting at $0.70/month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              SEO Analysis
            </CardTitle>
            <CardDescription>
              Search engine optimization insights and recommendations
            </CardDescription>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall SEO Score */}
        <div className={`p-6 rounded-lg ${getScoreBackground(seoData.overallScore)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Overall SEO Score</h3>
              <p className="text-sm text-muted-foreground">
                Based on technical SEO, content, and performance factors
              </p>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(seoData.overallScore)}`}>
              {seoData.overallScore}/100
            </div>
          </div>
          <Progress value={seoData.overallScore} className="mt-4" />
        </div>

        {/* Issues Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{seoData.issues.critical}</div>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{seoData.issues.warnings}</div>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 text-center">
              <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{seoData.issues.notices}</div>
              <p className="text-sm text-muted-foreground">Notices</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis Tabs */}
        <Tabs defaultValue="rankings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="technical">Technical SEO</TabsTrigger>
            <TabsTrigger value="content">Content Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="rankings" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Keyword Rankings</h4>
              {seoData.rankings.length > 0 ? (
                Array.isArray(seoData.rankings) && seoData.rankings.map((ranking: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ranking.keyword}</p>
                      <p className="text-sm text-muted-foreground truncate">{ranking.url}</p>
                      <p className="text-xs text-muted-foreground">
                        Search Volume: {ranking.searchVolume.toLocaleString()}/month
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {ranking.change !== 0 && (
                          <div className={`flex items-center gap-1 text-sm ${ranking.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {ranking.change > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span>{Math.abs(ranking.change)}</span>
                          </div>
                        )}
                      </div>
                      <Badge className={`${getPositionColor(ranking.position)} border-0`}>
                        {formatPosition(ranking.position)}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No keyword rankings tracked yet</p>
                  <Button size="sm" className="mt-2">Add Keywords to Track</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium">Technical SEO Health</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Page Speed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{seoData.technicalSEO.pageSpeed}/100</span>
                      <div className={`w-2 h-2 rounded-full ${seoData.technicalSEO.pageSpeed >= 80 ? 'bg-green-500' : seoData.technicalSEO.pageSpeed >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Mobile Optimization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{seoData.technicalSEO.mobileOptimization}/100</span>
                      <div className={`w-2 h-2 rounded-full ${seoData.technicalSEO.mobileOptimization >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">HTTPS Enabled</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${seoData.technicalSEO.httpsEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">XML Sitemap</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${seoData.technicalSEO.xmlSitemap ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Robots.txt</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${seoData.technicalSEO.robotsTxt ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Meta Descriptions</span>
                    </div>
                    <span className="text-sm font-medium">{seoData.technicalSEO.metaDescriptions}%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium">Content Analysis</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{seoData.contentAnalysis.totalPages}</div>
                    <p className="text-sm text-muted-foreground">Total Pages</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{seoData.contentAnalysis.indexedPages}</div>
                    <p className="text-sm text-muted-foreground">Indexed Pages</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Duplicate Content Issues</span>
                  <Badge variant={seoData.contentAnalysis.duplicateContent === 0 ? 'default' : 'destructive'}>
                    {seoData.contentAnalysis.duplicateContent}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Thin Content Pages</span>
                  <Badge variant={seoData.contentAnalysis.thinContent === 0 ? 'default' : 'secondary'}>
                    {seoData.contentAnalysis.thinContent}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Missing Meta Descriptions</span>
                  <Badge variant={seoData.contentAnalysis.missingMetaDesc === 0 ? 'default' : 'secondary'}>
                    {seoData.contentAnalysis.missingMetaDesc}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full SEO Report
          </Button>
          <Button variant="outline" size="sm">
            <Target className="h-4 w-4 mr-2" />
            Add Keywords
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            SEO Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}