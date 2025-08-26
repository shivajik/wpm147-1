import { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../../../../server/storage.js';
import { AuthService } from '../../../../../server/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id: websiteId, reportId, token } = req.query;

    if (!websiteId || typeof websiteId !== 'string') {
      return res.status(400).json({ message: 'Website ID is required' });
    }

    if (!reportId || typeof reportId !== 'string') {
      return res.status(400).json({ message: 'Report ID is required' });
    }

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Authentication token is required' });
    }

    // Use AuthService to verify token
    let userId: number;
    try {
      const decoded = AuthService.verifyToken(token);
      if (!decoded || !decoded.id) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      userId = decoded.id;
    } catch (error) {
      console.error('[MAINTENANCE-PDF] Token verification failed:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const storage = getStorage();
    const websiteIdNum = parseInt(websiteId, 10);
    const reportIdNum = parseInt(reportId, 10);

    // Verify website belongs to user
    const website = await storage.getWebsite(websiteIdNum, userId);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Get the enriched report data from the main API endpoint
    // First, let's call the main API internally to get the same data structure
    const mainApiResponse = await fetchMainApiData(websiteIdNum, reportIdNum, userId, storage);
    
    if (!mainApiResponse) {
      return res.status(404).json({ message: 'Maintenance report not found' });
    }

    // Use the enriched data from the main API response
    const enrichedData = mainApiResponse.data;

    // Use the enhanced PDF generator for professional reports
    const { EnhancedPDFGenerator: EnhancedGenerator } = await import('../../../../../server/enhanced-pdf-generator.ts');
    const pdfGenerator = new EnhancedGenerator();
    const reportHtml = pdfGenerator.generateReportHTML(enrichedData);

    // Generate filename
    const filename = `maintenance-report-${website.name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

    // Try HTML-to-PDF conversion with enhanced error handling
    try {
      const puppeteer = await import('puppeteer');
      
      const browser = await puppeteer.default.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
      });

      const page = await browser.newPage();
      await page.setContent(reportHtml, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
        printBackground: true
      });

      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      return res.send(pdfBuffer);

    } catch (pdfError) {
      console.error('[MAINTENANCE-PDF] PDF generation failed:', pdfError);
      
      // Fallback: return HTML as downloadable file
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename.replace('.pdf', '.html')}"`);
      return res.send(reportHtml);
    }

  } catch (error) {
    console.error('[MAINTENANCE-PDF] Error:', error);
    return res.status(500).json({ 
      message: 'Failed to generate PDF',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to get the same data structure as the main API endpoint
async function fetchMainApiData(websiteId: number, reportId: number, userId: number, storage: any) {
  try {
    // Get the report
    const report = await storage.getClientReport(reportId, userId);
    if (!report) {
      return null;
    }

    // Verify this report belongs to the requested website
    const websiteIds = Array.isArray(report.websiteIds) ? report.websiteIds : [report.websiteIds];
    if (!websiteIds.includes(websiteId)) {
      return null;
    }

    const reportData = report.reportData as any || {};
    
    // Get client information
    let clientName = 'Unknown Client';
    let clientEmail = 'N/A';
    try {
      if (report.clientId) {
        const client = await storage.getClient(report.clientId, userId);
        if (client) {
          clientName = client.name;
          clientEmail = client.email || 'N/A';
        }
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    }

    // Get website information
    let websiteName = 'Unknown Website';
    let websiteUrl = 'https://example.com';
    let realWordPressVersion = 'Unknown';
    let realIpAddress = 'Unknown';
    
    try {
      const website = await storage.getWebsite(websiteId, userId);
      if (website) {
        websiteName = website.name;
        websiteUrl = website.url;
        realWordPressVersion = website.wpVersion || 'Unknown';
        
        // Try to extract IP from wpData
        if (website.wpData) {
          try {
            const wpData = typeof website.wpData === 'string' ? JSON.parse(website.wpData) : website.wpData;
            if (wpData.systemInfo) {
              realIpAddress = wpData.systemInfo.ip_address || wpData.systemInfo.server_ip || 'Unknown';
              realWordPressVersion = wpData.systemInfo.wordpress_version || wpData.systemInfo.wp_version || realWordPressVersion;
            }
          } catch (e) {
            console.error('Error parsing wpData:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching website data:', error);
    }

    // Get real performance data
    let realPerformanceHistory = [];
    try {
      const performanceScans = await storage.getPerformanceScans(websiteId, 10);
      realPerformanceHistory = performanceScans.map(scan => ({
        date: scan.scanTimestamp.toISOString(),
        loadTime: scan.scanData?.yslow_metrics?.load_time ? scan.scanData.yslow_metrics.load_time / 1000 : (scan.lcpScore || 2.5),
        pageSpeedScore: scan.pagespeedScore || 85,
        pageSpeedGrade: scan.pagespeedScore >= 90 ? 'A' : scan.pagespeedScore >= 80 ? 'B' : 'C',
        ysloScore: scan.yslowScore || 76,
        ysloGrade: scan.yslowScore >= 90 ? 'A' : scan.yslowScore >= 80 ? 'B' : 'C'
      }));
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }

    // Get real security data
    let realSecurityHistory = [];
    try {
      const securityScans = await storage.getSecurityScans(websiteId, 10);
      realSecurityHistory = securityScans.map(scan => ({
        date: scan.scanStartedAt.toISOString(),
        malware: scan.malwareStatus || 'clean',
        vulnerabilities: (scan.coreVulnerabilities || 0) + (scan.pluginVulnerabilities || 0) + (scan.themeVulnerabilities || 0),
        webTrust: scan.threatLevel === 'low' ? 'clean' : (scan.threatLevel === 'medium' ? 'warning' : 'high risk'),
        status: scan.malwareStatus === 'clean' && scan.threatsDetected === 0 ? 'clean' : 'issues'
      }));
    } catch (error) {
      console.error('Error fetching security data:', error);
    }

    // Get real update data
    let realUpdateHistory = { plugins: [], themes: [], core: [], total: 0 };
    try {
      const updateLogs = await storage.getUpdateLogs(websiteId, 20);
      
      // Process plugin updates
      const pluginUpdates = updateLogs.filter(log => log.updateType === 'plugin');
      realUpdateHistory.plugins = pluginUpdates.map(log => {
        let enhancedName = log.itemName || 'Unknown Plugin';
        if (enhancedName.includes('/') || enhancedName.includes('.php')) {
          const parts = enhancedName.split('/');
          enhancedName = parts[0].replace(/\.php$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        return {
          name: enhancedName,
          slug: log.itemSlug || 'unknown',
          fromVersion: log.fromVersion || '0.0.0',
          toVersion: log.toVersion || '0.0.0',
          status: log.updateStatus || 'completed',
          date: log.createdAt.toISOString(),
          automated: log.automatedUpdate || false,
          duration: log.duration || 0
        };
      });

      // Process theme updates
      const themeUpdates = updateLogs.filter(log => log.updateType === 'theme');
      realUpdateHistory.themes = themeUpdates.map(log => {
        let enhancedName = log.itemName || 'Unknown Theme';
        if (enhancedName.includes('/') || enhancedName.includes('.php')) {
          const parts = enhancedName.split('/');
          enhancedName = parts[0].replace(/\.php$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        return {
          name: enhancedName,
          slug: log.itemSlug || 'unknown',
          fromVersion: log.fromVersion || '0.0.0',
          toVersion: log.toVersion || '0.0.0',
          status: log.updateStatus || 'completed',
          date: log.createdAt.toISOString(),
          automated: log.automatedUpdate || false,
          duration: log.duration || 0
        };
      });

      // Process core updates
      const coreUpdates = updateLogs.filter(log => log.updateType === 'wordpress');
      realUpdateHistory.core = coreUpdates.map(log => ({
        fromVersion: log.fromVersion || '0.0.0',
        toVersion: log.toVersion || '0.0.0',
        status: log.updateStatus || 'completed',
        date: log.createdAt.toISOString(),
        automated: log.automatedUpdate || false,
        duration: log.duration || 0
      }));

      realUpdateHistory.total = updateLogs.length;
    } catch (error) {
      console.error('Error fetching update data:', error);
    }

    // Build the complete data structure that matches what the UI expects
    const completeReportData = {
      id: report.id,
      title: report.title,
      client: {
        name: clientName,
        email: clientEmail,
        contactPerson: clientName
      },
      website: {
        name: websiteName,
        url: websiteUrl,
        ipAddress: realIpAddress,
        wordpressVersion: realWordPressVersion
      },
      dateFrom: report.dateFrom.toISOString(),
      dateTo: report.dateTo.toISOString(),
      overview: {
        updatesPerformed: realUpdateHistory.total || reportData.updates?.total || 0,
        backupsCreated: reportData.backups?.total || 0,
        uptimePercentage: reportData.uptime?.percentage || 99.9,
        analyticsChange: reportData.analytics?.changePercentage || 0,
        securityStatus: realSecurityHistory.some(scan => scan.status === 'issues') ? 'warning' : 'safe',
        performanceScore: realPerformanceHistory.length > 0 ? realPerformanceHistory[0].pageSpeedScore : 
                         (reportData.performance?.lastScan?.pageSpeedScore || 85),
        seoScore: reportData.seo?.overallScore || 92,
        keywordsTracked: reportData.seo?.keywords?.length || 0
      },
      updates: {
        total: realUpdateHistory.total,
        plugins: realUpdateHistory.plugins.length > 0 ? realUpdateHistory.plugins : 
                (reportData.updates?.plugins || []).map((plugin: any) => ({
                  name: plugin.name || 'Unknown Plugin',
                  slug: plugin.slug || 'unknown',
                  fromVersion: plugin.versionFrom || plugin.fromVersion || 'Unknown',
                  toVersion: plugin.versionTo || plugin.toVersion || 'Latest',
                  status: plugin.status || 'completed',
                  date: plugin.date || new Date().toISOString(),
                  automated: plugin.automated || false,
                  duration: plugin.duration || 0
                })),
        themes: realUpdateHistory.themes.length > 0 ? realUpdateHistory.themes : 
               (reportData.updates?.themes || []).map((theme: any) => ({
                 name: theme.name || 'Unknown Theme',
                 slug: theme.slug || 'unknown',
                 fromVersion: theme.versionFrom || theme.fromVersion || 'Unknown',
                 toVersion: theme.versionTo || theme.toVersion || 'Latest',
                 status: theme.status || 'completed',
                 date: theme.date || new Date().toISOString(),
                 automated: theme.automated || false,
                 duration: theme.duration || 0
               })),
        core: realUpdateHistory.core.length > 0 ? realUpdateHistory.core : 
             (reportData.updates?.core || []).map((core: any) => ({
               fromVersion: core.versionFrom || core.fromVersion || 'Unknown',
               toVersion: core.versionTo || core.toVersion || 'Latest',
               status: core.status || 'completed',
               date: core.date || new Date().toISOString(),
               automated: core.automated || false,
               duration: core.duration || 0
             }))
      },
      backups: {
        total: reportData.backups?.total || 0,
        totalAvailable: reportData.backups?.totalAvailable || 0,
        latest: {
          ...(reportData.backups?.latest || {}),
          date: reportData.backups?.latest?.date || new Date().toISOString(),
          size: reportData.backups?.latest?.size || '0 MB',
          wordpressVersion: realWordPressVersion,
          activeTheme: reportData.backups?.latest?.activeTheme || 'Current Theme',
          activePlugins: reportData.backups?.latest?.activePlugins || 0,
          publishedPosts: reportData.backups?.latest?.publishedPosts || 0,
          approvedComments: reportData.backups?.latest?.approvedComments || 0
        }
      },
      security: {
        totalScans: realSecurityHistory.length || reportData.security?.totalScans || 0,
        lastScan: realSecurityHistory.length > 0 ? realSecurityHistory[0] : 
                 (reportData.security?.lastScan || {
                   date: new Date().toISOString(),
                   status: 'clean',
                   malware: 'clean',
                   webTrust: 'clean',
                   vulnerabilities: 0
                 }),
        scanHistory: realSecurityHistory.length > 0 ? realSecurityHistory : (reportData.security?.scanHistory || [])
      },
      performance: {
        totalChecks: realPerformanceHistory.length || reportData.performance?.totalChecks || 0,
        lastScan: realPerformanceHistory.length > 0 ? {
          date: realPerformanceHistory[0].date,
          pageSpeedScore: realPerformanceHistory[0].pageSpeedScore,
          pageSpeedGrade: realPerformanceHistory[0].pageSpeedGrade,
          ysloScore: realPerformanceHistory[0].ysloScore,
          ysloGrade: realPerformanceHistory[0].ysloGrade,
          loadTime: realPerformanceHistory[0].loadTime
        } : (reportData.performance?.lastScan || {
          date: new Date().toISOString(),
          pageSpeedScore: 85,
          pageSpeedGrade: 'B',
          ysloScore: 76,
          ysloGrade: 'C',
          loadTime: 2.5
        }),
        history: realPerformanceHistory.length > 0 ? realPerformanceHistory : (reportData.performance?.history || [])
      },
      customWork: reportData.customWork || [],
      generatedAt: report.generatedAt?.toISOString() || null,
      status: report.status
    };

    return {
      id: report.id,
      websiteId: websiteId,
      title: report.title,
      reportType: 'maintenance',
      status: report.status,
      createdAt: report.createdAt?.toISOString() || new Date().toISOString(),
      generatedAt: report.generatedAt?.toISOString(),
      data: completeReportData
    };
  } catch (error) {
    console.error('Error fetching main API data:', error);
    return null;
  }
}