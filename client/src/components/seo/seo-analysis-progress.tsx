import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  BarChart3,
  Target,
  AlertTriangle
} from "lucide-react";

interface ProgressData {
  progress: number;
  step: string;
  estimatedTime?: number;
  completed?: boolean;
  report?: any;
  error?: boolean;
  message?: string;
  timestamp: string;
}

interface SeoAnalysisProgressProps {
  isOpen: boolean;
  onClose: () => void;
  websiteId: string;
  websiteName: string;
  onComplete?: (report: any) => void;
}

export function SeoAnalysisProgress({ 
  isOpen, 
  onClose, 
  websiteId, 
  websiteName,
  onComplete 
}: SeoAnalysisProgressProps) {
  const [progressData, setProgressData] = useState<ProgressData>({
    progress: 0,
    step: "Preparing analysis...",
    timestamp: new Date().toISOString()
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setProgressData({
      progress: 0,
      step: "Initializing analysis...",
      timestamp: new Date().toISOString()
    });

    try {
      // Simulate the progress steps while making the actual API call
      const analysisSteps = [
        { step: "Initializing analysis...", duration: 800 },
        { step: "Fetching website content...", duration: 1200 },
        { step: "Analyzing page structure...", duration: 1000 },
        { step: "Checking technical SEO...", duration: 1500 },
        { step: "Evaluating content quality...", duration: 1200 },
        { step: "Analyzing meta tags...", duration: 800 },
        { step: "Checking site speed...", duration: 1800 },
        { step: "Analyzing mobile friendliness...", duration: 1000 },
        { step: "Checking security protocols...", duration: 600 },
        { step: "Evaluating backlink profile...", duration: 1400 },
        { step: "Analyzing social signals...", duration: 900 },
        { step: "Generating recommendations...", duration: 1200 },
        { step: "Finalizing report...", duration: 800 }
      ];

      const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0);
      let elapsedTime = 0;

      // Start the API call in parallel with progress simulation
      const { apiCall } = await import('@/lib/queryClient');
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      // Make API call with proper authentication
      const apiPromise = fetch(`/api/websites/${websiteId}/seo-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }).then(async (response) => {
        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          throw new Error('Unauthorized');
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `HTTP ${response.status}`);
        }
        
        return response.json();
      });

      // Simulate progress steps
      for (let i = 0; i < analysisSteps.length; i++) {
        if (!isAnalyzing) break; // Stop if analysis was cancelled

        const { step, duration } = analysisSteps[i];
        const stepProgress = ((i + 1) / analysisSteps.length) * 100;
        const remainingTime = Math.ceil((totalDuration - elapsedTime) / 1000);

        setProgressData({
          progress: Math.round(stepProgress),
          step,
          estimatedTime: remainingTime,
          timestamp: new Date().toISOString()
        });

        await new Promise(resolve => setTimeout(resolve, duration));
        elapsedTime += duration;
      }

      // Wait for API response
      const result = await apiPromise;
      
      if (!result || !result.success) {
        const errorMessage = result?.message || "Analysis failed - API endpoint not found or server error";
        console.error('API call failed:', errorMessage, result);
        throw new Error(errorMessage);
      }

      setProgressData({
        progress: 100,
        step: "Analysis complete!",
        completed: true,
        report: result.report,
        timestamp: new Date().toISOString()
      });

      setIsAnalyzing(false);
      
      // Invalidate cache to refresh report history
      const { queryClient } = await import('@/lib/queryClient');
      queryClient.invalidateQueries({ queryKey: ['/api/websites', websiteId, 'seo-reports'] });
      
      onComplete?.(result.report);

    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      
      let errorMessage = "Analysis failed unexpectedly";
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = "Network error: Unable to connect to analysis service";
        } else if (error.message.includes('404') || error.message.includes('not found')) {
          errorMessage = "API endpoint not found - This may be a deployment issue";
        } else if (error.message.includes('500')) {
          errorMessage = "Server error during analysis";
        } else {
          errorMessage = error.message;
        }
      }
      
      setProgressData(prev => ({
        ...prev,
        error: true,
        message: errorMessage
      }));
    }
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen && !isAnalyzing && !progressData.completed) {
      // Auto-start analysis when modal opens
      setTimeout(startAnalysis, 500);
    }

    return () => {
      // Cleanup if needed
    };
  }, [isOpen]);

  const getStatusIcon = () => {
    if (progressData.error) {
      return <XCircle className="h-8 w-8 text-red-500" />;
    }
    if (progressData.completed) {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
    return <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={stopAnalysis}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            SEO Analysis Progress
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Website Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{websiteName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive SEO Analysis
                  </p>
                </div>
                <div className="text-right">
                  {getStatusIcon()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {progressData.error ? "Analysis Failed" : 
                 progressData.completed ? "Analysis Complete" : 
                 "Analysis in Progress"}
              </span>
              <Badge variant={
                progressData.error ? "destructive" :
                progressData.completed ? "default" : "secondary"
              }>
                {Math.round(progressData.progress)}%
              </Badge>
            </div>

            <Progress 
              value={progressData.progress} 
              className="h-3"
            />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {progressData.step}
              </span>
              {progressData.estimatedTime && !progressData.completed && (
                <span>
                  ~{formatTime(progressData.estimatedTime)} remaining
                </span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {progressData.error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-red-700">
                    {progressData.message || "Analysis failed due to an unexpected error"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Summary */}
          {progressData.completed && progressData.report && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-700 font-medium">
                      Analysis completed successfully!
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-lg text-green-700">
                          {progressData.report.overallScore}
                        </span>
                      </div>
                      <p className="text-green-600">Overall Score</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="font-bold text-lg text-red-600">
                          {progressData.report.issues?.critical || 0}
                        </span>
                      </div>
                      <p className="text-red-600">Critical Issues</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                        <span className="font-bold text-lg text-blue-600">
                          {progressData.report.recommendations?.length || 0}
                        </span>
                      </div>
                      <p className="text-blue-600">Recommendations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {progressData.completed ? (
              <Button onClick={stopAnalysis} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                View Full Report
              </Button>
            ) : progressData.error ? (
              <>
                <Button variant="outline" onClick={stopAnalysis}>
                  Close
                </Button>
                <Button onClick={startAnalysis}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Analysis
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={stopAnalysis}>
                Cancel Analysis
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}