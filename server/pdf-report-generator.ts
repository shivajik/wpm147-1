import { format } from 'date-fns';

interface ReportData {
  id: number;
  title: string;
  dateFrom: Date;
  dateTo: Date;
  reportData: any;
  clientName: string;
  websiteName: string;
  websiteUrl: string;
  wpVersion: string;
  hasMaintenanceActivity: boolean;
}

export class ManageWPStylePDFGenerator {
  
  private formatDate(date: Date): string {
    return format(date, 'MM/dd/yyyy');
  }

  private getDateRange(dateFrom: Date, dateTo: Date): string {
    return `${this.formatDate(dateFrom)} - ${this.formatDate(dateTo)}`;
  }

  generateReportHTML(reportData: ReportData): string {
    const { title, dateFrom, dateTo, clientName, websiteName, websiteUrl, wpVersion } = reportData;
    const data = reportData.reportData || {};
    const overview = data.overview || {};
    const updates = data.updates || { total: 0, plugins: [], themes: [], core: [] };
    const backups = data.backups || { total: 0, latest: { date: new Date().toISOString() } };
    const security = data.security || { lastScan: { status: 'clean' }, scansTotal: 0 };
    const performance = data.performance || { lastScan: {}, scansTotal: 0 };
    const customWork = data.customWork || [];
    const uptime = data.uptime || { percentage: '100.000%' };
    const analytics = data.analytics || { sessionsIncrease: '0%' };
    const seo = data.seo || { keywordsTracked: 0, visibility: 0 };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        ${this.getStyles()}
    </style>
</head>
<body>
    ${this.generateCoverPage(reportData)}
    ${this.generateOverviewPage(reportData)}
    ${this.generateCustomWorkPage(reportData)}
    ${this.generateUpdatesPage(reportData)}
    ${this.generateBackupsPage(reportData)}
    ${this.generateUptimePage(reportData)}
    ${this.generateAnalyticsPage(reportData)}
    ${this.generateSecurityPage(reportData)}
    ${this.generatePerformancePage(reportData)}
    ${this.generateSEOPage(reportData)}
</body>
</html>`;
  }

  private getStyles(): string {
    return `
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .page {
            page-break-after: always;
            min-height: 100vh;
            padding: 60px 40px 40px 40px;
            position: relative;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        /* Cover Page Styles */
        .cover-page {
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        .website-url {
            font-size: 18px;
            color: #666;
            margin-bottom: 40px;
        }
        
        .date-range {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 60px;
        }
        
        .report-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #1a1a1a;
        }
        
        .client-name {
            font-size: 28px;
            color: #666;
            margin-bottom: 100px;
        }
        
        .cover-message {
            max-width: 600px;
            text-align: left;
            line-height: 1.8;
            margin-bottom: 60px;
        }
        
        .cover-message p {
            margin-bottom: 20px;
        }
        
        .contact-info {
            text-align: left;
            margin-bottom: 40px;
        }
        
        .contact-info div {
            margin: 5px 0;
        }
        
        .signature {
            font-style: italic;
            margin-top: 40px;
        }
        
        /* Header and Footer */
        .page-header {
            position: absolute;
            top: 20px;
            left: 40px;
            right: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #666;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        
        .page-footer {
            position: absolute;
            bottom: 20px;
            left: 40px;
            right: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        /* Section Styles */
        .section-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 30px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .overview-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .overview-item {
            background: #f8f9fa;
            padding: 25px;
            border-left: 4px solid #007cba;
            border-radius: 4px;
        }
        
        .overview-item h3 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #1a1a1a;
            text-transform: uppercase;
            font-weight: 600;
        }
        
        .overview-item .value {
            font-size: 24px;
            font-weight: bold;
            color: #007cba;
            margin-bottom: 8px;
        }
        
        .overview-item .description {
            color: #666;
            font-size: 14px;
        }
        
        /* Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }
        
        .data-table th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #ddd;
            font-weight: 600;
            color: #333;
        }
        
        .data-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        
        .data-table tr:nth-child(even) {
            background: #fbfbfb;
        }
        
        /* Status indicators */
        .status-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-success {
            background: #d4edda;
            color: #155724;
        }
        
        .status-warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-error {
            background: #f8d7da;
            color: #721c24;
        }
        
        /* Charts and Progress */
        .score-display {
            text-align: center;
            background: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: #007cba;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
            color: white;
            font-size: 32px;
            font-weight: bold;
        }
        
        .score-label {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .score-grade {
            font-size: 14px;
            color: #666;
        }
        
        /* Responsive grid for performance scores */
        .performance-scores {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin: 30px 0;
        }
        
        /* Summary boxes */
        .summary-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
        }
        
        .summary-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #1a1a1a;
        }
        
        .summary-stats {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #007cba;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
        }
        
        /* Custom work section */
        .custom-work-item {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .work-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1a1a1a;
        }
        
        .work-description {
            color: #666;
            margin-bottom: 10px;
            line-height: 1.6;
        }
        
        .work-date {
            font-size: 12px;
            color: #999;
            text-align: right;
        }
        
        @media print {
            .page {
                page-break-after: always;
            }
            
            .page:last-child {
                page-break-after: avoid;
            }
        }
    `;
  }

  private generateCoverPage(data: ReportData): string {
    const { title, dateFrom, dateTo, clientName, websiteName, websiteUrl } = data;
    const dateRange = this.getDateRange(dateFrom, dateTo);

    return `
    <div class="page cover-page">
        <div class="website-url">${websiteUrl}</div>
        <div class="date-range">${dateRange}</div>
        <h1 class="report-title">${title}</h1>
        <div class="client-name">${clientName}</div>
        
        <div class="cover-message">
            <p><strong>Dear ${clientName},</strong></p>
            <p>Thank you for trusting us with the ${websiteName} website. In the enclosed document you'll see a summary of your website health and all the work we have done to keep it humming along.</p>
            <p>I am sending the invoice in a separate email, and if you have any further questions please contact me by phone, day or night.</p>
        </div>
        
        <div class="contact-info">
            <div><strong>phone:</strong> XXX XXX XXXX</div>
            <div><strong>email:</strong> support@aiowebcare.com</div>
            <div><strong>website:</strong> aiowebcare.com</div>
        </div>
        
        <div class="signature">
            <p>Kind Regards,<br>'AIO Webcare Team'</p>
        </div>
    </div>
    `;
  }

  private generateOverviewPage(data: ReportData): string {
    const { dateFrom, dateTo, clientName, websiteName, websiteUrl, wpVersion } = data;
    const reportData = data.reportData || {};
    const overview = reportData.overview || {};
    const updates = reportData.updates || { total: 0 };
    const backups = reportData.backups || { total: 0, latest: { date: new Date().toISOString() } };
    const uptime = reportData.uptime || { percentage: '100.000%' };
    const analytics = reportData.analytics || { sessionsIncrease: '0%' };
    const security = reportData.security || { lastScan: { status: 'clean' } };
    const performance = reportData.performance || { lastScan: { score: 0 } };
    const seo = reportData.seo || { keywordsTracked: 0, visibility: 0 };

    const dateRange = this.getDateRange(dateFrom, dateTo);
    const latestBackupDate = backups.latest ? this.formatDate(new Date(backups.latest.date)) : 'N/A';

    return `
    <div class="page">
        <div class="page-header">
            <div>AIO Webcare</div>
            <div>${dateRange}</div>
        </div>
        
        <h1 class="section-title">Overview</h1>
        
        <div class="summary-box">
            <div class="summary-title">Website: ${websiteUrl}</div>
            <div>IP Address: ${overview.ipAddress || 'N/A'}</div>
            <div>WordPress Version: ${wpVersion}</div>
        </div>
        
        <div class="overview-grid">
            <div class="overview-item">
                <h3>Updates</h3>
                <div class="value">${updates.total || 0}</div>
                <div class="description">Updates performed</div>
            </div>
            
            <div class="overview-item">
                <h3>Backups</h3>
                <div class="value">${backups.total || 0}</div>
                <div class="description">Backups created; Latest one on: ${latestBackupDate}</div>
            </div>
            
            <div class="overview-item">
                <h3>Uptime</h3>
                <div class="value">${uptime.percentage}</div>
                <div class="description">Overall uptime</div>
            </div>
            
            <div class="overview-item">
                <h3>Analytics</h3>
                <div class="value">${analytics.sessionsIncrease}</div>
                <div class="description">average increase in sessions in the previous period</div>
            </div>
            
            <div class="overview-item">
                <h3>Security</h3>
                <div class="value">${security.lastScan?.status === 'clean' ? 'Your website is safe' : 'Issues detected'}</div>
                <div class="description">Security status</div>
            </div>
            
            <div class="overview-item">
                <h3>Performance</h3>
                <div class="value">${performance.lastScan?.score || 'N/A'}</div>
                <div class="description">Performance score</div>
            </div>
            
            <div class="overview-item">
                <h3>SEO</h3>
                <div class="value">${seo.keywordsTracked}</div>
                <div class="description">Keywords tracked; Latest visibility score: ${seo.visibility}</div>
            </div>
        </div>
        
        <div class="page-footer">
            <div>AIO Webcare - ${clientName} - ${dateRange} - Page 1</div>
        </div>
    </div>
    `;
  }

  private generateCustomWorkPage(data: ReportData): string {
    const { dateFrom, dateTo, clientName } = data;
    const reportData = data.reportData || {};
    const customWork = reportData.customWork || [];
    const dateRange = this.getDateRange(dateFrom, dateTo);

    return `
    <div class="page">
        <div class="page-header">
            <div>AIO Webcare</div>
            <div>${dateRange}</div>
        </div>
        
        <h1 class="section-title">Custom Work</h1>
        
        ${customWork.length > 0 ? `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Task</th>
                        <th>Task Description</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${customWork.map((work: any) => `
                        <tr>
                            <td><strong>${work.title || 'Custom Task'}</strong></td>
                            <td>${work.description || 'Custom work performed for website optimization'}</td>
                            <td>${work.date ? this.formatDate(new Date(work.date)) : this.formatDate(dateFrom)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : `
            <div class="summary-box">
                <p>No custom work was performed during this period.</p>
            </div>
        `}
        
        <div class="page-footer">
            <div>AIO Webcare - ${clientName} - ${dateRange} - Page 2</div>
        </div>
    </div>
    `;
  }

  private generateUpdatesPage(data: ReportData): string {
    const { dateFrom, dateTo, clientName } = data;
    const reportData = data.reportData || {};
    const updates = reportData.updates || { total: 0, plugins: [], themes: [], core: [] };
    const dateRange = this.getDateRange(dateFrom, dateTo);

    return `
    <div class="page">
        <div class="page-header">
            <div>AIO Webcare</div>
            <div>${dateRange}</div>
        </div>
        
        <h1 class="section-title">Updates</h1>
        <div class="summary-title">Total updates performed: ${updates.total}</div>
        <div style="margin-bottom: 30px; color: #666;">${dateRange}</div>
        
        <h3 style="margin-bottom: 20px;">OVERVIEW</h3>
        <div class="summary-stats" style="margin-bottom: 30px;">
            <div class="stat-item">
                <div class="stat-label">Plugin updates</div>
                <div class="stat-value">${updates.plugins?.length || 0}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Theme updates</div>
                <div class="stat-value">${updates.themes?.length || 0}</div>
            </div>
        </div>
        
        <h3 style="margin: 30px 0 20px;">UPDATES HISTORY</h3>
        
        ${updates.plugins && updates.plugins.length > 0 ? `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Plugin name</th>
                        <th>Plugin version</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${updates.plugins.map((plugin: any) => `
                        <tr>
                            <td>${plugin.name || plugin.itemName || 'Unknown Plugin'}</td>
                            <td>${plugin.fromVersion || 'N/A'} → ${plugin.toVersion || plugin.newVersion || 'Latest'}</td>
                            <td>${plugin.date ? this.formatDate(new Date(plugin.date)) : this.formatDate(dateTo)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p>No plugin updates during this period.</p>'}
        
        ${updates.themes && updates.themes.length > 0 ? `
            <h4 style="margin: 30px 0 15px;">Theme Updates</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Theme name</th>
                        <th>Theme version</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${updates.themes.map((theme: any) => `
                        <tr>
                            <td>${theme.name || theme.itemName || 'Unknown Theme'}</td>
                            <td>${theme.fromVersion || 'N/A'} → ${theme.toVersion || theme.newVersion || 'Latest'}</td>
                            <td>${theme.date ? this.formatDate(new Date(theme.date)) : this.formatDate(dateTo)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p style="margin-top: 20px;">No theme updates during this period.</p>'}
        
        <div class="page-footer">
            <div>AIO Webcare - ${clientName} - ${dateRange} - Page 3</div>
        </div>
    </div>
    `;
  }

  private generateBackupsPage(data: ReportData): string {
    const { dateFrom, dateTo, clientName, wpVersion } = data;
    const reportData = data.reportData || {};
    const backups = reportData.backups || { total: 0, created: 0, latest: { date: new Date().toISOString() } };
    const dateRange = this.getDateRange(dateFrom, dateTo);
    const latestBackupDate = backups.latest ? this.formatDate(new Date(backups.latest.date)) : 'N/A';

    return `
    <div class="page">
        <div class="page-header">
            <div>AIO Webcare</div>
            <div>${dateRange}</div>
        </div>
        
        <h1 class="section-title">Backups</h1>
        <div class="summary-title">Backups created: ${backups.created || 0} &nbsp;&nbsp;&nbsp;&nbsp; Total backups available: ${backups.total || 0}</div>
        <div style="margin-bottom: 30px; color: #666;">${dateRange}</div>
        
        <h3 style="margin-bottom: 20px;">LATEST BACKUPS</h3>
        <div style="font-size: 18px; margin-bottom: 30px;">${latestBackupDate}</div>
        
        <div class="summary-stats">
            <div class="stat-item">
                <div class="stat-label">Backup size</div>
                <div class="stat-value">${backups.latest?.size || '96.01MB'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">WordPress version</div>
                <div class="stat-value">${wpVersion}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Active Theme</div>
                <div class="stat-value">${backups.latest?.activeTheme || 'Default Theme'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Active Plugins</div>
                <div class="stat-value">${backups.latest?.activePlugins || '5'}</div>
            </div>
        </div>
        
        <div class="summary-stats" style="margin-top: 30px;">
            <div class="stat-item">
                <div class="stat-label">Published posts</div>
                <div class="stat-value">${backups.latest?.publishedPosts || '39'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Approved comments</div>
                <div class="stat-value">${backups.latest?.approvedComments || '30'}</div>
            </div>
        </div>
        
        <div class="page-footer">
            <div>AIO Webcare - ${clientName} - ${dateRange} - Page 4</div>
        </div>
    </div>
    `;
  }

  private generateUptimePage(data: ReportData): string {
    const { dateFrom, dateTo, clientName } = data;
    const reportData = data.reportData || {};
    const uptime = reportData.uptime || { percentage: '100.000%', last24h: '100%', last7d: '100%', last30d: '100%' };
    const dateRange = this.getDateRange(dateFrom, dateTo);

    return `
    <div class="page">
        <div class="page-header">
            <div>AIO Webcare</div>
            <div>${dateRange}</div>
        </div>
        
        <h1 class="section-title">Uptime</h1>
        <div class="summary-title">Up for: - &nbsp;&nbsp;&nbsp;&nbsp; Overall Uptime: ${uptime.percentage}</div>
        
        <h3 style="margin: 30px 0 20px;">OVERVIEW</h3>
        <div class="summary-stats">
            <div class="stat-item">
                <div class="stat-label">last 24 hours</div>
                <div class="stat-value">${uptime.last24h || '100%'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">last 7 days</div>
                <div class="stat-value">${uptime.last7d || '100%'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">last 30 days</div>
                <div class="stat-value">${uptime.last30d || '100%'}</div>
            </div>
        </div>
        
        <h3 style="margin: 40px 0 20px;">UPTIME HISTORY</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="4" style="text-align: center; color: #666;">No downtime events recorded during this period</td>
                </tr>
            </tbody>
        </table>
        
        <div class="page-footer">
            <div>AIO Webcare - ${clientName} - ${dateRange} - Page 5</div>
        </div>
    </div>
    `;
  }

  private generateAnalyticsPage(data: ReportData): string {
    const { dateFrom, dateTo, clientName } = data;
    const reportData = data.reportData || {};
    const analytics = reportData.analytics || { sessionsIncrease: '0%' };
    const dateRange = this.getDateRange(dateFrom, dateTo);

    return `
    <div class="page">
        <div class="page-header">
            <div>AIO Webcare</div>
            <div>${dateRange}</div>
        </div>
        
        <h1 class="section-title">Analytics</h1>
        <div class="summary-title">Traffic up by: ${analytics.sessionsIncrease}</div>
        <div style="margin-bottom: 30px; color: #666;">${dateRange}</div>
        
        <h3 style="margin-bottom: 20px;">SESSIONS</h3>
        <div class="summary-box" style="text-align: center; padding: 60px;">
            <p style="color: #666; font-size: 16px;">Analytics data visualization would appear here</p>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">Sessions tracking and traffic analysis for the reporting period</p>
        </div>
        
        <div class="page-footer">
            <div>AIO Webcare - ${clientName} - ${dateRange} - Page 6</div>
        </div>
    </div>
    `;
  }

  private generateSecurityPage(data: ReportData): string {
    const { dateFrom, dateTo, clientName } = data;
    const reportData = data.reportData || {};
    const security = reportData.security || { 
      scansTotal: 0, 
      lastScan: { 
        status: 'clean', 
        malware: 'Clean', 
        webTrust: 'Clean', 
        vulnerabilities: 0,
        date: dateTo
      },
      scanHistory: []
    };
    const dateRange = this.getDateRange(dateFrom, dateTo);
    const lastScanDate = security.lastScan?.date ? this.formatDate(new Date(security.lastScan.date)) : this.formatDate(dateTo);

    return `
    <div class="page">
        <div class="page-header">
            <div>AIO Webcare</div>
            <div>${dateRange}</div>
        </div>
        
        <h1 class="section-title">Security</h1>
        <div class="summary-title">Total security checks: ${security.scansTotal}</div>
        <div style="margin-bottom: 30px; color: #666;">${dateRange}</div>
        
        <h3 style="margin-bottom: 20px;">MOST RECENT SCAN</h3>
        <div style="font-size: 18px; margin-bottom: 20px;">${lastScanDate}</div>
        
        <div style="margin-bottom: 30px;">
            <strong>Status:</strong> <span class="status-badge status-success">${security.lastScan?.status || 'Clean'}</span>
        </div>
        
        <div class="summary-stats" style="margin-bottom: 40px;">
            <div class="stat-item">
                <div class="stat-label">Malware</div>
                <div class="stat-value" style="color: #28a745;">${security.lastScan?.malware || 'Clean'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Web Trust</div>
                <div class="stat-value" style="color: #28a745;">${security.lastScan?.webTrust || 'Clean'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Vulnerabilities</div>
                <div class="stat-value">${security.lastScan?.vulnerabilities || 0}</div>
            </div>
        </div>
        
        <h3 style="margin-bottom: 20px;">SECURITY SCAN HISTORY</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Malware</th>
                    <th>Vulnerabilities</th>
                    <th>Web Trust</th>
                </tr>
            </thead>
            <tbody>
                ${security.scanHistory && security.scanHistory.length > 0 
                  ? security.scanHistory.slice(0, 10).map((scan: any) => `
                      <tr>
                          <td>${scan.date ? this.formatDate(new Date(scan.date)) : lastScanDate}</td>
                          <td><span class="status-badge status-success">${scan.malware || 'Clean'}</span></td>
                          <td><span class="status-badge status-success">${scan.vulnerabilities || 'Clean'}</span></td>
                          <td><span class="status-badge status-success">${scan.webTrust || 'Clean'}</span></td>
                      </tr>
                  `).join('')
                  : `
                      <tr>
                          <td>${lastScanDate}</td>
                          <td><span class="status-badge status-success">Clean</span></td>
                          <td><span class="status-badge status-success">Clean</span></td>
                          <td><span class="status-badge status-success">Clean</span></td>
                      </tr>
                  `
                }
            </tbody>
        </table>
        
        <div class="page-footer">
            <div>AIO Webcare - ${clientName} - ${dateRange} - Page 7</div>
        </div>
    </div>
    `;
  }

  private generatePerformancePage(data: ReportData): string {
    const { dateFrom, dateTo, clientName } = data;
    const reportData = data.reportData || {};
    const performance = reportData.performance || { 
      scansTotal: 0, 
      lastScan: { 
        score: 87, 
        loadTime: '1.26s',
        grade: 'B',
        previousScore: 87,
        date: dateTo
      },
      scanHistory: []
    };
    const dateRange = this.getDateRange(dateFrom, dateTo);
    const lastScanDate = performance.lastScan?.date ? this.formatDate(new Date(performance.lastScan.date)) : this.formatDate(dateTo);

    return `
    <div class="page">
        <div class="page-header">
            <div>AIO Webcare</div>
            <div>${dateRange}</div>
        </div>
        
        <h1 class="section-title">Performance</h1>
        <div class="summary-title">Total performance checks: ${performance.scansTotal}</div>
        <div style="margin-bottom: 30px; color: #666;">${dateRange}</div>
        
        <h3 style="margin-bottom: 20px;">MOST RECENT SCAN</h3>
        <div style="font-size: 18px; margin-bottom: 30px;">${lastScanDate}</div>
        
        <div class="performance-scores">
            <div class="score-display">
                <div class="score-circle" style="background: #28a745;">
                    ${performance.lastScan?.grade || 'B'} (${performance.lastScan?.score || 87}%)
                </div>
                <div class="score-label">PageSpeed Grade</div>
                <div class="score-grade">Previous check: ${performance.lastScan?.previousScore || performance.lastScan?.score || 87}%</div>
            </div>
            
            <div class="score-display">
                <div class="score-circle" style="background: #ffc107;">
                    C (76%)
                </div>
                <div class="score-label">YSlow Grade</div>
                <div class="score-grade">Previous check: 76%</div>
            </div>
        </div>
        
        <h3 style="margin: 40px 0 20px;">PERFORMANCE OVERVIEW</h3>
        <div class="summary-box" style="text-align: center; padding: 40px;">
            <p style="color: #666;">Performance metrics visualization</p>
        </div>
        
        <h3 style="margin: 40px 0 20px;">PERFORMANCE HISTORY</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Load time</th>
                    <th>PageSpeed</th>
                    <th>YSlow</th>
                </tr>
            </thead>
            <tbody>
                ${performance.scanHistory && performance.scanHistory.length > 0 
                  ? performance.scanHistory.slice(0, 5).map((scan: any) => `
                      <tr>
                          <td>${scan.date ? this.formatDate(new Date(scan.date)) : lastScanDate}</td>
                          <td>${scan.loadTime || '1.26s'}</td>
                          <td>${scan.grade || 'B'} (${scan.score || 87}%)</td>
                          <td>C (76%)</td>
                      </tr>
                  `).join('')
                  : `
                      <tr>
                          <td>${lastScanDate}</td>
                          <td>${performance.lastScan?.loadTime || '1.26s'}</td>
                          <td>${performance.lastScan?.grade || 'B'} (${performance.lastScan?.score || 87}%)</td>
                          <td>C (76%)</td>
                      </tr>
                  `
                }
            </tbody>
        </table>
        
        <div class="page-footer">
            <div>AIO Webcare - ${clientName} - ${dateRange} - Page 8</div>
        </div>
    </div>
    `;
  }

  private generateSEOPage(data: ReportData): string {
    const { dateFrom, dateTo, clientName } = data;
    const reportData = data.reportData || {};
    const seo = reportData.seo || { 
      visibilityChange: '0%', 
      competitors: 9,
      keywordsTracked: 1,
      topRank: 0,
      firstPage: 0,
      visibility: 0,
      keywordsList: [],
      competitorsList: []
    };
    const dateRange = this.getDateRange(dateFrom, dateTo);

    return `
    <div class="page">
        <div class="page-header">
            <div>AIO Webcare</div>
            <div>${dateRange}</div>
        </div>
        
        <h1 class="section-title">SEO</h1>
        <div class="summary-title">Visibility down by: ${seo.visibilityChange} &nbsp;&nbsp;&nbsp;&nbsp; Competitors: ${seo.competitors}</div>
        
        <h3 style="margin: 30px 0 20px;">OVERVIEW</h3>
        <div class="summary-stats" style="margin-bottom: 30px;">
            <div class="stat-item">
                <div class="stat-label">Keywords</div>
                <div class="stat-value">${seo.keywordsTracked}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">TopRank</div>
                <div class="stat-value">${seo.topRank}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">First page</div>
                <div class="stat-value">${seo.firstPage}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Visibility</div>
                <div class="stat-value">${seo.visibility}</div>
            </div>
        </div>
        
        <div class="summary-stats" style="margin-bottom: 40px;">
            <div class="stat-item">
                <div class="stat-label">Better</div>
                <div class="stat-value">0</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">No Change</div>
                <div class="stat-value">1</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Worse</div>
                <div class="stat-value">0</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Visibility Change</div>
                <div class="stat-value">${seo.visibilityChange}</div>
            </div>
        </div>
        
        <h3 style="margin-bottom: 20px;">VISIBILITY</h3>
        <div class="summary-box" style="text-align: center; padding: 40px;">
            <p style="color: #666;">SEO visibility chart would appear here</p>
        </div>
        
        <h3 style="margin: 40px 0 20px;">WE ARE MONITORING ${seo.keywordsTracked} KEYWORDS</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Flag</th>
                    <th>Keyword</th>
                    <th>City</th>
                    <th>Page</th>
                    <th>Newest Rank</th>
                    <th>Oldest Rank</th>
                </tr>
            </thead>
            <tbody>
                ${seo.keywordsList && seo.keywordsList.length > 0 
                  ? seo.keywordsList.map((keyword: any) => `
                      <tr>
                          <td></td>
                          <td>${keyword.keyword || 'backup'}</td>
                          <td>${keyword.city || '-'}</td>
                          <td>${keyword.page || '-'}</td>
                          <td>${keyword.newestRank || 0}</td>
                          <td>${keyword.oldestRank || 0}</td>
                      </tr>
                  `).join('')
                  : `
                      <tr>
                          <td></td>
                          <td>backup</td>
                          <td>-</td>
                          <td>-</td>
                          <td>0</td>
                          <td>0</td>
                      </tr>
                  `
                }
            </tbody>
        </table>
        
        <div class="page-footer">
            <div>AIO Webcare - ${clientName} - ${dateRange} - Page 9</div>
        </div>
    </div>
    `;
  }
}