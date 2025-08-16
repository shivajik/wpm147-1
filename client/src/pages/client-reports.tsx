import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/components/layout/app-layout';

import ReportTemplatesDialog from '@/components/reports/report-templates-dialog';
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Send, 
  Settings,
  Calendar,
  Users,
  TrendingUp,
  Shield,
  Search,
  Palette,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import type { ClientReport, Client, Website } from '@shared/schema';
import { apiCall } from '@/lib/queryClient';

interface ClientReportWithRelations extends ClientReport {
  client: Client;
  website: Website;
}

export default function ClientReports() {
  const [, setLocation] = useLocation();
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery<ClientReportWithRelations[]>({
    queryKey: ['/api/client-reports'],
  });

  const { data: stats } = useQuery<{
    totalReports: number;
    sentThisMonth: number;
    activeClients: number;
    averageScore: number;
  }>({
    queryKey: ['/api/client-reports/stats'],
  });

  const downloadReport = useMutation({
    mutationFn: async (reportId: number) => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      // Directly open PDF with authentication token and PDF parameter
      window.open(`/api/client-reports/${reportId}/pdf?pdf=true&token=${token}`, '_blank');
    },
  });

  const resendReport = useMutation({
    mutationFn: async (reportId: number) => {
      return apiCall(`/api/client-reports/${reportId}/resend`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-reports'] });
    },
  });

  const generateReport = useMutation({
    mutationFn: async (reportId: number) => {
      return apiCall(`/api/client-reports/${reportId}/generate`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-reports'] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Generated</Badge>;
      case 'sent':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><Send className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReports = reports?.filter(report => {
    if (selectedTab === 'all') return true;
    return report.status === selectedTab;
  }) || [];

  return (
    <AppLayout title="Client Reports">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Client Reports</h1>
            <p className="text-muted-foreground">
              Create and manage professional client reports with security, SEO, performance, and update insights.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowTemplatesDialog(true)}
            >
              <Palette className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button onClick={() => setLocation('/client-reports/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Total Reports</p>
                  <p className="text-2xl font-bold">{stats?.totalReports || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Send className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Sent This Month</p>
                  <p className="text-2xl font-bold">{stats?.sentThisMonth || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Active Clients</p>
                  <p className="text-2xl font-bold">{stats?.activeClients || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Avg Score</p>
                  <p className="text-2xl font-bold">{stats?.averageScore || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reports</CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="draft">Draft</TabsTrigger>
                    <TabsTrigger value="generated">Generated</TabsTrigger>
                    <TabsTrigger value="sent">Sent</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedTab === 'all' 
                    ? "Get started by creating your first client report." 
                    : `No ${selectedTab} reports found.`
                  }
                </p>
                {selectedTab === 'all' && (
                  <Button onClick={() => setLocation('/client-reports/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Report
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>{report.client?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {Array.isArray(report.websiteIds) && report.websiteIds.length > 0 
                          ? `${report.websiteIds.length} website(s)` 
                          : 'No websites'
                        }
                      </TableCell>
                      <TableCell>
                        {report.dateFrom && report.dateTo 
                          ? `${format(new Date(report.dateFrom), 'MMM dd')} - ${format(new Date(report.dateTo), 'MMM dd, yyyy')}`
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.createdAt ? format(new Date(report.createdAt), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {report.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateReport.mutate(report.id)}
                              disabled={generateReport.isPending}
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              Generate
                            </Button>
                          )}
                          {(report.status === 'generated' || report.status === 'sent') && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadReport.mutate(report.id)}
                                disabled={downloadReport.isPending}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resendReport.mutate(report.id)}
                                disabled={resendReport.isPending}
                              >
                                <Send className="w-3 h-3 mr-1" />
                                Resend
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (report.status === 'generated' || report.status === 'sent') {
                                setLocation(`/client-reports/${report.id}/view`);
                              } else {
                                alert('Please generate the report first before viewing');
                              }
                            }}
                            title={report.status === 'draft' ? 'Generate report first' : 'View report'}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      
      <ReportTemplatesDialog 
        open={showTemplatesDialog} 
        onOpenChange={setShowTemplatesDialog}
      />
    </AppLayout>
  );
}