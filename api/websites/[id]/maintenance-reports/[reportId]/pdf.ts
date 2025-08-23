
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../../../../server/storage.js';
import { EnhancedPDFGenerator } from '../../../../../server/enhanced-pdf-generator.js';
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

    // Use AuthService to verify token (same logic as main auth system)
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

    // Get all client reports and find the specific maintenance report
    const allReports = await storage.getClientReports(userId);
    const report = allReports.find(r => {
      if (r.id !== reportIdNum) return false;
      
      // Check if this report belongs to the requested website
      const websiteIds = Array.isArray(r.websiteIds) ? r.websiteIds : [r.websiteIds];
      if (!websiteIds.includes(websiteIdNum)) return false;
      
      // Check if it's a maintenance report
      const isMaintenanceReport = 
        r.title.toLowerCase().includes('maintenance') ||
        (r.reportType && r.reportType.toLowerCase().includes('maintenance'));
      
      return isMaintenanceReport;
    });

    if (!report) {
      return res.status(404).json({ message: 'Maintenance report not found' });
    }

    // Get client information for the report
    let clientName = 'Valued Client';
    try {
      if (report.clientId) {
        const client = await storage.getClient(report.clientId, userId);
        if (client) {
          clientName = client.name;
        }
      }
    } catch (error) {
      console.error(`[MAINTENANCE-PDF] Error fetching client data:`, error);
    }

    // Transform maintenance data efficiently for serverless compatibility
    const reportData = report.reportData as any || {};
    
    // Helper function to limit array sizes for serverless memory efficiency
    const limitArray = (arr: any[], maxSize: number = 50) => arr ? arr.slice(0, maxSize) : [];
    
    const enhancedData = {
      id: report.id,
      title: report.title,
      client: {
        name: clientName,
        email: '',
        contactPerson: clientName
      },
      website: {
        name: website.name,
        url: website.url,
        ipAddress: website.ipAddress || '',
        wordpressVersion: reportData.health?.wpVersion || reportData.website?.wpVersion || 'Unknown'
      },
      dateFrom: report.dateFrom.toISOString(),
      dateTo: report.dateTo.toISOString(),
      reportType: 'Website Maintenance Report',
      overview: {
        updatesPerformed: reportData.updates?.total || 0,
        backupsCreated: reportData.backups?.total || 0,
        uptimePercentage: reportData.overview?.uptimePercentage || 99.9,
        analyticsChange: 0,
        securityStatus: reportData.security?.status === 'good' ? 'safe' : (reportData.security?.vulnerabilities > 0 ? 'warning' : 'safe'),
        performanceScore: reportData.performance?.score || reportData.overview?.performanceScore || 85,
        seoScore: 0,
        keywordsTracked: 0
      },
      customWork: limitArray(reportData.customWork, 20),
      updates: {
        total: reportData.updates?.total || 0,
        plugins: limitArray(reportData.updates?.plugins || [], 30).map((plugin: any) => ({
          name: plugin.name || plugin.itemName || 'Unknown Plugin',
          versionFrom: plugin.fromVersion || 'N/A',
          versionTo: plugin.toVersion || plugin.newVersion || 'Latest',
          date: plugin.date || new Date().toISOString()
        })),
        themes: limitArray(reportData.updates?.themes || [], 15).map((theme: any) => ({
          name: theme.name || theme.itemName || 'Unknown Theme',
          versionFrom: theme.fromVersion || 'N/A',
          versionTo: theme.toVersion || theme.newVersion || 'Latest',
          date: theme.date || new Date().toISOString()
        })),
        core: reportData.updates?.core ? [{
          versionFrom: reportData.updates.core.fromVersion || 'N/A',
          versionTo: reportData.updates.core.toVersion || 'Latest',
          date: reportData.updates.core.date || new Date().toISOString()
        }] : []
      },
      backups: {
        total: reportData.backups?.total || 0,
        totalAvailable: reportData.backups?.total || 0,
        latest: {
          date: reportData.backups?.lastBackup || new Date().toISOString(),
          size: '0 MB',
          wordpressVersion: reportData.health?.wpVersion || 'Unknown',
          activeTheme: 'Current Theme',
          activePlugins: 0,
          publishedPosts: 0,
          approvedComments: 0
        }
      },
      uptime: {
        percentage: reportData.overview?.uptimePercentage || 99.9,
        last24h: 100,
        last7days: 100,
        last30days: reportData.overview?.uptimePercentage || 99.9,
        incidents: limitArray(reportData.uptime?.incidents, 10)
      },
      analytics: {
        changePercentage: 0,
        sessions: limitArray(reportData.analytics?.sessions, 30)
      },
      security: {
        totalScans: reportData.security?.scanHistory?.length || 0,
        lastScan: {
          date: reportData.security?.lastScan || new Date().toISOString(),
          status: reportData.security?.vulnerabilities === 0 ? 'clean' : 'issues',
          malware: 'clean',
          webTrust: 'clean',
          vulnerabilities: reportData.security?.vulnerabilities || 0
        },
        scanHistory: limitArray(reportData.security?.scanHistory, 20)
      },
      performance: {
        totalChecks: reportData.performance?.history?.length || 0,
        lastScan: {
          date: reportData.performance?.lastScan || new Date().toISOString(),
          pageSpeedScore: reportData.performance?.score || 85,
          pageSpeedGrade: reportData.performance?.score >= 90 ? 'A' : reportData.performance?.score >= 80 ? 'B' : 'C',
          ysloScore: reportData.performance?.score || 85,
          ysloGrade: reportData.performance?.score >= 90 ? 'A' : reportData.performance?.score >= 80 ? 'B' : 'C',
          loadTime: 2.5
        },
        history: limitArray(reportData.performance?.history, 20)
      },
      seo: {
        visibilityChange: 0,
        competitors: 0,
        keywords: limitArray(reportData.seo?.keywords, 25),
        topRankKeywords: 0,
        firstPageKeywords: 0,
        visibility: 0,
        topCompetitors: limitArray(reportData.seo?.topCompetitors, 10)
      }
    };

    // Use the enhanced PDF generator for professional reports
    const pdfGenerator = new EnhancedPDFGenerator();
    const reportHtml = pdfGenerator.generateReportHTML(enhancedData);

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
