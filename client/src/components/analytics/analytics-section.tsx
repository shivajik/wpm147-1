import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { initGA, trackEvent } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Clock, 
  MousePointer,
  RefreshCw,
  ExternalLink,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Info,
  CheckCircle
} from 'lucide-react';

interface AnalyticsSectionProps {
  websiteId: number;
}

interface AnalyticsData {
  overview: {
    pageViews: number;
    sessions: number;
    users: number;
    bounceRate: number;
    avgSessionDuration: string;
    pageViewsChange: number;
    sessionsChange: number;
    usersChange: number;
    bounceRateChange: number;
  };
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    change: number;
  }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  trafficSources: Array<{
    source: string;
    sessions: number;
    percentage: number;
  }>;
  realTimeUsers: number;
}

export function AnalyticsSection({ websiteId }: AnalyticsSectionProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGAConnected, setIsGAConnected] = useState(false);
  
  // Check if Google Analytics is configured
  useEffect(() => {
    const hasGAKey = !!import.meta.env.VITE_GA_MEASUREMENT_ID;
    setIsGAConnected(hasGAKey);
    
    // Initialize Google Analytics if key is available
    if (hasGAKey) {
      initGA();
    }
  }, []);

  const { data: analyticsData, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: [`/api/websites/${websiteId}/analytics`, timeRange],
    enabled: !!websiteId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="h-3 w-3 text-green-600" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-600" />
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
          <CardDescription>
            Loading analytics data...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Fetching analytics data...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This may take a moment to process
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analyticsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Connect Analytics</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your Google Analytics account to view detailed visitor analytics and website performance metrics.
            </p>
            <div className="space-y-3">
              {isGAConnected ? (
                <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Google Analytics Connected
                </div>
              ) : (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    trackEvent('connect_analytics_clicked', 'analytics', 'connect_button');
                    window.open('https://analytics.google.com', '_blank');
                  }}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Connect Google Analytics
                </Button>
              )}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {isGAConnected ? 'Analytics data available' : 'Free to connect'}
                </span>
                <span>•</span>
                <span>Real-time data</span>
                <span>•</span>
                <span>Historical reports</span>
              </div>
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
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              Website traffic and user behavior insights
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Real-time users */}
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">Real-time users</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{analyticsData.realTimeUsers}</div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Page Views</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.pageViews)}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 mt-2 text-sm ${getChangeColor(analyticsData.overview.pageViewsChange)}`}>
                {getChangeIcon(analyticsData.overview.pageViewsChange)}
                <span>{Math.abs(analyticsData.overview.pageViewsChange)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.sessions)}</p>
                </div>
                <MousePointer className="h-8 w-8 text-green-600" />
              </div>
              <div className={`flex items-center gap-1 mt-2 text-sm ${getChangeColor(analyticsData.overview.sessionsChange)}`}>
                {getChangeIcon(analyticsData.overview.sessionsChange)}
                <span>{Math.abs(analyticsData.overview.sessionsChange)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.users)}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className={`flex items-center gap-1 mt-2 text-sm ${getChangeColor(analyticsData.overview.usersChange)}`}>
                {getChangeIcon(analyticsData.overview.usersChange)}
                <span>{Math.abs(analyticsData.overview.usersChange)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bounce Rate</p>
                  <p className="text-2xl font-bold">{analyticsData.overview.bounceRate}%</p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-600" />
              </div>
              <div className={`flex items-center gap-1 mt-2 text-sm ${getChangeColor(-analyticsData.overview.bounceRateChange)}`}>
                {getChangeIcon(-analyticsData.overview.bounceRateChange)}
                <span>{Math.abs(analyticsData.overview.bounceRateChange)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed analytics tabs */}
        <Tabs defaultValue="pages" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pages">Top Pages</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-4">
            <div className="space-y-3">
              {Array.isArray(analyticsData.topPages) && analyticsData.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{page.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{page.path}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatNumber(page.views)}</p>
                    <div className={`flex items-center gap-1 text-sm ${getChangeColor(page.change)}`}>
                      {getChangeIcon(page.change)}
                      <span>{Math.abs(page.change)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Monitor className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Desktop</p>
                  <p className="text-2xl font-bold">{analyticsData.deviceStats.desktop}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Smartphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="text-2xl font-bold">{analyticsData.deviceStats.mobile}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Monitor className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Tablet</p>
                  <p className="text-2xl font-bold">{analyticsData.deviceStats.tablet}%</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <div className="space-y-3">
              {Array.isArray(analyticsData.trafficSources) && analyticsData.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatNumber(source.sessions)}</p>
                    <p className="text-sm text-muted-foreground">{source.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View in Google Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}