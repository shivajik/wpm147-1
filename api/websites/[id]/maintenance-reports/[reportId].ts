import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateToken } from '../../../../server/auth.js';
import { getStorage } from '../../../../server/storage.js';

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

    const { id: websiteId, reportId } = req.query;
    const userId = authResult.user.id;

    if (!websiteId || typeof websiteId !== 'string') {
      return res.status(400).json({ message: 'Website ID is required' });
    }

    if (!reportId || typeof reportId !== 'string') {
      return res.status(400).json({ message: 'Report ID is required' });
    }

    const storage = getStorage();
    const websiteIdNum = parseInt(websiteId, 10);
    const reportIdNum = parseInt(reportId, 10);

    // Verify website belongs to user
    const website = await storage.getWebsite(websiteIdNum, userId);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Get the specific report
    const report = await storage.getClientReport(reportIdNum, userId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Verify this report belongs to the requested website
    const websiteIds = Array.isArray(report.websiteIds) ? report.websiteIds : [report.websiteIds];
    if (!websiteIds.includes(websiteIdNum)) {
      return res.status(403).json({ message: 'Report does not belong to this website' });
    }

    return res.status(200).json({
      id: report.id,
      websiteId: websiteIdNum,
      title: report.title,
      reportType: 'maintenance' as const,
      status: report.status as 'draft' | 'generated' | 'sent' | 'failed',
      createdAt: report.createdAt,
      generatedAt: report.generatedAt,
      data: report.reportData,
      dateFrom: report.dateFrom,
      dateTo: report.dateTo
    });

  } catch (error) {
    console.error('[MAINTENANCE-REPORT-DETAIL] Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}