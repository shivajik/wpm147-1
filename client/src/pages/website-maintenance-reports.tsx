import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  Wrench,
  Plus,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  BarChart3,
  RefreshCw,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";

interface MaintenanceReport {
  id: number;
  websiteId: number;
  title: string;
  reportType: 'maintenance';
  status: 'draft' | 'generated' | 'sent' | 'failed';
  createdAt: string;
  generatedAt?: string;
  data?: any;
}

interface WebsiteInfo {
  id: number;
  name: string;
  url: string;
  status: string;
}

export default function WebsiteMaintenanceReports() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const websiteId = parseInt(id || '0');
  const [selectedTab, setSelectedTab] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch website info
  const { data: website } = useQuery<WebsiteInfo>({
    queryKey: ['/api/websites', websiteId],
  });

  // Fetch maintenance reports from the real API
  const { data: reports, isLoading } = useQuery<MaintenanceReport[]>({
    queryKey: ['/api/websites', websiteId, 'maintenance-reports'],
  });

  const generateMaintenanceReport = useMutation({
    mutationFn: async () => {
      const response = await apiCall(`/api/websites/${websiteId}/maintenance-report`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Maintenance Report Generated",
        description: "Your maintenance report has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'maintenance-reports'] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate maintenance report",
        variant: "destructive",
      });
    },
  });

  // Helper function to get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Download maintenance report mutation
  const downloadMaintenanceReport = useMutation({
    mutationFn: async (reportId: number) => {
      // Get the authentication token from localStorage
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Open the PDF in a new tab for viewing/downloading with token
      const url = `/api/websites/${websiteId}/maintenance-reports/${reportId}/pdf?token=${token}`;
      window.open(url, '_blank');
      return { success: true };
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download maintenance report",
        variant: "destructive",
      });
    },
  });

  // View maintenance report mutation
  const viewMaintenanceReport = useMutation({
    mutationFn: async (reportId: number) => {
      // Get the authentication token from localStorage
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Open the PDF directly in a new tab with token
      const url = `/api/websites/${websiteId}/maintenance-reports/${reportId}/pdf?token=${token}`;
      window.open(url, '_blank');
      return { success: true };
    },
    onError: (error: any) => {
      toast({
        title: "View Failed",
        description: error.message || "Failed to view maintenance report",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Generated</Badge>;
      case 'sent':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
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
    <AppLayout title={`Maintenance Reports - ${website?.name || 'Website'}`}>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(`/websites/${websiteId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Website
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Maintenance Reports</h1>
            <p className="text-muted-foreground mt-1">
              {website?.name || 'Loading...'} • {website?.url}
            </p>
          </div>
          <Button 
            onClick={() => generateMaintenanceReport.mutate()}
            disabled={generateMaintenanceReport.isPending}
            data-testid="button-generate-new-report"
          >
            {generateMaintenanceReport.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Generate Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Total Reports</p>
                  <p className="text-2xl font-bold">{reports?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">This Month</p>
                  <p className="text-2xl font-bold">{reports?.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Generated</p>
                  <p className="text-2xl font-bold">{reports?.filter(r => r.status === 'generated' || r.status === 'sent').length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Last Report</p>
                  <p className="text-sm font-bold">
                    {reports && reports.length > 0 
                      ? format(new Date(reports[0].createdAt), 'MMM dd')
                      : 'None'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="generated">Generated</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab} className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No maintenance reports found</h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedTab === 'all' 
                        ? "Get started by generating your first maintenance report." 
                        : `No ${selectedTab} reports found.`
                      }
                    </p>
                    {selectedTab === 'all' && (
                      <Button 
                        onClick={() => generateMaintenanceReport.mutate()}
                        data-testid="button-generate-first-report"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Generate First Report
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Generated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Maintenance</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell>
                            {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            {report.generatedAt 
                              ? format(new Date(report.generatedAt), 'MMM dd, yyyy')
                              : 'N/A'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {report.status === 'draft' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => generateMaintenanceReport.mutate()}
                                  disabled={generateMaintenanceReport.isPending}
                                  data-testid={`button-generate-report-${report.id}`}
                                >
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Generate
                                </Button>
                              )}
                              {(report.status === 'generated' || report.status === 'sent') && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => viewMaintenanceReport.mutate(report.id)}
                                    disabled={viewMaintenanceReport.isPending}
                                    data-testid={`button-view-report-${report.id}`}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => downloadMaintenanceReport.mutate(report.id)}
                                    disabled={downloadMaintenanceReport.isPending}
                                    data-testid={`button-download-report-${report.id}`}
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Periodic Reports Setting Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Periodic Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Set up automatic maintenance report generation for this website.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure Schedule
              </Button>
              <span className="text-sm text-muted-foreground">
                Currently: Manual generation only
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}