import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateToken } from '../../../server/auth.js';
import { getStorage } from '../../../server/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
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

    if (!websiteId || typeof websiteId !== 'string') {
      return res.status(400).json({ message: 'Website ID is required' });
    }

    const storage = getStorage();
    const websiteIdNum = parseInt(websiteId, 10);

    // Verify website belongs to user
    const website = await storage.getWebsite(websiteIdNum, userId);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Get all client reports for this website that are maintenance type
    const allReports = await storage.getClientReports(userId);
    const maintenanceReports = allReports.filter(report => {
      const websiteIds = Array.isArray(report.websiteIds) ? report.websiteIds : [report.websiteIds];
      return websiteIds.includes(websiteIdNum) && report.title.toLowerCase().includes('maintenance');
    });

    // Sort by creation date (newest first)
    maintenanceReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({
      reports: maintenanceReports.map(report => ({
        id: report.id,
        title: report.title,
        dateFrom: report.dateFrom,
        dateTo: report.dateTo,
        createdAt: report.createdAt,
        reportType: report.reportType || 'maintenance'
      }))
    });

  } catch (error) {
    console.error('[MAINTENANCE-REPORTS-LIST] Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}