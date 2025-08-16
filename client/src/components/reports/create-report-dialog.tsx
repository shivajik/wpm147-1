import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Search, 
  Zap, 
  RefreshCw, 
  Upload,
  Calendar,
  FileText
} from 'lucide-react';
import { apiCall } from '@/lib/queryClient';
import type { Client, Website } from '@shared/schema';

const reportSchema = z.object({
  reportName: z.string().min(1, 'Report name is required'),
  clientId: z.number().min(1, 'Client is required'),
  websiteId: z.number().min(1, 'Website is required'),
  reportType: z.enum(['weekly', 'monthly', 'quarterly']),
  reportPeriod: z.string().min(1, 'Report period is required'),
  includeModules: z.array(z.string()).min(1, 'At least one module must be selected'),
  customLogo: z.string().optional(),
  introText: z.string().optional(),
  outroText: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportCreated: () => void;
}

const moduleOptions = [
  {
    id: 'security',
    label: 'Security',
    description: 'Malware scans, vulnerability checks, security scores',
    icon: Shield,
    color: 'text-red-500',
  },
  {
    id: 'seo',
    label: 'SEO',
    description: 'Rankings, technical SEO, content analysis',
    icon: Search,
    color: 'text-blue-500',
  },
  {
    id: 'performance',
    label: 'Performance',
    description: 'Page speed, Core Web Vitals, optimization tips',
    icon: Zap,
    color: 'text-yellow-500',
  },
  {
    id: 'updates',
    label: 'Updates',
    description: 'WordPress core, plugins, themes updates',
    icon: RefreshCw,
    color: 'text-green-500',
  },
];

export default function CreateReportDialog({ 
  open, 
  onOpenChange, 
  onReportCreated 
}: CreateReportDialogProps) {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: 'monthly',
      includeModules: ['security', 'seo', 'performance', 'updates'],
      reportPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM format
    },
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: websites } = useQuery<Website[]>({
    queryKey: ['/api/websites'],
    enabled: selectedClient !== null,
  });

  const createReport = useMutation({
    mutationFn: async (data: ReportFormData) => {
      return apiCall('/api/reports', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      onReportCreated();
      onOpenChange(false);
      form.reset();
    },
  });

  const onSubmit = (data: ReportFormData) => {
    createReport.mutate(data);
  };

  const watchedClientId = form.watch('clientId');

  // Filter websites by selected client
  const filteredWebsites = websites?.filter(
    website => website.clientId === watchedClientId
  ) || [];

  // Generate report period options based on type
  const getReportPeriodOptions = (type: string) => {
    const now = new Date();
    const options = [];

    if (type === 'weekly') {
      for (let i = 0; i < 8; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        options.push({
          value: `${weekStart.toISOString().slice(0, 10)}_${weekEnd.toISOString().slice(0, 10)}`,
          label: `Week of ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
        });
      }
    } else if (type === 'monthly') {
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        options.push({
          value: date.toISOString().slice(0, 7),
          label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        });
      }
    } else if (type === 'quarterly') {
      for (let i = 0; i < 4; i++) {
        const quarter = Math.floor(now.getMonth() / 3) + 1 - i;
        const year = quarter <= 0 ? now.getFullYear() - 1 : now.getFullYear();
        const adjQuarter = quarter <= 0 ? quarter + 4 : quarter;
        options.push({
          value: `${year}-Q${adjQuarter}`,
          label: `Q${adjQuarter} ${year}`,
        });
      }
    }

    return options;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Client Report
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reportName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Monthly Security Report" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Client and Website Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        setSelectedClient(parseInt(value));
                        form.setValue('websiteId', 0); // Reset website selection
                      }} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                      disabled={!watchedClientId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select website" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredWebsites.map((website) => (
                          <SelectItem key={website.id} value={website.id.toString()}>
                            {website.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Report Period */}
            <FormField
              control={form.control}
              name="reportPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Period</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getReportPeriodOptions(form.watch('reportType')).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Module Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="includeModules"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {moduleOptions.map((module) => (
                          <FormField
                            key={module.id}
                            control={form.control}
                            name="includeModules"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={module.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(module.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, module.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== module.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <div className="flex items-center gap-2">
                                      <module.icon className={`h-4 w-4 ${module.color}`} />
                                      <FormLabel className="font-medium">
                                        {module.label}
                                      </FormLabel>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {module.description}
                                    </p>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Customization */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="customLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Logo URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="introText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Introduction Text (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add a custom introduction to your report..."
                        className="resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outroText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conclusion Text (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add a custom conclusion to your report..."
                        className="resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createReport.isPending}>
                {createReport.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Report'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}