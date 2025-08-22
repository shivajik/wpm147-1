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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { format, subDays } from "date-fns";
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
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
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
    mutationFn: async (params?: { dateFrom?: string; dateTo?: string }) => {
      try {
        const response = await apiCall(`/api/websites/${websiteId}/maintenance-report`, {
          method: 'POST',
          body: JSON.stringify(params || {}),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response;
      } catch (error) {
        console.error('Error generating maintenance report:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Maintenance Report Generated",
        description: "Your maintenance report has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'maintenance-reports'] });
      setIsGenerateDialogOpen(false);
      // Reset form
      setSelectedPeriod('30');
      setCustomDateFrom('');
      setCustomDateTo('');
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
    return localStorage.getItem('auth_token');
  };

  // Helper function to validate token and handle authentication errors
  const validateAuthAndOpenPDF = async (reportId: number, action: 'download' | 'view') => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    // First, validate the token by making a test API call to the report endpoint
    try {
      const response = await apiCall(`/api/websites/${websiteId}/maintenance-reports/${reportId}`);
      if (!response) {
        throw new Error('Report not found or access denied.');
      }
    } catch (error: any) {
      // If we get a 401 or authentication error, don't try to open the PDF
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        throw new Error('Your session has expired. Please log in again.');
      }
      // For other errors, still try to open the PDF as it might be a different issue
      console.warn('Report validation failed, but attempting PDF generation:', error);
    }

    // If validation passes or fails non-auth related, try to open the PDF
    const url = `/api/websites/${websiteId}/maintenance-reports/${reportId}/pdf?token=${encodeURIComponent(token)}`;
    const newWindow = window.open(url, '_blank');
    
    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      throw new Error('Popup blocked. Please allow popups for this site and try again.');
    }

    return { success: true };
  };

  // Download maintenance report mutation
  const downloadMaintenanceReport = useMutation({
    mutationFn: async (reportId: number) => {
      return validateAuthAndOpenPDF(reportId, 'download');
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
      return validateAuthAndOpenPDF(reportId, 'view');
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
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-generate-new-report">
                <Plus className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Generate Maintenance Report</DialogTitle>
                <DialogDescription>
                  Select the time period for your maintenance report. This will include all maintenance activities, updates, and scans within the selected period.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="period" className="text-right">
                    Period
                  </Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="15">Last 15 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="custom">Custom date range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedPeriod === 'custom' && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dateFrom" className="text-right">
                        From
                      </Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={customDateFrom}
                        onChange={(e) => setCustomDateFrom(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dateTo" className="text-right">
                        To
                      </Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={customDateTo}
                        onChange={(e) => setCustomDateTo(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGenerateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    let dateFrom: string;
                    let dateTo: string = new Date().toISOString();
                    
                    if (selectedPeriod === 'custom') {
                      if (!customDateFrom || !customDateTo) {
                        toast({
                          title: "Invalid Date Range",
                          description: "Please select both start and end dates.",
                          variant: "destructive",
                        });
                        return;
                      }
                      dateFrom = new Date(customDateFrom).toISOString();
                      dateTo = new Date(customDateTo).toISOString();
                    } else {
                      const days = parseInt(selectedPeriod);
                      dateFrom = subDays(new Date(), days).toISOString();
                    }
                    
                    generateMaintenanceReport.mutate({ dateFrom, dateTo });
                  }}
                  disabled={generateMaintenanceReport.isPending}
                >
                  {generateMaintenanceReport.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Generate Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button data-testid="button-generate-first-report">
                            <Plus className="w-4 h-4 mr-2" />
                            Generate First Report
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Generate Maintenance Report</DialogTitle>
                            <DialogDescription>
                              Select the time period for your maintenance report. This will include all maintenance activities, updates, and scans within the selected period.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="period" className="text-right">
                                Period
                              </Label>
                              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="7">Last 7 days</SelectItem>
                                  <SelectItem value="15">Last 15 days</SelectItem>
                                  <SelectItem value="30">Last 30 days</SelectItem>
                                  <SelectItem value="custom">Custom date range</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {selectedPeriod === 'custom' && (
                              <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="dateFrom" className="text-right">
                                    From
                                  </Label>
                                  <Input
                                    id="dateFrom"
                                    type="date"
                                    value={customDateFrom}
                                    onChange={(e) => setCustomDateFrom(e.target.value)}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="dateTo" className="text-right">
                                    To
                                  </Label>
                                  <Input
                                    id="dateTo"
                                    type="date"
                                    value={customDateTo}
                                    onChange={(e) => setCustomDateTo(e.target.value)}
                                    className="col-span-3"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsGenerateDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                let dateFrom: string;
                                let dateTo: string = new Date().toISOString();
                                
                                if (selectedPeriod === 'custom') {
                                  if (!customDateFrom || !customDateTo) {
                                    toast({
                                      title: "Invalid Date Range",
                                      description: "Please select both start and end dates.",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  dateFrom = new Date(customDateFrom).toISOString();
                                  dateTo = new Date(customDateTo).toISOString();
                                } else {
                                  const days = parseInt(selectedPeriod);
                                  dateFrom = subDays(new Date(), days).toISOString();
                                }
                                
                                generateMaintenanceReport.mutate({ dateFrom, dateTo });
                              }}
                              disabled={generateMaintenanceReport.isPending}
                            >
                              {generateMaintenanceReport.isPending ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <FileText className="w-4 h-4 mr-2" />
                              )}
                              Generate Report
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
                                  onClick={() => {
                                    // For regenerating existing reports, use default 30-day period
                                    const dateTo = new Date().toISOString();
                                    const dateFrom = subDays(new Date(), 30).toISOString();
                                    generateMaintenanceReport.mutate({ dateFrom, dateTo });
                                  }}
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