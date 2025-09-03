import { format } from 'date-fns';

interface ClientReportData {
  id: number;
  title: string;
  client: {
    name: string;
    email: string;
    contactPerson?: string;
  };
  website: {
    name: string;
    url: string;
    ipAddress?: string;
    wordpressVersion?: string;
  };
  branding?: {
    whiteLabelEnabled: boolean;
    brandName?: string;
    brandLogo?: string;
    brandColor?: string;
    brandWebsite?: string;
    footerText?: string;
  };
  userSubscription?: {
    subscriptionPlan: string;
    subscriptionStatus: string;
  };
  dateFrom: string;
  dateTo: string;
  reportType: string;
  overview: {
    updatesPerformed: number;
    backupsCreated: number;
    uptimePercentage: number;
    analyticsChange: number;
    securityStatus: 'safe' | 'warning' | 'critical';
    performanceScore: number;
    seoScore: number;
    keywordsTracked: number;
  };
  customWork?: Array<{
    title: string;
    description: string;
    date: string;
  }>;
  updates: {
    total: number;
    plugins: Array<{
      name: string;
      fromVersion: string;
      toVersion: string;
      date: string;
    }>;
    themes: Array<{
      name: string;
      versionFrom: string;
      versionTo: string;
      date: string;
    }>;
    core?: Array<{
      versionFrom: string;
      versionTo: string;
      date: string;
    }>;
  };
  backups: {
    total: number;
    totalAvailable: number;
    latest: {
      date: string;
      size: string;
      wordpressVersion: string;
      activeTheme: string;
      activePlugins: number;
      publishedPosts: number;
      approvedComments: number;
    };
  };
  uptime: {
    percentage: number;
    last24h: number;
    last7days: number;
    last30days: number;
    incidents: Array<{
      date: string;
      reason: string;
      duration: string;
    }>;
  };
  analytics: {
    changePercentage: number;
    sessions: Array<{
      date: string;
      count: number;
    }>;
  };
  security: {
    totalScans: number;
    lastScan: {
      date: string;
      status: 'clean' | 'issues';
      malware: 'clean' | 'infected';
      webTrust: 'clean' | 'warning';
      vulnerabilities: number;
    };
    scanHistory: Array<{
      date: string;
      malware: 'clean' | 'infected';
      vulnerabilities: 'clean' | 'warning';
      webTrust: 'clean' | 'warning';
    }>;
  };
  performance: {
    totalChecks: number;
    lastScan: {
      date: string;
      pageSpeedScore: number;
      pageSpeedGrade: string;
      ysloScore: number;
      ysloGrade: string;
      loadTime: number;
    };
    history: Array<{
      date: string;
      loadTime: number;
      pageSpeedScore: number;
      ysloScore: number;
    }>;
  };
  seo: {
    visibilityChange: number;
    competitors: number;
    keywords: Array<{
      keyword: string;
      currentRank: number;
      previousRank: number;
      page?: string;
    }>;
    topRankKeywords: number;
    firstPageKeywords: number;
    visibility: number;
    topCompetitors: Array<{
      domain: string;
      visibilityScore: number;
    }>;
  };
}

export class EnhancedPDFGenerator {
  
  // Helper method to determine if white-label branding should be used
  private shouldUseWhiteLabel(reportData: ClientReportData): boolean {
    const isPaidUser = reportData.userSubscription?.subscriptionPlan && 
                       reportData.userSubscription.subscriptionPlan !== 'free';
    const hasCustomBranding = reportData.branding?.whiteLabelEnabled && 
                              reportData.branding?.brandName;
    return isPaidUser && hasCustomBranding;
  }

  // Helper method to get brand information (either custom or default)
  private getBrandInfo(reportData: ClientReportData) {
    if (this.shouldUseWhiteLabel(reportData)) {
      return {
        name: reportData.branding?.brandName || 'Your Brand',
        logo: reportData.branding?.brandLogo || '🛡️',
        color: reportData.branding?.brandColor || '#1e40af',
        website: reportData.branding?.brandWebsite || '',
        footerText: reportData.branding?.footerText || 'Powered by Your Brand',
        subtitle: 'Professional WordPress Management'
      };
    }
    
    return {
      name: 'AIO WEBCARE',
      logo: '🛡️',
      color: '#1e40af',
      website: 'https://aiowebcare.com',
      footerText: 'Powered by AIO Webcare - Comprehensive WordPress Management',
      subtitle: 'Professional WordPress Management'
    };
  }

  private formatDate(dateString: string | Date | null | undefined): string {
    try {
      if (!dateString) return 'N/A';
      
      let date: Date;
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string') {
        if (dateString === 'Invalid Date' || dateString === 'null' || dateString === 'undefined') {
          return 'N/A';
        }
        date = new Date(dateString);
      } else {
        return 'N/A';
      }
      
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return format(date, 'MM/dd/yyyy');
    } catch (error) {
      return 'N/A';
    }
  }

  generateReportHTML(reportData: ClientReportData): string {
    const { title } = reportData;

    // Collect only sections that have meaningful data
    const sections = [
      this.generateEnhancedCoverPage(reportData), // Always include cover page
      this.generateEnhancedOverviewPage(reportData), // Always include overview
      this.generateEnhancedCustomWorkPage(reportData), // Conditional (already implemented)
      this.generateEnhancedUpdatesPage(reportData), // Conditional
      this.generateEnhancedBackupsPage(reportData), // Conditional
      this.generateEnhancedUptimePage(reportData), // Conditional
      this.generateEnhancedSecurityPage(reportData), // Conditional
      this.generateEnhancedPerformancePage(reportData), // Conditional
      this.generateEnhancedSEOPage(reportData), // Conditional
    ].filter(section => section.trim() !== ''); // Filter out empty sections

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        ${this.getEnhancedStyles()}
    </style>
</head>
<body>
    ${sections.join('')}
</body>
</html>`;
  }

  private getEnhancedStyles(): string {
    return `
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .page {
            page-break-after: always;
            min-height: 100vh;
            position: relative;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        /* Enhanced Cover Page */
        .cover-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #1e293b 0%, #1e40af 30%, #4338ca 100%);
            color: white;
            position: relative;
            overflow: hidden;
            padding: 60px 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        
        .cover-pattern {
            position: absolute;
            inset: 0;
            opacity: 0.1;
        }
        
        .cover-circle-1 {
            position: absolute;
            top: -200px;
            left: -200px;
            width: 400px;
            height: 400px;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            filter: blur(80px);
        }
        
        .cover-circle-2 {
            position: absolute;
            bottom: -200px;
            right: -200px;
            width: 400px;
            height: 400px;
            background: rgba(147, 51, 234, 0.3);
            border-radius: 50%;
            filter: blur(80px);
        }
        
        .cover-circle-3 {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 300px;
            height: 300px;
            background: rgba(6, 182, 212, 0.3);
            border-radius: 50%;
            filter: blur(80px);
        }
        
        .cover-content {
            position: relative;
            z-index: 10;
            max-width: 800px;
        }
        
        .brand-header {
            margin-bottom: 60px;
        }
        
        .brand-logo {
            display: inline-flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .logo-icon {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
        }
        
        .brand-name {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(45deg, #ffffff, #bfdbfe);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .brand-subtitle {
            color: #93c5fd;
            font-size: 14px;
            font-weight: 500;
        }
        
        .main-title {
            font-size: 72px;
            font-weight: bold;
            margin-bottom: 24px;
            background: linear-gradient(45deg, #ffffff, #bfdbfe, #a5f3fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1.1;
        }
        
        .report-type-badge {
            display: inline-block;
            padding: 12px 32px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 60px;
            color: #bfdbfe;
        }
        
        .client-website-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            width: 100%;
            margin-bottom: 60px;
        }
        
        .info-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            padding: 32px;
            text-align: left;
        }
        
        .info-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .info-icon {
            width: 24px;
            height: 24px;
        }
        
        .info-card-title {
            font-size: 20px;
            font-weight: bold;
            color: white;
        }
        
        .info-card-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
            color: white;
        }
        
        .info-card-detail {
            color: #bfdbfe;
        }
        
        .report-period {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            padding: 24px;
            margin-bottom: 60px;
        }
        
        .executive-summary {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
            padding: 40px;
            text-align: left;
            max-width: 600px;
            margin: 0 auto 60px;
        }
        
        .summary-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 16px;
            color: white;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .summary-content {
            line-height: 1.8;
            color: rgba(255, 255, 255, 0.9);
        }
        
        .summary-content p {
            margin-bottom: 16px;
        }
        
        .summary-footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* Content Pages */
        .content-page {
            padding: 60px 40px;
            min-height: 100vh;
        }
        
        .section-header {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .section-title {
            font-size: 36px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 16px;
            color: #1f2937;
            margin-bottom: 16px;
        }
        
        .section-icon {
            width: 32px;
            height: 32px;
        }
        
        .section-subtitle {
            background: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .overview-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-bottom: 32px;
        }
        
        .metric-card {
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .metric-card.blue {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-color: #bfdbfe;
        }
        
        .metric-card.green {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-color: #bbf7d0;
        }
        
        .metric-card.purple {
            background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
            border-color: #c4b5fd;
        }
        
        .metric-card.yellow {
            background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
            border-color: #fde047;
        }
        
        .metric-card.red {
            background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
            border-color: #fca5a5;
        }
        
        .metric-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }
        
        .metric-icon {
            width: 40px;
            height: 40px;
        }
        
        .metric-badge {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            color: white;
        }
        
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .metric-label {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .metric-description {
            font-size: 12px;
            opacity: 0.8;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            margin: 20px 0;
        }
        
        .data-table th {
            background: #f9fafb;
            padding: 16px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .data-table td {
            padding: 16px;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .data-table tr:last-child td {
            border-bottom: none;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-success {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-warning {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-error {
            background: #fecaca;
            color: #991b1b;
        }
        
        .chart-placeholder {
            height: 200px;
            background: #f9fafb;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            font-style: italic;
        }
        
        .footer-badge {
            text-align: center;
            margin-top: 60px;
        }
        
        .confidential-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
            font-weight: 500;
        }
        
        @page {
            margin: 0;
            size: A4;
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

  private generateEnhancedCoverPage(reportData: ClientReportData): string {
    const brandInfo = this.getBrandInfo(reportData);
    
    return `
      <div class="page cover-page">
        <div class="cover-pattern">
          <div class="cover-circle-1"></div>
          <div class="cover-circle-2"></div>
          <div class="cover-circle-3"></div>
        </div>
        
        <div class="cover-content">
          <div class="brand-header">
            <div class="brand-logo">
              ${brandInfo.logo.startsWith('http') ? 
                `<img src="${brandInfo.logo}" alt="Logo" style="width: 60px; height: 60px; border-radius: 16px; object-fit: cover;" />` :
                `<div class="logo-icon">${brandInfo.logo}</div>`
              }
              <div>
                <div class="brand-name">${brandInfo.name}</div>
                <div class="brand-subtitle">${brandInfo.subtitle}</div>
              </div>
            </div>
          </div>
          
          <div class="main-title">Website Care Report</div>
          
          <div class="report-type-badge">${reportData.reportType}</div>
          
          <div class="client-website-grid">
            <div class="info-card">
              <div class="info-card-header">
                <div class="info-icon">👥</div>
                <div class="info-card-title">Client</div>
              </div>
              <div class="info-card-name">${reportData.client.name}</div>
              ${reportData.client.email ? `<div class="info-card-detail">${reportData.client.email}</div>` : ''}
            </div>
            
            <div class="info-card">
              <div class="info-card-header">
                <div class="info-icon">🌐</div>
                <div class="info-card-title">Website</div>
              </div>
              <div class="info-card-name">${reportData.website.name}</div>
              <div class="info-card-detail">${reportData.website.url}</div>
              ${reportData.website.wordpressVersion ? `<div class="info-card-detail">WordPress v${reportData.website.wordpressVersion}</div>` : ''}
            </div>
          </div>
          
          <div class="report-period">
            <div class="info-card-header">
              <div class="info-icon">📅</div>
              <div class="info-card-title">Reporting Period</div>
            </div>
            <div style="font-size: 24px; font-weight: bold; color: #c084fc;">
              ${this.formatDate(reportData.dateFrom)} - ${this.formatDate(reportData.dateTo)}
            </div>
          </div>
          
          <div class="executive-summary">
            <div class="summary-title">
              ✅ Executive Summary
            </div>
            <div class="summary-content">
              <p><strong style="color: #bfdbfe;">Dear ${reportData.client.name},</strong></p>
              <p>We are pleased to present your comprehensive website maintenance report for <strong style="color: #86efac;">${reportData.website.name}</strong>. This executive summary provides detailed insights into your website's security posture, performance optimization, and maintenance activities.</p>
              <p>Our professional team has implemented <strong style="color: #fde047;">${reportData.overview.updatesPerformed} critical updates</strong>, maintained <strong style="color: #86efac;">${(reportData.overview.uptimePercentage || 0).toFixed(2)}% uptime</strong>, and ensured your website remains secure and optimally performing.</p>
              <p>This report demonstrates our commitment to maintaining the highest standards of website security, performance, and reliability for your business.</p>
              <div class="summary-footer">
                <p><strong style="color: #bfdbfe;">Professional WordPress Maintenance Team</strong></p>
                <p style="font-size: 14px; color: rgba(255, 255, 255, 0.7);">${brandInfo.footerText}</p>
              </div>
            </div>
          </div>
          
          <div class="footer-badge">
            <div class="confidential-badge">
              📊 Confidential Business Report
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private generateEnhancedOverviewPage(reportData: ClientReportData): string {
    const getSecurityColor = (status: string) => {
      switch (status) {
        case 'safe': return 'green';
        case 'warning': return 'yellow';
        case 'critical': return 'red';
        default: return 'gray';
      }
    };

    return `
      <div class="page content-page">
        <div class="section-header">
          <div class="section-title">
            📊 EXECUTIVE OVERVIEW
          </div>
          <div class="section-subtitle">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px;">
              <div><strong>🌐 Website:</strong> <span style="color: #2563eb;">${reportData.website.url}</span></div>
              <div><strong>📅 Period:</strong> ${this.formatDate(reportData.dateFrom)} - ${this.formatDate(reportData.dateTo)}</div>
              ${reportData.website.ipAddress ? `<div><strong>📡 Server IP:</strong> ${reportData.website.ipAddress}</div>` : ''}
              ${reportData.website.wordpressVersion ? `<div><strong>🛡️ WordPress:</strong> v${reportData.website.wordpressVersion}</div>` : ''}
            </div>
          </div>
        </div>
        
        <div class="overview-grid">
          <div class="metric-card blue">
            <div class="metric-header">
              <div class="metric-icon">🔄</div>
              <div class="metric-badge" style="background: #2563eb;">Maintenance</div>
            </div>
            <div class="metric-value" style="color: #1d4ed8;">${reportData.overview.updatesPerformed}</div>
            <div class="metric-label" style="color: #2563eb;">Updates Performed</div>
            <div class="metric-description" style="color: #3b82f6;">Plugins, themes, and core updates</div>
          </div>
          
          <div class="metric-card ${getSecurityColor(reportData.overview.securityStatus)}">
            <div class="metric-header">
              <div class="metric-icon">🛡️</div>
              <div class="metric-badge" style="background: ${getSecurityColor(reportData.overview.securityStatus) === 'green' ? '#16a34a' : getSecurityColor(reportData.overview.securityStatus) === 'yellow' ? '#ca8a04' : '#dc2626'};">
                ${reportData.overview.securityStatus === 'safe' ? 'Secure' : reportData.overview.securityStatus === 'warning' ? 'Caution' : 'Alert'}
              </div>
            </div>
            <div class="metric-value" style="color: ${getSecurityColor(reportData.overview.securityStatus) === 'green' ? '#15803d' : getSecurityColor(reportData.overview.securityStatus) === 'yellow' ? '#a16207' : '#b91c1c'}; text-transform: capitalize;">
              ${reportData.overview.securityStatus}
            </div>
            <div class="metric-label" style="color: ${getSecurityColor(reportData.overview.securityStatus) === 'green' ? '#16a34a' : getSecurityColor(reportData.overview.securityStatus) === 'yellow' ? '#ca8a04' : '#dc2626'};">Security Status</div>
            <div class="metric-description" style="color: ${getSecurityColor(reportData.overview.securityStatus) === 'green' ? '#22c55e' : getSecurityColor(reportData.overview.securityStatus) === 'yellow' ? '#eab308' : '#ef4444'};">Latest security assessment</div>
          </div>
          
          <div class="metric-card purple">
            <div class="metric-header">
              <div class="metric-icon">📊</div>
              <div class="metric-badge" style="background: #9333ea;">Uptime</div>
            </div>
            <div class="metric-value" style="color: #7c3aed;">${(reportData.overview.uptimePercentage || 0).toFixed(2)}%</div>
            <div class="metric-label" style="color: #9333ea;">Availability</div>
            <div class="metric-description" style="color: #a855f7;">Website operational status</div>
          </div>
          
          <div class="metric-card yellow">
            <div class="metric-header">
              <div class="metric-icon">⚡</div>
              <div class="metric-badge" style="background: #ca8a04;">Performance</div>
            </div>
            <div class="metric-value" style="color: #a16207;">${reportData.overview.performanceScore}</div>
            <div class="metric-label" style="color: #ca8a04;">PageSpeed Score</div>
            <div class="metric-description" style="color: #eab308;">Google PageSpeed insights</div>
          </div>
          
          <div class="metric-card blue">
            <div class="metric-header">
              <div class="metric-icon">🔍</div>
              <div class="metric-badge" style="background: #4338ca;">SEO</div>
            </div>
            <div class="metric-value" style="color: #3730a3;">${reportData.overview.keywordsTracked}</div>
            <div class="metric-label" style="color: #4338ca;">Keywords Tracked</div>
            <div class="metric-description" style="color: #6366f1;">Search engine optimization</div>
          </div>
          
          <div class="metric-card yellow">
            <div class="metric-header">
              <div class="metric-icon">${reportData.overview.analyticsChange >= 0 ? '📈' : '📉'}</div>
              <div class="metric-badge" style="background: #ea580c;">Analytics</div>
            </div>
            <div class="metric-value" style="color: #c2410c;">
              ${reportData.overview.analyticsChange >= 0 ? '+' : ''}${reportData.overview.analyticsChange}%
            </div>
            <div class="metric-label" style="color: #ea580c;">Session Change</div>
            <div class="metric-description" style="color: #f97316;">Visitor traffic analysis</div>
          </div>
        </div>
        
        <div style="margin-top: 32px; padding: 24px; background: linear-gradient(135deg, #f9fafb 0%, #eff6ff 100%); border-radius: 12px; border: 1px solid #e5e7eb;">
          <h4 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 16px; display: flex; align-items: center;">
            ✅ Monthly Summary
          </h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; font-size: 14px;">
            <div style="text-align: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              <div style="font-weight: 600; color: #374151;">Total Maintenance</div>
              <div style="font-size: 20px; font-weight: bold; color: #2563eb;">${reportData.overview.updatesPerformed} updates</div>
            </div>
            <div style="text-align: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              <div style="font-weight: 600; color: #374151;">Security Checks</div>
              <div style="font-size: 20px; font-weight: bold; color: #16a34a;">Active monitoring</div>
            </div>
            <div style="text-align: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              <div style="font-weight: 600; color: #374151;">Backup Status</div>
              <div style="font-size: 20px; font-weight: bold; color: #9333ea;">${reportData.overview.backupsCreated} created</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private generateEnhancedCustomWorkPage(reportData: ClientReportData): string {
    if (!reportData.customWork || reportData.customWork.length === 0) {
      return '';
    }

    return `
      <div class="page content-page">
        <div class="section-header" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-color: #bfdbfe;">
          <div class="section-title" style="color: #1e40af;">
            🔧 CUSTOM WORK
          </div>
          <div class="section-subtitle">
            <div style="color: #3b82f6; font-weight: 500;">
              Custom development and optimization tasks performed
            </div>
          </div>
        </div>
        
        <table class="data-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Task Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.customWork.map(work => `
              <tr>
                <td style="font-weight: 600;">${work.title}</td>
                <td>${work.description}</td>
                <td>${this.formatDate(work.date)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  private generateEnhancedUpdatesPage(reportData: ClientReportData): string {
    // Only include updates section if there are actual updates performed
    // Handle both ClientReportData and internal maintenance report structures
    if (!reportData.updates) {
      return '';
    }

    // Check for updates in both data structures
    const hasPluginUpdates = reportData.updates.plugins && reportData.updates.plugins.length > 0;
    const hasThemeUpdates = reportData.updates.themes && reportData.updates.themes.length > 0;
    const hasCoreUpdates = reportData.updates.core && (
      Array.isArray(reportData.updates.core) ? reportData.updates.core.length > 0 : reportData.updates.core
    );
    const hasWordPressUpdate = (reportData.updates as any).wordpress; // Internal structure
    const totalUpdates = reportData.updates.total || 0;

    // Return empty if no updates in any category
    if (!hasPluginUpdates && !hasThemeUpdates && !hasCoreUpdates && !hasWordPressUpdate && totalUpdates === 0) {
      return '';
    }

    return `
      <div class="page content-page">
        <div class="section-header" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-color: #bbf7d0;">
          <div class="section-title" style="color: #166534;">
            🔄 UPDATES
          </div>
          <div class="section-subtitle">
            <div style="color: #16a34a; font-weight: 500;">
              Total updates performed: ${reportData.updates.total} | ${this.formatDate(reportData.dateFrom)} to ${this.formatDate(reportData.dateTo)}
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
          <div style="text-align: center; padding: 16px; background: #eff6ff; border-radius: 8px;">
            <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 4px;">OVERVIEW</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <div style="font-size: 16px; font-weight: bold;">Plugin updates</div>
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${reportData.updates.plugins.length}</div>
              </div>
              <div>
                <div style="font-size: 16px; font-weight: bold;">Theme updates</div>
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${reportData.updates.themes.length}</div>
              </div>
            </div>
          </div>
        </div>
        
        <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">UPDATES HISTORY</h4>
        
        ${reportData.updates.plugins.length > 0 ? `
          <h5 style="font-weight: 600; margin-bottom: 8px;">Plugin Updates</h5>
          <table class="data-table">
            <thead>
              <tr>
                <th>Plugin Name</th>
                <th>Plugin Version</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.updates.plugins.map(plugin => `
                <tr>
                  <td>${plugin.name}</td>
                  <td>${plugin.fromVersion} → ${plugin.toVersion}</td>
                  <td>${this.formatDate(plugin.date)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
        
        ${reportData.updates.themes.length > 0 ? `
          <h5 style="font-weight: 600; margin: 16px 0 8px;">Theme Updates</h5>
          <table class="data-table">
            <thead>
              <tr>
                <th>Theme Name</th>
                <th>Theme Version</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.updates.themes.map(theme => `
                <tr>
                  <td>${theme.name}</td>
                  <td>${theme.versionFrom} → ${theme.versionTo}</td>
                  <td>${this.formatDate(theme.date)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </div>
    `;
  }

  private generateEnhancedBackupsPage(reportData: ClientReportData): string {
    // Only include backups section if backups were actually created during this period
    // Handle both ClientReportData and internal maintenance report structures
    if (!reportData.backups) {
      return '';
    }

    const backupsTotal = reportData.backups.total || 0;
    const hasBackups = backupsTotal > 0 || reportData.backups.latest || (reportData.backups as any).lastBackup;

    if (!hasBackups) {
      return '';
    }

    return `
      <div class="page content-page">
        <div class="section-header" style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-color: #c4b5fd;">
          <div class="section-title" style="color: #7c3aed;">
            💾 BACKUPS
          </div>
          <div class="section-subtitle">
            <div style="color: #9333ea; font-weight: 500;">
              Backups created: ${reportData.backups.total} | Total backups available: ${reportData.backups.totalAvailable}<br>
              ${this.formatDate(reportData.dateFrom)} to ${this.formatDate(reportData.dateTo)}
            </div>
          </div>
        </div>
        
        <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">LATEST BACKUP DETAILS</h4>
        
        <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <div style="font-weight: 600; color: #374151;">📅 Backup Date:</div>
                <div>${this.formatDate(reportData.backups.latest.date)}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <div style="font-weight: 600; color: #374151;">💾 Backup Size:</div>
                <div>${reportData.backups.latest.size || 'N/A'}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <div style="font-weight: 600; color: #374151;">🔧 WordPress Version:</div>
                <div>${reportData.backups.latest.wordpressVersion || 'N/A'}</div>
              </div>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <div style="font-weight: 600; color: #374151;">🎨 Active Theme:</div>
                <div>${reportData.backups.latest.activeTheme || 'N/A'}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <div style="font-weight: 600; color: #374151;">🔌 Active Plugins:</div>
                <div>${reportData.backups.latest.activePlugins || 0}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <div style="font-weight: 600; color: #374151;">📝 Published Posts:</div>
                <div>${reportData.backups.latest.publishedPosts || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private generateEnhancedUptimePage(reportData: ClientReportData): string {
    // Only include uptime section if uptime monitoring data exists
    if (!reportData.uptime || 
        (typeof reportData.uptime.percentage === 'undefined' && 
         typeof reportData.uptime.last24h === 'undefined' && 
         typeof reportData.uptime.last7days === 'undefined' && 
         typeof reportData.uptime.last30days === 'undefined' &&
         (!reportData.uptime.incidents || reportData.uptime.incidents.length === 0))) {
      return '';
    }

    return `
      <div class="page content-page">
        <div class="section-header" style="background: linear-gradient(135deg, #f0fdff 0%, #cffafe 100%); border-color: #a5f3fc;">
          <div class="section-title" style="color: #0e7490;">
            📊 UPTIME MONITORING
          </div>
          <div class="section-subtitle">
            <div style="color: #0891b2; font-weight: 500;">
              Website availability and performance monitoring
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px;">
          <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: bold; color: #0891b2; margin-bottom: 8px;">${(reportData.uptime.percentage || 0).toFixed(2)}%</div>
            <div style="font-weight: 600; color: #374151;">Overall Uptime</div>
          </div>
          <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: bold; color: #16a34a; margin-bottom: 8px;">${(reportData.uptime.last24h || 0).toFixed(2)}%</div>
            <div style="font-weight: 600; color: #374151;">Last 24 Hours</div>
          </div>
          <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: bold; color: #ca8a04; margin-bottom: 8px;">${(reportData.uptime.last7days || 0).toFixed(2)}%</div>
            <div style="font-weight: 600; color: #374151;">Last 7 Days</div>
          </div>
          <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: bold; color: #9333ea; margin-bottom: 8px;">${(reportData.uptime.last30days || 0).toFixed(2)}%</div>
            <div style="font-weight: 600; color: #374151;">Last 30 Days</div>
          </div>
        </div>
        
        ${reportData.uptime.incidents && reportData.uptime.incidents.length > 0 ? `
          <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">DOWNTIME INCIDENTS</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.uptime.incidents.map(incident => `
                <tr>
                  <td>${this.formatDate(incident.date)}</td>
                  <td>${incident.reason}</td>
                  <td>${incident.duration}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
            <div style="font-weight: 600; color: #166534; margin-bottom: 4px;">Excellent Uptime Performance</div>
            <div style="color: #16a34a;">No downtime incidents recorded during this period</div>
          </div>
        `}
      </div>
    `;
  }

  private generateEnhancedSecurityPage(reportData: ClientReportData): string {
    // Only include security section if security scans were performed
    // Handle both ClientReportData and internal maintenance report structures
    if (!reportData.security) {
      return '';
    }

    const totalScans = reportData.security.totalScans || 0;
    const hasLastScan = reportData.security.lastScan;
    const hasScanHistory = reportData.security.scanHistory && reportData.security.scanHistory.length > 0;

    if (totalScans === 0 && !hasLastScan && !hasScanHistory) {
      return '';
    }

    return `
      <div class="page content-page">
        <div class="section-header" style="background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); border-color: #fca5a5;">
          <div class="section-title" style="color: #dc2626;">
            🛡️ SECURITY MONITORING
          </div>
          <div class="section-subtitle">
            <div style="color: #ef4444; font-weight: 500;">
              Total security scans: ${reportData.security.totalScans} | Latest scan: ${this.formatDate(reportData.security.lastScan.date)}
            </div>
          </div>
        </div>
        
        <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">LATEST SECURITY SCAN</h4>
        
        <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; margin-bottom: 24px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
            <div style="text-align: center; padding: 16px; background: ${reportData.security.lastScan.malware === 'clean' ? '#f0fdf4' : '#fef2f2'}; border-radius: 8px;">
              <div style="font-size: 24px; margin-bottom: 8px;">${reportData.security.lastScan.malware === 'clean' ? '✅' : '❌'}</div>
              <div style="font-weight: 600; color: ${reportData.security.lastScan.malware === 'clean' ? '#166534' : '#dc2626'};">Malware Status</div>
              <div style="color: ${reportData.security.lastScan.malware === 'clean' ? '#16a34a' : '#ef4444'}; text-transform: capitalize;">
                ${reportData.security.lastScan.malware || 'Clean'}
              </div>
            </div>
            <div style="text-align: center; padding: 16px; background: ${reportData.security.lastScan.webTrust === 'clean' ? '#f0fdf4' : '#fef3c7'}; border-radius: 8px;">
              <div style="font-size: 24px; margin-bottom: 8px;">${reportData.security.lastScan.webTrust === 'clean' ? '✅' : '⚠️'}</div>
              <div style="font-weight: 600; color: ${reportData.security.lastScan.webTrust === 'clean' ? '#166534' : '#92400e'};">Web Trust</div>
              <div style="color: ${reportData.security.lastScan.webTrust === 'clean' ? '#16a34a' : '#ca8a04'}; text-transform: capitalize;">
                ${reportData.security.lastScan.webTrust || 'Clean'}
              </div>
            </div>
            <div style="text-align: center; padding: 16px; background: ${(reportData.security.lastScan.vulnerabilities || 0) === 0 ? '#f0fdf4' : '#fef2f2'}; border-radius: 8px;">
              <div style="font-size: 24px; margin-bottom: 8px;">${(reportData.security.lastScan.vulnerabilities || 0) === 0 ? '✅' : '❌'}</div>
              <div style="font-weight: 600; color: ${(reportData.security.lastScan.vulnerabilities || 0) === 0 ? '#166534' : '#dc2626'};">Vulnerabilities</div>
              <div style="color: ${(reportData.security.lastScan.vulnerabilities || 0) === 0 ? '#16a34a' : '#ef4444'};">
                ${reportData.security.lastScan.vulnerabilities || 0} found
              </div>
            </div>
          </div>
        </div>
        
        ${reportData.security.scanHistory && reportData.security.scanHistory.length > 0 ? `
          <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">SECURITY SCAN HISTORY</h4>
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
              ${reportData.security.scanHistory.slice(0, 10).map(scan => `
                <tr>
                  <td>${this.formatDate(scan.date)}</td>
                  <td><span class="status-badge ${scan.malware === 'clean' ? 'status-success' : 'status-error'}">${scan.malware}</span></td>
                  <td><span class="status-badge ${scan.vulnerabilities === 'clean' ? 'status-success' : 'status-warning'}">${scan.vulnerabilities}</span></td>
                  <td><span class="status-badge ${scan.webTrust === 'clean' ? 'status-success' : 'status-warning'}">${scan.webTrust}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </div>
    `;
  }

  private generateEnhancedPerformancePage(reportData: ClientReportData): string {
    // Only include performance section if performance checks were performed
    // Handle both ClientReportData and internal maintenance report structures
    if (!reportData.performance) {
      return '';
    }

    const totalChecks = reportData.performance.totalChecks || 0;
    const hasLastScan = reportData.performance.lastScan;
    const hasHistory = reportData.performance.history && reportData.performance.history.length > 0;

    if (totalChecks === 0 && !hasLastScan && !hasHistory) {
      return '';
    }

    return `
      <div class="page content-page">
        <div class="section-header" style="background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%); border-color: #fde047;">
          <div class="section-title" style="color: #a16207;">
            ⚡ PERFORMANCE MONITORING
          </div>
          <div class="section-subtitle">
            <div style="color: #ca8a04; font-weight: 500;">
              Total performance checks: ${reportData.performance.totalChecks} | Latest scan: ${this.formatDate(reportData.performance.lastScan.date)}
            </div>
          </div>
        </div>
        
        <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">LATEST PERFORMANCE SCAN</h4>
        
        <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; margin-bottom: 24px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
            <div style="text-align: center; padding: 16px; background: #eff6ff; border-radius: 8px;">
              <div style="font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 8px;">
                ${reportData.performance.lastScan.pageSpeedScore || 0}/100
              </div>
              <div style="font-weight: 600; color: #374151;">PageSpeed Score</div>
              <div style="color: #6b7280;">Grade: ${reportData.performance.lastScan.pageSpeedGrade || 'N/A'}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: #f0fdf4; border-radius: 8px;">
              <div style="font-size: 28px; font-weight: bold; color: #16a34a; margin-bottom: 8px;">
                ${reportData.performance.lastScan.ysloScore || 0}/100
              </div>
              <div style="font-weight: 600; color: #374151;">YSlow Score</div>
              <div style="color: #6b7280;">Grade: ${reportData.performance.lastScan.ysloGrade || 'N/A'}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: #fef3c7; border-radius: 8px;">
              <div style="font-size: 28px; font-weight: bold; color: #ca8a04; margin-bottom: 8px;">
                ${reportData.performance.lastScan.loadTime || 0}s
              </div>
              <div style="font-weight: 600; color: #374151;">Load Time</div>
              <div style="color: #6b7280;">Page load speed</div>
            </div>
          </div>
        </div>
        
        ${reportData.performance.history && reportData.performance.history.length > 0 ? `
          <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">PERFORMANCE HISTORY</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Load Time</th>
                <th>PageSpeed Score</th>
                <th>YSlow Score</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.performance.history.slice(0, 10).map(scan => `
                <tr>
                  <td>${this.formatDate(scan.date)}</td>
                  <td>${scan.loadTime}s</td>
                  <td>${scan.pageSpeedScore}/100</td>
                  <td>${scan.ysloScore}/100</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </div>
    `;
  }

  private generateEnhancedSEOPage(reportData: ClientReportData): string {
    // Only include SEO section if keywords are being tracked or SEO data exists
    if (!reportData.seo || 
        (!reportData.seo.keywords || reportData.seo.keywords.length === 0) && 
        !reportData.seo.visibility && 
        !reportData.seo.topRankKeywords && 
        !reportData.seo.firstPageKeywords) {
      return '';
    }

    return `
      <div class="page content-page">
        <div class="section-header" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-color: #7dd3fc;">
          <div class="section-title" style="color: #0369a1;">
            🔍 SEO MONITORING
          </div>
          <div class="section-subtitle">
            <div style="color: #0284c7; font-weight: 500;">
              Keywords tracked: ${reportData.seo.keywords?.length || 0} | Visibility change: ${reportData.seo.visibilityChange >= 0 ? '+' : ''}${reportData.seo.visibilityChange || 0}%
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px;">
          <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: bold; color: #0891b2; margin-bottom: 8px;">${reportData.seo.topRankKeywords || 0}</div>
            <div style="font-weight: 600; color: #374151;">Top 3 Rankings</div>
          </div>
          <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: bold; color: #16a34a; margin-bottom: 8px;">${reportData.seo.firstPageKeywords || 0}</div>
            <div style="font-weight: 600; color: #374151;">First Page</div>
          </div>
          <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: bold; color: #ca8a04; margin-bottom: 8px;">${(reportData.seo.visibility || 0).toFixed(1)}%</div>
            <div style="font-weight: 600; color: #374151;">Visibility Score</div>
          </div>
          <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: bold; color: #9333ea; margin-bottom: 8px;">${reportData.seo.competitors || 0}</div>
            <div style="font-weight: 600; color: #374151;">Competitors</div>
          </div>
        </div>
        
        ${reportData.seo.keywords && reportData.seo.keywords.length > 0 ? `
          <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">KEYWORD RANKINGS</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Current Rank</th>
                <th>Previous Rank</th>
                <th>Change</th>
                <th>Page</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.seo.keywords.slice(0, 15).map(keyword => {
                const change = keyword.currentRank - keyword.previousRank;
                const changeClass = change < 0 ? 'status-success' : change > 0 ? 'status-error' : 'status-warning';
                const changeSymbol = change < 0 ? '↗️' : change > 0 ? '↘️' : '→';
                return `
                  <tr>
                    <td style="font-weight: 500;">${keyword.keyword}</td>
                    <td>${keyword.currentRank}</td>
                    <td>${keyword.previousRank}</td>
                    <td><span class="status-badge ${changeClass}">${changeSymbol} ${Math.abs(change)}</span></td>
                    <td>${keyword.page || 'N/A'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : ''}
        
        ${reportData.seo.topCompetitors && reportData.seo.topCompetitors.length > 0 ? `
          <h4 style="font-size: 18px; font-weight: 600; margin: 24px 0 12px;">TOP COMPETITORS</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Visibility Score</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.seo.topCompetitors.slice(0, 10).map(competitor => `
                <tr>
                  <td style="font-weight: 500;">${competitor.domain}</td>
                  <td>${competitor.visibilityScore.toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </div>
    `;
  }
}