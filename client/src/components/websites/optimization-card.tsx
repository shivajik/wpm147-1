import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  RefreshCcw, 
  Database, 
  FileText, 
  Clock,
  HardDrive,
  Trash2,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface OptimizationCardProps {
  websiteId: number;
}

interface OptimizationData {
  postRevisions: {
    count: number;
    size: string;
    lastCleanup?: string;
  };
  databasePerformance: {
    size: string;
    optimizationNeeded: boolean;
    lastOptimization?: string;
    tables: number;
  };
  trashedContent: {
    posts: number;
    comments: number;
    size: string;
  };
  spam: {
    comments: number;
    size: string;
  };
}

export default function OptimizationCard({ websiteId }: OptimizationCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [optimizingType, setOptimizingType] = useState<'revisions' | 'database' | 'all' | null>(null);

  // Fetch optimization data
  const { data: optimizationData, isLoading } = useQuery<OptimizationData | null>({
    queryKey: [`/api/websites/${websiteId}/optimization-data`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Optimize post revisions mutation
  const optimizeRevisionsMutation = useMutation({
    mutationFn: () => apiRequest(`/api/websites/${websiteId}/optimization/revisions`, 'POST'),
    onMutate: () => {
      setOptimizingType('revisions');
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Post Revisions Optimized',
        description: `Cleaned up ${data.removedCount || 0} revisions, freed ${data.sizeFreed || '0 MB'} of space.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/optimization-data`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Optimization Failed',
        description: error.message || 'Failed to optimize post revisions.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setOptimizingType(null);
    },
  });

  // Optimize database mutation
  const optimizeDatabaseMutation = useMutation({
    mutationFn: () => apiRequest(`/api/websites/${websiteId}/optimization/database`, 'POST'),
    onMutate: () => {
      setOptimizingType('database');
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Database Optimized',
        description: `Optimized ${data.tablesOptimized || 0} tables, freed ${data.sizeFreed || '0 MB'} of space.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/optimization-data`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Optimization Failed',
        description: error.message || 'Failed to optimize database.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setOptimizingType(null);
    },
  });

  // Optimize all mutation
  const optimizeAllMutation = useMutation({
    mutationFn: () => apiRequest(`/api/websites/${websiteId}/optimization/all`, 'POST'),
    onMutate: () => {
      setOptimizingType('all');
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Complete Optimization Finished',
        description: `Cleaned up ${data.totalItemsRemoved || 0} items, freed ${data.totalSizeFreed || '0 MB'} of space.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/optimization-data`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Optimization Failed',
        description: error.message || 'Failed to perform complete optimization.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setOptimizingType(null);
    },
  });

  const handleOptimizeRevisions = () => {
    optimizeRevisionsMutation.mutate();
  };

  const handleOptimizeDatabase = () => {
    optimizeDatabaseMutation.mutate();
  };

  const handleOptimizeAll = () => {
    optimizeAllMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If optimization data is null (endpoint not available), show unavailable message
  if (optimizationData === null) {
    return (
      <Card data-testid="optimization-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Settings className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Optimization Features Unavailable
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Optimization features require an updated WordPress Remote Manager plugin
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="optimization-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Post Revisions */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700" data-testid="post-revisions-section">
          <div className="flex items-center gap-3">
            <span className="text-gray-900 dark:text-gray-100 font-medium">Post Revisions</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-orange-500 dark:text-orange-400 font-medium">
              {optimizationData?.postRevisions ? `${optimizationData.postRevisions.count} revisions` : 'No data'}
            </span>
            <Button
              size="sm"
              onClick={handleOptimizeRevisions}
              disabled={optimizingType !== null || !optimizationData}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-1.5 h-auto"
              data-testid="optimize-revisions-button"
            >
              {optimizingType === 'revisions' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Optimize'
              )}
            </Button>
          </div>
        </div>

        {/* Database Performance */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700" data-testid="database-performance-section">
          <div className="flex items-center gap-3">
            <span className="text-gray-900 dark:text-gray-100 font-medium">Database Performance</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-orange-500 dark:text-orange-400 font-medium">
              {optimizationData?.databasePerformance ? optimizationData.databasePerformance.size : 'No data'}
            </span>
            <Button
              size="sm"
              onClick={handleOptimizeDatabase}
              disabled={optimizingType !== null || !optimizationData}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-1.5 h-auto"
              data-testid="optimize-database-button"
            >
              {optimizingType === 'database' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Optimize'
              )}
            </Button>
          </div>
        </div>

        {/* Optimize All Button */}
        <div className="pt-4">
          <Button
            onClick={handleOptimizeAll}
            disabled={optimizingType !== null || !optimizationData}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            data-testid="optimize-all-button"
          >
            {optimizingType === 'all' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              'Optimize All'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}