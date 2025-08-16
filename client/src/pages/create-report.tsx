import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Badge } from '@/components/ui/badge';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, FileText, Settings, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Client, Website, ReportTemplate } from '@shared/schema';

const createReportSchema = z.object({
  reportName: z.string().min(1, "Report name is required"),
  clientId: z.string().min(1, "Client is required"),
  websiteId: z.string().min(1, "Website is required"),
  reportType: z.enum(["monthly", "weekly", "quarterly", "custom"]),
  templateId: z.string().optional(),
  language: z.string().default("en-US"),
  dateFormat: z.string().default("YYYY-MM-DD"),
  dateFrom: z.string().min(1, "Start date is required"),
  dateTo: z.string().min(1, "End date is required"),
  modules: z.array(z.string()).min(1, "At least one module must be selected"),
  includeActivityLog: z.boolean().default(true),
  notes: z.string().optional(),
  sendToEmails: z.string().optional(),
});

type CreateReportFormData = z.infer<typeof createReportSchema>;

const availableModules = [
  { id: "overview", name: "Overview", description: "Executive summary with key metrics and status", icon: "📊", enabled: true },
  { id: "updates", name: "Updates", description: "WordPress core, plugins, themes update history", icon: "🔄", enabled: true, displayAllDetails: false },
  { id: "backups", name: "Backups", description: "Backup status, schedule, and recovery points", icon: "💾", enabled: true },
  { id: "uptime", name: "Uptime", description: "Site availability monitoring and downtime analysis", icon: "⏱️", enabled: false },
  { id: "analytics", name: "Analytics", description: "Traffic overview, visitor insights, and trends", icon: "📈", enabled: false },
  { id: "security", name: "Security", description: "Malware scans, vulnerability assessment, security status", icon: "🔒", enabled: true, displayAllDetails: false },
  { id: "performance", name: "Performance", description: "Page speed, Core Web Vitals, optimization recommendations", icon: "⚡", enabled: true, displayAllDetails: false },
  { id: "seo", name: "SEO Ranking", description: "Keyword rankings, technical SEO analysis, SERP tracking", icon: "🎯", enabled: false },
  { id: "customwork", name: "Custom Work", description: "Development tasks, maintenance activities, custom modifications", icon: "🛠️", enabled: true },
  { id: "woocommerce", name: "WooCommerce", description: "E-commerce analytics, sales data, product performance", icon: "🛒", enabled: false },
];

export default function CreateReportPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Simple state for tracking selections
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>(["overview", "updates", "backups", "security", "performance", "customwork"]);

  const form = useForm<CreateReportFormData>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      reportName: "",
      clientId: "",
      websiteId: "",
      reportType: "monthly",
      templateId: "",
      language: "en-US",
      dateFormat: "YYYY-MM-DD",
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      dateTo: new Date().toISOString().split('T')[0], // Today
      modules: ["overview", "updates", "backups", "security", "performance", "customwork"], // Default enabled modules
      includeActivityLog: true,
      notes: "",
      sendToEmails: "",
    },
  });

  // Fetch data
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: websites = [] } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
  });

  const { data: templates = [] } = useQuery<ReportTemplate[]>({
    queryKey: ["/api/report-templates"],
  });

  // Filter websites based on selected client
  const filteredWebsites = selectedClientId 
    ? websites.filter((website: any) => website.clientId === parseInt(selectedClientId))
    : [];

  const createReportMutation = useMutation({
    mutationFn: async (data: CreateReportFormData) => {
      const reportData = {
        title: data.reportName,
        clientId: parseInt(data.clientId),
        websiteIds: [parseInt(data.websiteId)], // Array format to match existing schema
        templateId: data.templateId && data.templateId !== "" ? parseInt(data.templateId) : undefined,
        dateFrom: new Date(data.dateFrom).toISOString(),
        dateTo: new Date(data.dateTo).toISOString(),
        status: "draft",
        emailRecipients: data.sendToEmails ? data.sendToEmails.split(",").map(email => email.trim()) : [],
        isPubliclyShared: false,
        isScheduled: false,
        emailSent: false,
        reportData: {
          language: data.language,
          dateFormat: data.dateFormat,
          modules: data.modules,
          includeActivityLog: data.includeActivityLog,
          notes: data.notes,
          generatedSections: [],
          activityLog: [],
        },
      };

      return apiRequest("POST", "/api/client-reports", reportData);
    },
    onSuccess: () => {
      toast({
        title: "Report created",
        description: "Your client report has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/client-reports"] });
      setLocation("/client-reports");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClientChange = (value: string) => {
    setSelectedClientId(value);
    form.setValue("clientId", value);
    form.setValue("websiteId", ""); // Reset website when client changes
  };

  const handleModuleToggle = (moduleId: string) => {
    const newModules = selectedModules.includes(moduleId)
      ? selectedModules.filter(id => id !== moduleId)
      : [...selectedModules, moduleId];
    
    setSelectedModules(newModules);
    form.setValue("modules", newModules);
  };

  const onSubmit = (data: CreateReportFormData) => {
    createReportMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/client-reports")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Reports</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Client Report</h1>
            <p className="text-muted-foreground">
              Generate a comprehensive report for your client
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Report Details</span>
                  </CardTitle>
                  <CardDescription>
                    Configure the basic settings for your client report
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reportName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Monthly Security Report - January 2024" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value}
                              onChange={(e) => handleClientChange(e.target.value)}
                            >
                              <option value="">Select client</option>
                              {clients.map((client) => (
                                <option key={client.id} value={client.id.toString()}>
                                  {client.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="websiteId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            >
                              <option value="">Select website</option>
                              {filteredWebsites.map((website: any) => (
                                <option key={website.id} value={website.id.toString()}>
                                  {website.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="reportType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Type</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            >
                              <option value="weekly">Weekly Report</option>
                              <option value="monthly">Monthly Report</option>
                              <option value="quarterly">Quarterly Report</option>
                              <option value="custom">Custom Report</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="templateId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template (Optional)</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            >
                              <option value="">Use default template</option>
                              <option value="default">Default Template</option>
                              {templates.map((template) => (
                                <option key={template.id} value={template.id.toString()}>
                                  {template.templateName}
                                  {template.isDefault ? " (Default)" : ""}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Language</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            >
                              <option value="en-US">United States - English</option>
                              <option value="en-GB">United Kingdom - English</option>
                              <option value="es-ES">Spain - Spanish</option>
                              <option value="fr-FR">France - French</option>
                              <option value="de-DE">Germany - German</option>
                              <option value="it-IT">Italy - Italian</option>
                              <option value="pt-PT">Portugal - Portuguese</option>
                              <option value="ja-JP">Japan - Japanese</option>
                              <option value="zh-CN">China - Chinese</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Format</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            >
                              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                              <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                            </select>
                          </FormControl>
                          <FormDescription>
                            Preview: {new Date().toLocaleDateString()}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-date-from" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-date-to" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Report Modules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Choose Report Sections</span>
                  </CardTitle>
                  <CardDescription>
                    Select which sections to include in your report. Activity logs show what actions were performed during the selected period.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {availableModules.map((module) => (
                      <div
                        key={module.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedModules.includes(module.id)
                            ? "border-primary bg-primary/5"
                            : module.enabled 
                              ? "border-border hover:border-primary/50"
                              : "border-border bg-muted/30 opacity-60"
                        }`}
                        onClick={() => module.enabled && handleModuleToggle(module.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedModules.includes(module.id)}
                            onChange={() => {}} // Controlled by parent click
                            disabled={!module.enabled}
                            className="mt-1 h-4 w-4 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-lg">{module.icon}</span>
                              <h4 className="font-medium">{module.name}</h4>
                              {!module.enabled && (
                                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                              )}
                              {module.displayAllDetails !== undefined && selectedModules.includes(module.id) && (
                                <Badge variant="outline" className="text-xs">
                                  {module.displayAllDetails ? "All Details" : "Display All Details"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                            {module.displayAllDetails !== undefined && selectedModules.includes(module.id) && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                ⚙️ Configuration available for detail level
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Activity Log Toggle */}
                  <div className="border-t pt-4">
                    <FormField
                      control={form.control}
                      name="includeActivityLog"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">
                              Include Activity Log
                            </FormLabel>
                            <FormDescription>
                              Show what maintenance activities were performed during the report period
                            </FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              data-testid="checkbox-activity-log"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.formState.errors.modules && (
                    <p className="text-sm text-destructive mt-2">
                      {form.formState.errors.modules.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Additional Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sendToEmails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Send To (Email Addresses)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="client@example.com, manager@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Comma-separated list of email addresses to send the report to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any special notes or instructions for this report..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createReportMutation.isPending}
                  >
                    {createReportMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Report
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation("/client-reports")}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Report Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Client:</span>{" "}
                      {selectedClientId ? clients.find(c => c.id.toString() === selectedClientId)?.name : "Not selected"}
                    </div>
                    <div>
                      <span className="font-medium">Modules:</span>{" "}
                      {selectedModules.length > 0 ? `${selectedModules.length} selected` : "None selected"}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      Monthly
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}