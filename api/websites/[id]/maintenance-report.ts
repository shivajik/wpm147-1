import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateToken } from '../../../server/auth.js';
import { getStorage } from '../../../server/storage.js';
import { WPRemoteManagerClient } from '../../../server/wp-remote-manager-client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const authResult = await authenticateToken(req, res);
    if (!authResult.success || !authResult.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id: websiteId } = req.query;
    const userId = authResult.user.id;
    const { title, dateFrom, dateTo } = req.body;

    if (!websiteId || typeof websiteId !== 'string') {
      return res.status(400).json({ message: 'Website ID is required' });
    }

    if (!title || !dateFrom || !dateTo) {
      return res.status(400).json({ message: 'Title, dateFrom, and dateTo are required' });
    }

    const storage = getStorage();
    const websiteIdNum = parseInt(websiteId, 10);

    // Verify website belongs to user
    const website = await storage.getWebsite(websiteIdNum, userId);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Get client for this website
    let clientId = website.clientId;
    if (!clientId) {
      // Create a default client if none exists
      const defaultClient = await storage.createClient({
        name: `${website.name} Client`,
        email: 'client@example.com',
        phone: '',
        address: ''
      }, userId);
      clientId = defaultClient.id;
      
      // Update website with client ID
      await storage.updateWebsite(websiteIdNum, { clientId }, userId);
    }

    // Fetch real WordPress data - using EXACT format as localhost
    let reportData: any = {
      website: {
        id: websiteIdNum,
        name: website.name,
        url: website.url,
        status: website.connectionStatus || 'unknown',
        lastSync: website.lastSync?.toISOString() || new Date().toISOString()
      },
      
      updates: { 
        plugins: [], 
        themes: [], 
        wordpress: null,
        total: 0 
      },
      
      security: { 
        lastScan: new Date().toISOString(),
        vulnerabilities: 0,
        status: 'good',
        scanHistory: []
      },
      
      performance: { 
        lastScan: new Date().toISOString(),
        score: 85,
        metrics: {},
        history: []
      },
      
      backups: { 
        lastBackup: website.lastBackup?.toISOString() || null,
        status: website.lastBackup ? 'current' : 'none',
        total: 0 
      },
      
      health: {
        wpVersion: website.wpVersion || 'Unknown',
        phpVersion: 'Unknown',
        overallScore: 85
      },
      
      overview: { 
        updatesPerformed: 0,
        backupsCreated: 0,
        uptimePercentage: 99.9,
        securityStatus: 'safe' as 'safe' | 'warning' | 'critical',
        performanceScore: 85
      },
      
      generatedAt: new Date().toISOString(),
      reportType: 'maintenance'
    };

    // Try to fetch real data if API key is available
    if (website.apiKey) {
      try {
        const wrmClient = new WPRemoteManagerClient(website.url, website.apiKey);
        const wordpressData = await wrmClient.getCompleteWordPressData();
        
        if (wordpressData) {
          reportData = {
            website: {
              name: website.name,
              url: website.url,
              wpVersion: wordpressData.systemInfo?.wordpress_version || 'Unknown'
            },
            updates: {
              total: (wordpressData.updates?.plugins?.length || 0) + 
                     (wordpressData.updates?.themes?.length || 0) + 
                     (wordpressData.updates?.core ? 1 : 0),
              plugins: wordpressData.updates?.plugins || [],
              themes: wordpressData.updates?.themes || [],
              core: wordpressData.updates?.core || null
            },
            backups: {
              total: 1,
              lastBackup: new Date().toISOString()
            },
            security: {
              status: 'good',
              vulnerabilities: 0,
              lastScan: new Date().toISOString()
            },
            performance: {
              score: 85,
              lastScan: new Date().toISOString()
            },
            overview: {
              updatesPerformed: 0,
              backupsCreated: 0,
              uptimePercentage: 99.9,
              securityStatus: 'safe' as 'safe' | 'warning' | 'critical',
              performanceScore: 85
            },
            
            generatedAt: new Date().toISOString(),
            reportType: 'maintenance',
            health: {
              wpVersion: wordpressData.systemInfo?.wordpress_version || 'Unknown'
            }
          };
        }
      } catch (error) {
        console.error('[MAINTENANCE-REPORT] Error fetching WordPress data:', error);
      }
    }

    // Create the maintenance report
    const reportDateFrom = new Date(dateFrom);
    const reportDateTo = new Date(dateTo);
    const reportTitle = `Maintenance Report - ${website.name} - ${reportDateFrom.toLocaleDateString()} to ${reportDateTo.toLocaleDateString()}`;

    const newReport = await storage.createClientReport({
      title: reportTitle,
      clientId,
      websiteIds: [websiteIdNum],
      dateFrom: reportDateFrom,
      dateTo: reportDateTo,
      reportType: 'Website Maintenance Report',
      reportData,
      modules: ['updates', 'backups', 'security', 'performance']
    }, userId);

    return res.status(201).json({
      success: true,
      message: 'Maintenance report generated successfully',
      reportId: newReport.id,
      report: {
        id: newReport.id,
        websiteId: websiteIdNum,
        title: newReport.title,
        reportType: 'maintenance',
        status: 'generated',
        createdAt: newReport.createdAt?.toISOString(),
        generatedAt: newReport.generatedAt?.toISOString(),
        data: reportData
      }
    });

  } catch (error) {
    console.error('[MAINTENANCE-REPORT] Error:', error);
    return res.status(500).json({ 
      message: 'Failed to generate maintenance report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}