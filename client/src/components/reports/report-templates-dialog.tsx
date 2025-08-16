import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, 
  Search, 
  Zap, 
  RefreshCw, 
  Plus,
  Trash2,
  Edit,
  Star,
  Palette
} from 'lucide-react';
import { apiCall } from '@/lib/queryClient';
import type { ReportTemplate } from '@shared/schema';
import { format } from 'date-fns';

const templateSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  includeModules: z.array(z.string()).min(1, 'At least one module must be selected'),
  customLogo: z.string().optional(),
  introText: z.string().optional(),
  outroText: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface ReportTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export default function ReportTemplatesDialog({ 
  open, 
  onOpenChange
}: ReportTemplatesDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      includeModules: ['security', 'seo', 'performance', 'updates'],
      isDefault: false,
    },
  });

  const { data: templates, isLoading } = useQuery<ReportTemplate[]>({
    queryKey: ['/api/report-templates'],
  });

  const createTemplate = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      return apiCall('/api/report-templates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
      setIsCreating(false);
      form.reset();
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TemplateFormData }) => {
      return apiCall(`/api/report-templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
      setEditingTemplate(null);
      form.reset();
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: number) => {
      return apiCall(`/api/report-templates/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
    },
  });

  const setDefaultTemplate = useMutation({
    mutationFn: async (id: number) => {
      return apiCall(`/api/report-templates/${id}/set-default`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
    },
  });

  const onSubmit = (data: TemplateFormData) => {
    if (editingTemplate) {
      updateTemplate.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplate.mutate(data);
    }
  };

  const handleEdit = (template: ReportTemplate) => {
    setEditingTemplate(template);
    setIsCreating(true);
    form.reset({
      templateName: template.templateName,
      includeModules: template.includeModules as string[],
      customLogo: template.customLogo || '',
      introText: template.introText || '',
      outroText: template.outroText || '',
      isDefault: template.isDefault || false,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    form.reset();
  };

  const getModuleIcon = (moduleId: string) => {
    const module = moduleOptions.find(m => m.id === moduleId);
    if (!module) return null;
    return <module.icon className={`h-3 w-3 ${module.color}`} />;
  };

  const getModuleLabel = (moduleId: string) => {
    const module = moduleOptions.find(m => m.id === moduleId);
    return module?.label || moduleId;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Report Templates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Template Button or Form */}
          {!isCreating ? (
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Create and manage reusable report templates to streamline your workflow.
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="templateName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Monthly Security Template" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isDefault"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Set as default template</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Module Selection */}
                    <FormField
                      control={form.control}
                      name="includeModules"
                      render={() => (
                        <FormItem>
                          <FormLabel>Included Modules</FormLabel>
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
                              placeholder="Default introduction text for reports..."
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
                              placeholder="Default conclusion text for reports..."
                              className="resize-none"
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createTemplate.isPending || updateTemplate.isPending}
                      >
                        {(createTemplate.isPending || updateTemplate.isPending) ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {editingTemplate ? 'Updating...' : 'Creating...'}
                          </div>
                        ) : (
                          editingTemplate ? 'Update Template' : 'Create Template'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Templates List */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !templates || templates.length === 0 ? (
                <div className="text-center py-8">
                  <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first template to get started.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Modules</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {template.isDefault && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                            {template.templateName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(template.includeModules as string[]).map((moduleId) => (
                              <Badge key={moduleId} variant="secondary" className="text-xs">
                                <div className="flex items-center gap-1">
                                  {getModuleIcon(moduleId)}
                                  {getModuleLabel(moduleId)}
                                </div>
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(template.createdAt!), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {template.isDefault ? (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Default
                            </Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!template.isDefault && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDefaultTemplate.mutate(template.id)}
                                disabled={setDefaultTemplate.isPending}
                              >
                                <Star className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteTemplate.mutate(template.id)}
                              disabled={deleteTemplate.isPending}
                            >
                              <Trash2 className="w-3 h-3" />
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}