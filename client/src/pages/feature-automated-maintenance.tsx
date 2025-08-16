import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bot, Calendar, CheckCircle2, Clock, RefreshCw, Settings } from "lucide-react";
import { Link } from "wouter";
import FeatureLayout from "@/components/layout/feature-layout";

export default function AutomatedMaintenance() {
  return (
    <FeatureLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        {/* Feature Header */}
        <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Automated Maintenance</h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
                Smart automation that keeps your WordPress sites running smoothly without manual intervention
              </p>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                Enable Automation
              </Button>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-purple-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Auto Updates</p>
                    <p className="text-2xl font-bold text-slate-900">156</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">23 this week</span>
                    <span className="text-slate-500">successful</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Scheduled Tasks</p>
                    <p className="text-2xl font-bold text-slate-900">42</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={85} className="h-2" />
                  <p className="text-sm text-slate-500 mt-2">85% completion rate</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-green-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Time Saved</p>
                    <p className="text-2xl font-bold text-slate-900">24h</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 font-medium">This month</span>
                    <span className="text-slate-500">vs manual work</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-orange-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Active Workflows</p>
                    <p className="text-2xl font-bold text-slate-900">8</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Settings className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-orange-600 font-medium">All running</span>
                    <span className="text-slate-500">smoothly</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Smart Updates</CardTitle>
                <CardDescription>
                  Intelligent update management with staging tests and automatic rollback if issues are detected.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Scheduled Maintenance</CardTitle>
                <CardDescription>
                  Automated maintenance schedules with database optimization, cache clearing, and backup creation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Health Monitoring</CardTitle>
                <CardDescription>
                  Continuous health monitoring with automatic issue detection and resolution for optimal performance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Task Scheduling</CardTitle>
                <CardDescription>
                  Flexible task scheduling with custom intervals, priority settings, and dependency management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Rollback Protection</CardTitle>
                <CardDescription>
                  Automatic backup creation before updates with intelligent rollback if issues are detected post-update.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Custom Workflows</CardTitle>
                <CardDescription>
                  Build custom automation workflows with conditional logic, dependencies, and multi-step processes.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </FeatureLayout>
  );
}