import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface SecurityStats {
  totalScans: number;
  cleanSites: number;
  threatsDetected: number;
  criticalIssues: number;
}

export function SecurityDashboard() {
  const { data: securityStats, isLoading, error } = useQuery({
    queryKey: ['/api/security-stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load security statistics. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const stats: SecurityStats = (securityStats as SecurityStats) ?? {
    totalScans: 0,
    cleanSites: 0,
    threatsDetected: 0,
    criticalIssues: 0
  };

  const cleanSitePercentage = stats.totalScans > 0 ? (stats.cleanSites / stats.totalScans) * 100 : 0;
  const threatDensity = stats.totalScans > 0 ? stats.threatsDetected / stats.totalScans : 0;

  return (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScans}</div>
            <p className="text-xs text-muted-foreground">
              Security scans performed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clean Sites</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.cleanSites}</div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={cleanSitePercentage} className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {cleanSitePercentage.toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.threatsDetected}</div>
            <p className="text-xs text-muted-foreground">
              Average: {threatDensity.toFixed(1)} per scan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <ShieldX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status Summary
          </CardTitle>
          <CardDescription>
            Overall security health of your websites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.totalScans === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Security Scans Yet</h3>
              <p className="text-muted-foreground">
                Run your first security scan to see security insights here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Security Level Indicator */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall Security Level</span>
                <div className="flex items-center gap-2">
                  {stats.criticalIssues > 0 ? (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      <ShieldX className="h-3 w-3 mr-1" />
                      Critical
                    </Badge>
                  ) : stats.threatsDetected > stats.totalScans * 0.5 ? (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                      <ShieldAlert className="h-3 w-3 mr-1" />
                      High Risk
                    </Badge>
                  ) : stats.threatsDetected > 0 ? (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Medium Risk
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Low Risk
                    </Badge>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sites with Clean Status</span>
                    <span className="font-medium">{cleanSitePercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={cleanSitePercentage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Critical Issues Rate</span>
                    <span className="font-medium">
                      {stats.totalScans > 0 ? ((stats.criticalIssues / stats.totalScans) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalScans > 0 ? (stats.criticalIssues / stats.totalScans) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Security Recommendations</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {stats.criticalIssues > 0 && (
                    <li>• Address {stats.criticalIssues} critical security issues immediately</li>
                  )}
                  {cleanSitePercentage < 80 && (
                    <li>• Improve security posture - only {cleanSitePercentage.toFixed(0)}% of sites are clean</li>
                  )}
                  {stats.totalScans < 5 && (
                    <li>• Run more frequent security scans to monitor website health</li>
                  )}
                  {stats.threatsDetected === 0 && stats.totalScans > 0 && (
                    <li>• Great job! No threats detected across your websites</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SecurityDashboard;