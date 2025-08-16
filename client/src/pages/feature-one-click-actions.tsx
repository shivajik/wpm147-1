import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MousePointer, Zap, CheckCircle2, Clock, Play, Settings } from "lucide-react";
import { Link } from "wouter";

export default function OneClickActions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">← Back to Dashboard</Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <MousePointer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">One-Click Actions</h1>
                  <p className="text-slate-600">Streamlined workflows for instant maintenance</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Quick Actions
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-card bg-gradient-to-br from-white to-yellow-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Actions Today</p>
                  <p className="text-3xl font-bold text-slate-900">67</p>
                  <p className="text-xs text-yellow-600 flex items-center mt-1">
                    <MousePointer className="h-3 w-3 mr-1" />
                    One-click executions
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <MousePointer className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-to-br from-white to-green-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-slate-900">99.8%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Action success rate
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-to-br from-white to-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Avg. Execution</p>
                  <p className="text-3xl font-bold text-slate-900">2.3s</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Lightning fast
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-to-br from-white to-purple-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Time Saved</p>
                  <p className="text-3xl font-bold text-slate-900">23.4h</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    This month
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-card bg-gradient-to-br from-white via-white to-slate-50/50">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <MousePointer className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Quick Action Center</CardTitle>
                      <CardDescription>Instant maintenance actions and workflow automation</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Ready
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Quick Actions Grid */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-4">Popular Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:bg-blue-100"
                      >
                        <Zap className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Update All Plugins</span>
                        <span className="text-xs text-blue-600">23 sites ready</span>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:bg-green-100"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Security Scan</span>
                        <span className="text-xs text-green-600">All sites</span>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:bg-purple-100"
                      >
                        <Settings className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Optimize DB</span>
                        <span className="text-xs text-purple-600">12 sites pending</span>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 hover:bg-orange-100"
                      >
                        <Play className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">Create Backup</span>
                        <span className="text-xs text-orange-600">Instant backup</span>
                      </Button>
                    </div>
                  </div>

                  {/* Workflow Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-slate-700">Active Workflows</span>
                      <span className="text-sm text-slate-600">3 running</span>
                    </div>
                    <Progress value={65} className="h-3 bg-slate-100">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full transition-all duration-300" style={{ width: '65%' }} />
                    </Progress>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-slate-700">Actions Queue</span>
                      <span className="text-sm text-slate-600">8 pending</span>
                    </div>
                    <Progress value={25} className="h-3 bg-slate-100">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300" style={{ width: '25%' }} />
                    </Progress>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Quick Actions */}
          <div>
            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-slate-50/50">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg">Recent Actions</CardTitle>
                <CardDescription>Latest one-click executions</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">Plugin updates completed</p>
                      <p className="text-xs text-slate-600">15 plugins across 8 sites</p>
                      <p className="text-xs text-slate-500">5 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">Security scan executed</p>
                      <p className="text-xs text-slate-600">All sites - clean results</p>
                      <p className="text-xs text-slate-500">15 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Settings className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">Database optimization</p>
                      <p className="text-xs text-slate-600">4 sites optimized</p>
                      <p className="text-xs text-slate-500">30 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MousePointer className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Instant Execution</CardTitle>
              <CardDescription>
                Execute complex maintenance tasks with a single click, from plugin updates to security scans.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Bulk Operations</CardTitle>
              <CardDescription>
                Perform actions across multiple sites simultaneously with intelligent conflict resolution.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Play className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Custom Workflows</CardTitle>
              <CardDescription>
                Create custom one-click workflows that combine multiple actions with conditional logic.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}