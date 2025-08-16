import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { GoogleAuth } from 'google-auth-library';
import type { GoogleAnalyticsData, InsertGoogleAnalyticsData, Website } from '../shared/schema';

interface GoogleAnalyticsConfig {
  propertyId: string;
  serviceAccountKey?: string;
  trackingId?: string;
}

interface AnalyticsMetrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  sessions: number;
  sessionDuration: number;
  bounceRate: number;
  pagesPerSession: number;
  pageViews: number;
  uniquePageViews: number;
  organicTraffic: number;
  directTraffic: number;
  referralTraffic: number;
  socialTraffic: number;
  paidTraffic: number;
  topPages: Array<{ page: string; views: number; unique_views: number }>;
  topSources: Array<{ source: string; sessions: number; users: number }>;
  deviceData: { desktop: number; mobile: number; tablet: number };
  locationData: Array<{ country: string; sessions: number; users: number }>;
}

export class GoogleAnalyticsService {
  private analyticsClient: BetaAnalyticsDataClient | null = null;

  constructor(private config?: GoogleAnalyticsConfig) {
    if (config?.serviceAccountKey) {
      this.initializeClient(config.serviceAccountKey);
    }
  }

  private initializeClient(serviceAccountKey: string) {
    try {
      const credentials = JSON.parse(serviceAccountKey);
      const auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      });

      this.analyticsClient = new BetaAnalyticsDataClient({
        auth,
      });
    } catch (error) {
      console.error('Failed to initialize Google Analytics client:', error);
      throw new Error('Invalid service account credentials');
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.analyticsClient || !this.config?.propertyId) {
      return { success: false, error: 'Analytics client not configured' };
    }

    try {
      // Test with a simple request
      await this.analyticsClient.runReport({
        property: `properties/${this.config.propertyId}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
      });

      return { success: true };
    } catch (error) {
      console.error('Google Analytics connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  async getAnalyticsData(
    propertyId: string,
    dateRange: '7days' | '30days' | '90days' | 'custom' = '30days',
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsMetrics> {
    if (!this.analyticsClient) {
      throw new Error('Analytics client not initialized');
    }

    // Set date ranges
    let dateRangeConfig;
    switch (dateRange) {
      case '7days':
        dateRangeConfig = { startDate: '7daysAgo', endDate: 'today' };
        break;
      case '30days':
        dateRangeConfig = { startDate: '30daysAgo', endDate: 'today' };
        break;
      case '90days':
        dateRangeConfig = { startDate: '90daysAgo', endDate: 'today' };
        break;
      case 'custom':
        if (!startDate || !endDate) {
          throw new Error('Start date and end date required for custom range');
        }
        dateRangeConfig = { startDate, endDate };
        break;
    }

    try {
      // Fetch main metrics
      const [metricsResponse] = await this.analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRangeConfig],
        metrics: [
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
          { name: 'screenPageViewsPerSession' },
          { name: 'screenPageViews' },
        ],
      });

      // Fetch traffic sources
      const [sourcesResponse] = await this.analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRangeConfig],
        dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      });

      // Fetch top pages
      const [pagesResponse] = await this.analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRangeConfig],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      });

      // Fetch device data
      const [deviceResponse] = await this.analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRangeConfig],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
      });

      // Fetch location data
      const [locationResponse] = await this.analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRangeConfig],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      });

      // Parse main metrics
      const mainMetrics = this.parseMainMetrics(metricsResponse);
      const trafficSources = this.parseTrafficSources(sourcesResponse);
      const topPages = this.parseTopPages(pagesResponse);
      const deviceData = this.parseDeviceData(deviceResponse);
      const locationData = this.parseLocationData(locationResponse);

      return {
        totalUsers: 0,
        newUsers: 0,
        activeUsers: 0,
        sessions: 0,
        sessionDuration: 0,
        bounceRate: 0,
        pagesPerSession: 0,
        pageViews: 0,
        uniquePageViews: 0,
        organicTraffic: 0,
        directTraffic: 0,
        referralTraffic: 0,
        socialTraffic: 0,
        paidTraffic: 0,
        ...mainMetrics,
        ...trafficSources,
        topPages,
        topSources: [], // Can be enhanced with source/medium data
        deviceData,
        locationData,
      };
    } catch (error) {
      console.error('Failed to fetch Google Analytics data:', error);
      throw new Error(`Failed to fetch analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseMainMetrics(response: any): Partial<AnalyticsMetrics> {
    const row = response.rows?.[0];
    if (!row) return {};

    return {
      totalUsers: parseInt(row.metricValues[0]?.value || '0'),
      newUsers: parseInt(row.metricValues[1]?.value || '0'),
      activeUsers: parseInt(row.metricValues[2]?.value || '0'),
      sessions: parseInt(row.metricValues[3]?.value || '0'),
      sessionDuration: parseInt(parseFloat(row.metricValues[4]?.value || '0').toString()),
      bounceRate: Math.round(parseFloat(row.metricValues[5]?.value || '0') * 100),
      pagesPerSession: Math.round(parseFloat(row.metricValues[6]?.value || '0') * 100),
      pageViews: parseInt(row.metricValues[7]?.value || '0'),
      uniquePageViews: parseInt(row.metricValues[7]?.value || '0'), // Approximation
    };
  }

  private parseTrafficSources(response: any): Partial<AnalyticsMetrics> {
    const sources = {
      organicTraffic: 0,
      directTraffic: 0,
      referralTraffic: 0,
      socialTraffic: 0,
      paidTraffic: 0,
    };

    response.rows?.forEach((row: any) => {
      const channel = row.dimensionValues[0]?.value;
      const sessions = parseInt(row.metricValues[0]?.value || '0');

      switch (channel?.toLowerCase()) {
        case 'organic search':
          sources.organicTraffic += sessions;
          break;
        case 'direct':
          sources.directTraffic += sessions;
          break;
        case 'referral':
          sources.referralTraffic += sessions;
          break;
        case 'organic social':
        case 'paid social':
          sources.socialTraffic += sessions;
          break;
        case 'paid search':
        case 'display':
          sources.paidTraffic += sessions;
          break;
      }
    });

    return sources;
  }

  private parseTopPages(response: any): Array<{ page: string; views: number; unique_views: number }> {
    return response.rows?.map((row: any) => ({
      page: row.dimensionValues[0]?.value || '',
      views: parseInt(row.metricValues[0]?.value || '0'),
      unique_views: parseInt(row.metricValues[0]?.value || '0'), // Approximation
    })) || [];
  }

  private parseDeviceData(response: any): { desktop: number; mobile: number; tablet: number } {
    const deviceData = { desktop: 0, mobile: 0, tablet: 0 };
    
    response.rows?.forEach((row: any) => {
      const device = row.dimensionValues[0]?.value?.toLowerCase();
      const sessions = parseInt(row.metricValues[0]?.value || '0');

      if (device === 'desktop') deviceData.desktop += sessions;
      else if (device === 'mobile') deviceData.mobile += sessions;
      else if (device === 'tablet') deviceData.tablet += sessions;
    });

    // Convert to percentages
    const total = deviceData.desktop + deviceData.mobile + deviceData.tablet;
    if (total > 0) {
      deviceData.desktop = Math.round((deviceData.desktop / total) * 100);
      deviceData.mobile = Math.round((deviceData.mobile / total) * 100);
      deviceData.tablet = Math.round((deviceData.tablet / total) * 100);
    }

    return deviceData;
  }

  private parseLocationData(response: any): Array<{ country: string; sessions: number; users: number }> {
    return response.rows?.map((row: any) => ({
      country: row.dimensionValues[0]?.value || '',
      sessions: parseInt(row.metricValues[0]?.value || '0'),
      users: parseInt(row.metricValues[1]?.value || '0'),
    })) || [];
  }

  static validateGoogleAnalyticsConfig(config: {
    trackingId?: string;
    propertyId?: string;
    serviceAccountKey?: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.propertyId) {
      errors.push('Property ID is required');
    }

    if (!config.trackingId) {
      errors.push('Tracking ID is required');
    }

    if (config.trackingId && !config.trackingId.startsWith('G-')) {
      errors.push('Tracking ID must start with G- (Google Analytics 4)');
    }

    if (config.serviceAccountKey) {
      try {
        const parsed = JSON.parse(config.serviceAccountKey);
        if (!parsed.type || parsed.type !== 'service_account') {
          errors.push('Service account key must be a valid service account JSON');
        }
        if (!parsed.private_key || !parsed.client_email) {
          errors.push('Service account key missing required fields');
        }
      } catch {
        errors.push('Service account key must be valid JSON');
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

export default GoogleAnalyticsService;