import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Globe,
  Database,
  Zap,
  Search,
  Calendar,
  Users,
  Activity,
  BarChart3,
  Clock,
  Download,
  RefreshCw,
  Wrench
} from 'lucide-react';
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
  dateFrom: string;
  dateTo: string;
  reportType: string;
  // Overview metrics
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
  // Detailed sections
  customWork?: Array<{
    title: string;
    description: string;
    date: string;
  }>;
  updates: {
    total: number;
    plugins: Array<{
      name: string;
      versionFrom: string;
      versionTo: string;
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

interface EnhancedReportTemplateProps {
  reportData: ClientReportData;
  isPrintMode?: boolean;
}

export function EnhancedReportTemplate({ reportData, isPrintMode = false }: EnhancedReportTemplateProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getGradeFromScore = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    try {
      if (!dateString) return 'N/A';
      
      let date: Date;
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string') {
        // Handle various string formats
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
  };

  const formatDateTime = (dateString: string | Date | null | undefined) => {
    try {
      if (!dateString) return 'N/A';
      
      let date: Date;
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string') {
        // Handle various string formats
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
      return format(date, 'MM/dd/yyyy HH:mm');
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className={`${isPrintMode ? 'print:block' : ''} max-w-5xl mx-auto bg-white`}>
      {/* Premium Cover Page */}
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden text-white mb-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full -translate-x-48 -translate-y-48 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full translate-x-48 translate-y-48 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400 rounded-full -translate-x-32 -translate-y-32 blur-3xl"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-12 text-center">
          {/* Brand Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-2xl">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  AIO WEBCARE
                </h1>
                <p className="text-blue-200 text-sm font-medium">Professional WordPress Management</p>
              </div>
            </div>
          </div>

          {/* Main Title */}
          <div className="mb-16 text-center max-w-4xl">
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent leading-tight">
              Website Care Report
            </h2>
            <div className="inline-block px-8 py-3 bg-white/20 backdrop-blur-lg rounded-full border border-white/30 mb-8">
              <span className="text-xl font-semibold text-blue-100">{reportData.reportType}</span>
            </div>
          </div>

          {/* Client & Website Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 w-full max-w-4xl">
            {/* Client Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-300" />
                <h3 className="text-xl font-bold text-white">Client</h3>
              </div>
              <h4 className="text-2xl font-bold mb-2 text-white">{reportData.client.name}</h4>
              {reportData.client.email && (
                <p className="text-blue-200">{reportData.client.email}</p>
              )}
            </div>

            {/* Website Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-green-300" />
                <h3 className="text-xl font-bold text-white">Website</h3>
              </div>
              <h4 className="text-2xl font-bold mb-2 text-white">{reportData.website.name}</h4>
              <p className="text-green-200 font-medium">{reportData.website.url}</p>
              {reportData.website.wordpressVersion && (
                <p className="text-blue-200 text-sm mt-2">WordPress v{reportData.website.wordpressVersion}</p>
              )}
            </div>
          </div>

          {/* Report Period */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl mb-16">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Calendar className="w-6 h-6 text-purple-300" />
              <h3 className="text-xl font-bold text-white">Reporting Period</h3>
            </div>
            <p className="text-2xl font-bold text-purple-200">
              {formatDate(reportData.dateFrom)} - {formatDate(reportData.dateTo)}
            </p>
          </div>

          {/* Executive Summary Letter */}
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl border border-white/30 p-10 shadow-2xl text-left max-w-3xl">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Executive Summary
              </h3>
            </div>
            
            <div className="space-y-4 text-white/90 leading-relaxed">
              <p className="text-lg">
                <span className="font-semibold text-blue-200">Dear {reportData.client.name},</span>
              </p>
              <p>
                We are pleased to present your comprehensive website maintenance report for <span className="font-semibold text-green-200">{reportData.website.name}</span>. 
                This executive summary provides detailed insights into your website's security posture, performance optimization, and maintenance activities.
              </p>
              <p>
                Our professional team has implemented <span className="font-bold text-yellow-200">{reportData.overview.updatesPerformed} critical updates</span>, 
                maintained <span className="font-bold text-green-200">{(reportData.overview.uptimePercentage || 0).toFixed(2)}% uptime</span>, 
                and ensured your website remains secure and optimally performing.
              </p>
              <p>
                This report demonstrates our commitment to maintaining the highest standards of website security, performance, and reliability for your business.
              </p>
              
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="font-semibold text-blue-200">Professional WordPress Maintenance Team</p>
                <p className="text-sm text-white/70 mt-1">AIO Webcare - Comprehensive WordPress Management</p>
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="mt-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-lg rounded-full border border-white/30">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Confidential Business Report</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <Card className="mb-8 border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2">
          <CardTitle className="text-3xl font-bold flex items-center gap-3 text-gray-800">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            EXECUTIVE OVERVIEW
          </CardTitle>
          <div className="bg-white p-4 rounded-lg mt-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="font-semibold text-gray-700">
                <Globe className="w-4 h-4 inline mr-2 text-blue-600" />
                Website: <span className="font-normal text-blue-600">{reportData.website.url}</span>
              </div>
              <div className="font-semibold text-gray-700">
                <Calendar className="w-4 h-4 inline mr-2 text-green-600" />
                Reporting Period: <span className="font-normal">{formatDate(reportData.dateFrom)} - {formatDate(reportData.dateTo)}</span>
              </div>
              {reportData.website.ipAddress && (
                <div className="font-semibold text-gray-700">
                  <Activity className="w-4 h-4 inline mr-2 text-orange-600" />
                  Server IP: <span className="font-normal text-gray-600">{reportData.website.ipAddress}</span>
                </div>
              )}
              {reportData.website.wordpressVersion && (
                <div className="font-semibold text-gray-700">
                  <Shield className="w-4 h-4 inline mr-2 text-purple-600" />
                  WordPress: <span className="font-normal text-gray-600">v{reportData.website.wordpressVersion}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Maintenance Activity */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <RefreshCw className="w-10 h-10 text-blue-600" />
                <Badge className="bg-blue-600 text-white px-3 py-1">Maintenance</Badge>
              </div>
              <div className="text-3xl font-bold text-blue-700 mb-2">{reportData.overview.updatesPerformed}</div>
              <div className="text-sm font-medium text-blue-600 mb-1">Updates Performed</div>
              <div className="text-xs text-blue-500">Plugins, themes, and core updates</div>
            </div>

            {/* Security Status */}
            <div className={`p-6 rounded-xl border shadow-md ${
              reportData.overview.securityStatus === 'safe' 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                : reportData.overview.securityStatus === 'warning'
                ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <Shield className={`w-10 h-10 ${
                  reportData.overview.securityStatus === 'safe' ? 'text-green-600' : 
                  reportData.overview.securityStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`} />
                <Badge className={`px-3 py-1 text-white ${
                  reportData.overview.securityStatus === 'safe' ? 'bg-green-600' : 
                  reportData.overview.securityStatus === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {reportData.overview.securityStatus === 'safe' ? 'Secure' : 
                   reportData.overview.securityStatus === 'warning' ? 'Caution' : 'Alert'}
                </Badge>
              </div>
              <div className={`text-3xl font-bold mb-2 capitalize ${
                reportData.overview.securityStatus === 'safe' ? 'text-green-700' : 
                reportData.overview.securityStatus === 'warning' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {reportData.overview.securityStatus}
              </div>
              <div className={`text-sm font-medium mb-1 ${
                reportData.overview.securityStatus === 'safe' ? 'text-green-600' : 
                reportData.overview.securityStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                Security Status
              </div>
              <div className={`text-xs ${
                reportData.overview.securityStatus === 'safe' ? 'text-green-500' : 
                reportData.overview.securityStatus === 'warning' ? 'text-yellow-500' : 'text-red-500'
              }`}>
                Latest security assessment
              </div>
            </div>

            {/* Website Uptime */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-10 h-10 text-purple-600" />
                <Badge className="bg-purple-600 text-white px-3 py-1">Uptime</Badge>
              </div>
              <div className="text-3xl font-bold text-purple-700 mb-2">{(reportData.overview.uptimePercentage || 0).toFixed(2)}%</div>
              <div className="text-sm font-medium text-purple-600 mb-1">Availability</div>
              <div className="text-xs text-purple-500">Website operational status</div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-10 h-10 text-yellow-600" />
                <Badge className="bg-yellow-600 text-white px-3 py-1">Performance</Badge>
              </div>
              <div className="text-3xl font-bold text-yellow-700 mb-2">{reportData.overview.performanceScore}</div>
              <div className="text-sm font-medium text-yellow-600 mb-1">PageSpeed Score</div>
              <div className="text-xs text-yellow-500">Google PageSpeed insights</div>
            </div>

            {/* SEO Progress */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <Search className="w-10 h-10 text-indigo-600" />
                <Badge className="bg-indigo-600 text-white px-3 py-1">SEO</Badge>
              </div>
              <div className="text-3xl font-bold text-indigo-700 mb-2">{reportData.overview.keywordsTracked}</div>
              <div className="text-sm font-medium text-indigo-600 mb-1">Keywords Tracked</div>
              <div className="text-xs text-indigo-500">Search engine optimization</div>
            </div>

            {/* Analytics Growth */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-md">
              <div className="flex items-center justify-between mb-4">
                {reportData.overview.analyticsChange >= 0 ? (
                  <TrendingUp className="w-10 h-10 text-orange-600" />
                ) : (
                  <TrendingDown className="w-10 h-10 text-orange-600" />
                )}
                <Badge className="bg-orange-600 text-white px-3 py-1">Analytics</Badge>
              </div>
              <div className="text-3xl font-bold text-orange-700 mb-2">
                {reportData.overview.analyticsChange >= 0 ? '+' : ''}{reportData.overview.analyticsChange}%
              </div>
              <div className="text-sm font-medium text-orange-600 mb-1">Session Change</div>
              <div className="text-xs text-orange-500">Visitor traffic analysis</div>
            </div>
          </div>
          
          {/* Professional Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Monthly Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="font-semibold text-gray-700">Total Maintenance</div>
                <div className="text-2xl font-bold text-blue-600">{reportData.overview.updatesPerformed} updates</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="font-semibold text-gray-700">Security Checks</div>
                <div className="text-2xl font-bold text-green-600">Active monitoring</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="font-semibold text-gray-700">Backup Status</div>
                <div className="text-2xl font-bold text-purple-600">{reportData.overview.backupsCreated} created</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Work Section */}
      {reportData.customWork && reportData.customWork.length > 0 && (
        <Card className="mb-8 border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50 to-indigo-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <CardTitle className="text-2xl font-bold flex items-center gap-4 mb-2">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  CUSTOM WORK
                </span>
              </CardTitle>
              <div className="text-blue-100 text-sm font-medium pl-16">
                Custom development and optimization tasks performed
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Task</th>
                    <th className="text-left p-3 font-semibold">Task description</th>
                    <th className="text-left p-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.customWork.map((work, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 font-medium">{work.title}</td>
                      <td className="p-3">{work.description}</td>
                      <td className="p-3">{formatDate(work.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Updates Section */}
      <Card className="mb-8 border-0 shadow-2xl bg-gradient-to-br from-white via-green-50 to-emerald-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-emerald-600/90 to-teal-600/90 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <CardTitle className="text-2xl font-bold flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                UPDATES
              </span>
            </CardTitle>
            <div className="text-green-100 text-sm font-medium pl-16">
              Total updates performed: {reportData.updates.total} | {formatDate(reportData.dateFrom)} to {formatDate(reportData.dateTo)}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">OVERVIEW</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-bold">Plugin updates</div>
                  <div className="text-2xl font-bold text-blue-600">{reportData.updates.plugins.length}</div>
                </div>
                <div>
                  <div className="text-lg font-bold">Theme updates</div>
                  <div className="text-2xl font-bold text-blue-600">{reportData.updates.themes.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">UPDATES HISTORY</h4>
              
              {reportData.updates.plugins.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium mb-2">Plugin name</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Plugin name</th>
                          <th className="text-left p-2 font-medium">Plugin version</th>
                          <th className="text-left p-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.updates.plugins.map((plugin, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{plugin.name}</td>
                            <td className="p-2">{plugin.versionFrom} → {plugin.versionTo}</td>
                            <td className="p-2">{formatDate(plugin.date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportData.updates.themes.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Theme name</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Theme name</th>
                          <th className="text-left p-2 font-medium">Theme version</th>
                          <th className="text-left p-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.updates.themes.map((theme, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{theme.name}</td>
                            <td className="p-2">{theme.versionFrom} → {theme.versionTo}</td>
                            <td className="p-2">{formatDate(theme.date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backups Section */}
      <Card className="mb-8 border-0 shadow-2xl bg-gradient-to-br from-white via-purple-50 to-violet-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-violet-600/90 to-indigo-600/90 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <CardTitle className="text-2xl font-bold flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                BACKUPS
              </span>
            </CardTitle>
            <div className="text-purple-100 text-sm font-medium pl-16">
              Backups created: {reportData.backups.total} | Total backups available: {reportData.backups.totalAvailable}
              <br />
              {formatDate(reportData.dateFrom)} to {formatDate(reportData.dateTo)}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">LATEST BACKUPS</h4>
            <div className="text-xl font-bold mb-4">{formatDateTime(reportData.backups.latest.date)}</div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Backup size</div>
                <div className="font-bold">{reportData.backups.latest.size}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">WordPress version</div>
                <div className="font-bold">{reportData.backups.latest.wordpressVersion}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Active Theme</div>
                <div className="font-bold">{reportData.backups.latest.activeTheme}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Active Plugins</div>
                <div className="font-bold">{reportData.backups.latest.activePlugins}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Published posts</div>
                <div className="font-bold">{reportData.backups.latest.publishedPosts}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Approved comments</div>
                <div className="font-bold">{reportData.backups.latest.approvedComments}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uptime Section */}
      <Card className="mb-8 border-0 shadow-2xl bg-gradient-to-br from-white via-cyan-50 to-blue-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/90 via-blue-600/90 to-indigo-600/90 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <CardTitle className="text-2xl font-bold flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                UPTIME
              </span>
            </CardTitle>
            <div className="text-cyan-100 text-sm font-medium pl-16">
              Overall Uptime: {reportData.uptime?.percentage?.toFixed(3) || '99.900'}%
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">OVERVIEW</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded">
                <div className="text-sm text-gray-600">last 24 hours</div>
                <div className="text-xl font-bold text-green-600">{reportData.uptime?.last24h || '99.9'}%</div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-sm text-gray-600">last 7 days</div>
                <div className="text-xl font-bold text-green-600">{reportData.uptime?.last7days || '99.8'}%</div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-sm text-gray-600">last 30 days</div>
                <div className="text-xl font-bold text-green-600">{reportData.uptime?.last30days || '99.7'}%</div>
              </div>
            </div>
          </div>

          {reportData.uptime?.incidents && reportData.uptime.incidents.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3">UPTIME HISTORY</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Event</th>
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-left p-2 font-medium">Reason</th>
                      <th className="text-left p-2 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.uptime.incidents.map((incident, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 text-red-600 font-medium">DOWNTIME</td>
                        <td className="p-2">{formatDate(incident.date)}</td>
                        <td className="p-2">{incident.reason || '-'}</td>
                        <td className="p-2">{incident.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card className="mb-8 border-0 shadow-2xl bg-gradient-to-br from-white via-red-50 to-orange-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-orange-600/90 to-amber-600/90 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <CardTitle className="text-2xl font-bold flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                SECURITY
              </span>
            </CardTitle>
            <div className="text-red-100 text-sm font-medium pl-16">
              Total security checks: {reportData.security.totalScans}
              <br />
              {formatDate(reportData.dateFrom)} to {formatDate(reportData.dateTo)}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">MOST RECENT SCAN</h4>
            <div className="text-lg font-bold mb-4">{formatDateTime(reportData.security.lastScan.date)}</div>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Status:</div>
                <div className="font-bold text-green-600 capitalize">{reportData.security.lastScan.status}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Malware:</div>
                <div className="font-bold text-green-600 capitalize">{reportData.security.lastScan.malware}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Web Trust:</div>
                <div className="font-bold text-green-600 capitalize">{reportData.security.lastScan.webTrust}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Vulnerabilities:</div>
                <div className="font-bold text-green-600">{reportData.security.lastScan.vulnerabilities}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">SECURITY SCAN HISTORY</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Date</th>
                    <th className="text-left p-2 font-medium">Malware</th>
                    <th className="text-left p-2 font-medium">Vulnerabilities</th>
                    <th className="text-left p-2 font-medium">Web Trust</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.security.scanHistory.slice(0, 10).map((scan, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{formatDateTime(scan.date)}</td>
                      <td className="p-2 capitalize text-green-600">{scan.malware}</td>
                      <td className="p-2 capitalize text-green-600">{scan.vulnerabilities}</td>
                      <td className="p-2 capitalize text-green-600">{scan.webTrust}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Section */}
      <Card className="mb-8 border-0 shadow-2xl bg-gradient-to-br from-white via-yellow-50 to-orange-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/90 via-orange-600/90 to-red-600/90 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <CardTitle className="text-2xl font-bold flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                PERFORMANCE
              </span>
            </CardTitle>
            <div className="text-yellow-100 text-sm font-medium pl-16">
              Total performance checks: {reportData.performance.totalChecks}
              <br />
              {formatDate(reportData.dateFrom)} to {formatDate(reportData.dateTo)}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">MOST RECENT SCAN</h4>
            <div className="text-lg font-bold mb-4">{formatDateTime(reportData.performance.lastScan.date)}</div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">PageSpeed Grade</div>
                <div className="text-4xl font-bold text-blue-600 mb-2">{reportData.performance.lastScan.pageSpeedGrade} ({reportData.performance.lastScan.pageSpeedScore}%)</div>
                <div className="text-sm text-gray-600">Previous check: {reportData.performance.lastScan.pageSpeedScore}%</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">YSlow Grade</div>
                <div className="text-4xl font-bold text-orange-600 mb-2">{reportData.performance.lastScan.ysloGrade} ({reportData.performance.lastScan.ysloScore}%)</div>
                <div className="text-sm text-gray-600">Previous check: {reportData.performance.lastScan.ysloScore}%</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">PERFORMANCE HISTORY</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Date</th>
                    <th className="text-left p-2 font-medium">Load time</th>
                    <th className="text-left p-2 font-medium">PageSpeed</th>
                    <th className="text-left p-2 font-medium">YSlow</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.performance.history.slice(0, 5).map((perf, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{formatDateTime(perf.date)}</td>
                      <td className="p-2">{perf.loadTime.toFixed(2)} s</td>
                      <td className="p-2">{getGradeFromScore(perf.pageSpeedScore)} ({perf.pageSpeedScore}%)</td>
                      <td className="p-2">{getGradeFromScore(perf.ysloScore)} ({perf.ysloScore}%)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Section */}
      <Card className="mb-8 border-0 shadow-2xl bg-gradient-to-br from-white via-indigo-50 to-purple-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <CardTitle className="text-2xl font-bold flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
                SEO
              </span>
            </CardTitle>
            <div className="text-indigo-100 text-sm font-medium pl-16">
              Visibility {(reportData.seo?.visibilityChange || 0) >= 0 ? 'up' : 'down'} by: {Math.abs(reportData.seo?.visibilityChange || 0)}%
              <br />
              Competitors: {reportData.seo?.competitors || 0}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">OVERVIEW</h4>
            <div className="grid grid-cols-4 gap-4 text-center mb-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Keywords</div>
                <div className="text-xl font-bold">{reportData.seo?.keywords?.length || 0}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">TopRank</div>
                <div className="text-xl font-bold">{reportData.seo?.topRankKeywords || 0}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">First page</div>
                <div className="text-xl font-bold">{reportData.seo?.firstPageKeywords || 0}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Visibility</div>
                <div className="text-xl font-bold">{reportData.seo?.visibility || '0%'}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-sm text-gray-600">Better</div>
                <div className="text-xl font-bold text-blue-600">
                  {reportData.seo?.keywords?.filter(k => k.currentRank < k.previousRank).length || 0}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">No Change</div>
                <div className="text-xl font-bold">
                  {reportData.seo?.keywords?.filter(k => k.currentRank === k.previousRank).length || 0}
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <div className="text-sm text-gray-600">Worse</div>
                <div className="text-xl font-bold text-red-600">
                  {reportData.seo?.keywords?.filter(k => k.currentRank > k.previousRank).length || 0}
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-sm text-gray-600">Visibility Change</div>
                <div className="text-xl font-bold text-green-600">{reportData.seo?.visibilityChange || 0}%</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">WE ARE MONITORING {reportData.seo?.keywords?.length || 0} KEYWORDS</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Flag</th>
                    <th className="text-left p-2 font-medium">Keyword</th>
                    <th className="text-left p-2 font-medium">City</th>
                    <th className="text-left p-2 font-medium">Page</th>
                    <th className="text-left p-2 font-medium">Newest Rank</th>
                    <th className="text-left p-2 font-medium">Oldest Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.seo?.keywords?.map((keyword, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        {keyword.currentRank < keyword.previousRank ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : keyword.currentRank > keyword.previousRank ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <div className="w-4 h-4"></div>
                        )}
                      </td>
                      <td className="p-2 font-medium">{keyword.keyword}</td>
                      <td className="p-2">-</td>
                      <td className="p-2">{keyword.page || '-'}</td>
                      <td className="p-2 text-center">{keyword.currentRank || 0}</td>
                      <td className="p-2 text-center">{keyword.previousRank || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">COMPETITION</h4>
            <p className="text-gray-600 mb-4">We found that following websites are your biggest competitors for given keywords</p>
            <div className="space-y-2">
              {reportData.seo?.topCompetitors?.slice(0, 6).map((competitor, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="font-medium">{competitor.domain}</div>
                  <div className="font-bold text-blue-600">{competitor.visibilityScore?.toFixed(2) || '0.00'}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}