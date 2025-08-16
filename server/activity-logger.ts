import { db } from "./db";
import { updateLogs, securityScanHistory, performanceScans, linkScanHistory, seoReports } from "@shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  type: 'update' | 'security' | 'performance' | 'seo' | 'backup' | 'custom' | 'maintenance';
  category: string;
  title: string;
  description: string;
  status: 'success' | 'failed' | 'warning' | 'info';
  details?: any;
  websiteId: number;
  userId?: number;
}

export class ActivityLogger {
  /**
   * Get activity logs for a website within a date range
   */
  static async getActivityLogs(
    websiteId: number,
    dateFrom: Date,
    dateTo: Date
  ): Promise<ActivityLogEntry[]> {
    const activities: ActivityLogEntry[] = [];

    // Get update activities
    const updateActivities = await db
      .select()
      .from(updateLogs)
      .where(
        and(
          eq(updateLogs.websiteId, websiteId),
          gte(updateLogs.createdAt, dateFrom),
          lte(updateLogs.createdAt, dateTo)
        )
      )
      .orderBy(desc(updateLogs.createdAt));

    updateActivities.forEach((update) => {
      activities.push({
        id: `update-${update.id}`,
        timestamp: update.createdAt!,
        type: 'update',
        category: update.updateType,
        title: `${update.updateType === 'wordpress' ? 'WordPress Core' : 
               update.updateType === 'plugin' ? 'Plugin' : 'Theme'} Update`,
        description: `Updated ${update.itemName} from ${update.fromVersion} to ${update.toVersion}`,
        status: update.updateStatus === 'success' ? 'success' : 
                update.updateStatus === 'failed' ? 'failed' : 'info',
        details: {
          itemName: update.itemName,
          fromVersion: update.fromVersion,
          toVersion: update.toVersion,
          duration: update.duration,
          automated: update.automatedUpdate,
          errorMessage: update.errorMessage
        },
        websiteId: update.websiteId,
        userId: update.userId
      });
    });

    // Get security scan activities
    const securityActivities = await db
      .select()
      .from(securityScanHistory)
      .where(
        and(
          eq(securityScanHistory.websiteId, websiteId),
          gte(securityScanHistory.createdAt, dateFrom),
          lte(securityScanHistory.createdAt, dateTo)
        )
      )
      .orderBy(desc(securityScanHistory.createdAt));

    securityActivities.forEach((scan) => {
      const threatCount = scan.threatsDetected || 0;
      const vulnerabilityCount = (scan.coreVulnerabilities || 0) + (scan.pluginVulnerabilities || 0) + (scan.themeVulnerabilities || 0);
      
      activities.push({
        id: `security-${scan.id}`,
        timestamp: scan.createdAt!,
        type: 'security',
        category: 'security_scan',
        title: 'Security Scan Completed',
        description: `Security scan found ${threatCount} threats and ${vulnerabilityCount} vulnerabilities`,
        status: threatCount > 0 || vulnerabilityCount > 0 ? 'warning' : 'success',
        details: {
          threatCount,
          vulnerabilityCount,
          scanDuration: scan.scanDuration,
          overallSecurityScore: scan.overallSecurityScore,
          threatLevel: scan.threatLevel,
          malwareStatus: scan.malwareStatus,
          blacklistStatus: scan.blacklistStatus
        },
        websiteId: scan.websiteId
      });
    });

    // Get performance scan activities
    const performanceActivities = await db
      .select()
      .from(performanceScans)
      .where(
        and(
          eq(performanceScans.websiteId, websiteId),
          gte(performanceScans.scanTimestamp, dateFrom),
          lte(performanceScans.scanTimestamp, dateTo)
        )
      )
      .orderBy(desc(performanceScans.scanTimestamp));

    performanceActivities.forEach((scan) => {
      const performanceScore = (scan as any).performanceScore || 0;
      
      activities.push({
        id: `performance-${scan.id}`,
        timestamp: scan.scanTimestamp,
        type: 'performance',
        category: 'performance_scan',
        title: 'Performance Scan Completed',
        description: `Performance scan completed with score ${performanceScore}/100`,
        status: performanceScore >= 80 ? 'success' : 
                performanceScore >= 60 ? 'warning' : 'failed',
        details: {
          performanceScore,
          loadTime: (scan as any).loadTime,
          pageSize: (scan as any).pageSize,
          requestsCount: (scan as any).requestsCount,
          firstContentfulPaint: (scan as any).firstContentfulPaint,
          largestContentfulPaint: (scan as any).largestContentfulPaint,
          cumulativeLayoutShift: (scan as any).cumulativeLayoutShift,
          overallScore: performanceScore
        },
        websiteId: scan.websiteId
      });
    });

    // Get SEO scan activities
    const seoActivities = await db
      .select()
      .from(seoReports)
      .where(
        and(
          eq(seoReports.websiteId, websiteId),
          gte(seoReports.createdAt, dateFrom),
          lte(seoReports.createdAt, dateTo)
        )
      )
      .orderBy(desc(seoReports.createdAt));

    seoActivities.forEach((report) => {
      const grade = report.overallScore >= 90 ? 'A+' : 
                    report.overallScore >= 80 ? 'A' : 
                    report.overallScore >= 70 ? 'B' : 
                    report.overallScore >= 60 ? 'C' : 'D';
      
      activities.push({
        id: `seo-${report.id}`,
        timestamp: report.createdAt!,
        type: 'seo',
        category: 'seo_analysis',
        title: 'SEO Analysis Completed',
        description: `SEO analysis completed with grade ${grade} (${report.overallScore}/100 score)`,
        status: (report.overallScore || 0) >= 80 ? 'success' : 
                (report.overallScore || 0) >= 60 ? 'warning' : 'failed',
        details: {
          overallScore: report.overallScore,
          technicalScore: report.technicalScore,
          contentScore: report.contentScore,
          backlinksScore: report.backlinksScore,
          userExperienceScore: report.userExperienceScore,
          onPageSeoScore: report.onPageSeoScore,
          grade
        },
        websiteId: report.websiteId
      });
    });

    // Sort all activities by timestamp (newest first)
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get activity summary for a website within a date range
   */
  static async getActivitySummary(
    websiteId: number,
    dateFrom: Date,
    dateTo: Date
  ): Promise<{
    totalActivities: number;
    updateCount: number;
    securityScanCount: number;
    performanceScanCount: number;
    seoScanCount: number;
    successfulActivities: number;
    failedActivities: number;
    warningActivities: number;
  }> {
    const activities = await this.getActivityLogs(websiteId, dateFrom, dateTo);
    
    const summary = {
      totalActivities: activities.length,
      updateCount: activities.filter(a => a.type === 'update').length,
      securityScanCount: activities.filter(a => a.type === 'security').length,
      performanceScanCount: activities.filter(a => a.type === 'performance').length,
      seoScanCount: activities.filter(a => a.type === 'seo').length,
      successfulActivities: activities.filter(a => a.status === 'success').length,
      failedActivities: activities.filter(a => a.status === 'failed').length,
      warningActivities: activities.filter(a => a.status === 'warning').length,
    };

    return summary;
  }

  /**
   * Get maintenance overview for a specific time period
   */
  static async getMaintenanceOverview(
    websiteId: number,
    dateFrom: Date,
    dateTo: Date
  ): Promise<{
    updates: {
      wordpress: number;
      plugins: number;
      themes: number;
      total: number;
    };
    security: {
      scansCompleted: number;
      threatsFound: number;
      vulnerabilitiesFound: number;
      avgSecurityScore: number;
    };
    performance: {
      scansCompleted: number;
      avgPerformanceScore: number;
      avgLoadTime: number;
    };
    seo: {
      analysesCompleted: number;
      avgSeoScore: number;
    };
  }> {
    const activities = await this.getActivityLogs(websiteId, dateFrom, dateTo);
    
    const updateActivities = activities.filter(a => a.type === 'update');
    const securityActivities = activities.filter(a => a.type === 'security');
    const performanceActivities = activities.filter(a => a.type === 'performance');
    const seoActivities = activities.filter(a => a.type === 'seo');

    const overview = {
      updates: {
        wordpress: updateActivities.filter(a => a.category === 'wordpress').length,
        plugins: updateActivities.filter(a => a.category === 'plugin').length,
        themes: updateActivities.filter(a => a.category === 'theme').length,
        total: updateActivities.length
      },
      security: {
        scansCompleted: securityActivities.length,
        threatsFound: securityActivities.reduce((sum, a) => sum + (a.details?.threatCount || 0), 0),
        vulnerabilitiesFound: securityActivities.reduce((sum, a) => sum + (a.details?.vulnerabilityCount || 0), 0),
        avgSecurityScore: securityActivities.length > 0 
          ? securityActivities.reduce((sum, a) => sum + (a.details?.overallSecurityScore || 0), 0) / securityActivities.length
          : 0
      },
      performance: {
        scansCompleted: performanceActivities.length,
        avgPerformanceScore: performanceActivities.length > 0
          ? performanceActivities.reduce((sum, a) => sum + (a.details?.performanceScore || 0), 0) / performanceActivities.length
          : 0,
        avgLoadTime: performanceActivities.length > 0
          ? performanceActivities.reduce((sum, a) => sum + (a.details?.loadTime || 0), 0) / performanceActivities.length
          : 0
      },
      seo: {
        analysesCompleted: seoActivities.length,
        avgSeoScore: seoActivities.length > 0
          ? seoActivities.reduce((sum, a) => sum + (a.details?.overallScore || 0), 0) / seoActivities.length
          : 0
      }
    };

    return overview;
  }
}