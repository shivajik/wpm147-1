import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Eye, Users, PieChart, Activity } from "lucide-react";
import { Link } from "wouter";
import FeatureLayout from "@/components/layout/feature-layout";

export default function AdvancedAnalytics() {
  return (
    <FeatureLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
        {/* Feature Header */}
        <section className="bg-gradient-to-r from-cyan-600 to-teal-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Advanced Analytics</h1>
              <p className="text-xl text-cyan-100 max-w-2xl mx-auto mb-8">
                Comprehensive reporting and business intelligence for data-driven decisions
              </p>
              <Button size="lg" className="bg-white text-cyan-600 hover:bg-cyan-50">
                View Analytics
              </Button>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-cyan-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Views</p>
                    <p className="text-2xl font-bold text-slate-900">1.2M</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Eye className="h-6 w-6 text-cyan-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">+12.5%</span>
                    <span className="text-slate-500">vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-teal-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Active Users</p>
                    <p className="text-2xl font-bold text-slate-900">45.2K</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={68} className="h-2" />
                  <p className="text-sm text-slate-500 mt-2">68% growth target</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Conversion Rate</p>
                    <p className="text-2xl font-bold text-slate-900">3.8%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-600 font-medium">Above average</span>
                    <span className="text-slate-500">industry 2.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-purple-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">$24.7K</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-purple-600 font-medium">+8.2%</span>
                    <span className="text-slate-500">this week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Real-time Dashboards</CardTitle>
                <CardDescription>
                  Live analytics dashboards with customizable widgets and real-time data visualization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Performance Tracking</CardTitle>
                <CardDescription>
                  Comprehensive performance metrics with trend analysis and predictive insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">User Behavior</CardTitle>
                <CardDescription>
                  Deep user behavior analysis with journey mapping and conversion funnel tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PieChart className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Custom Reports</CardTitle>
                <CardDescription>
                  Build custom reports with drag-and-drop interface and automated scheduling.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Data Integration</CardTitle>
                <CardDescription>
                  Seamless integration with popular analytics tools and third-party data sources.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Predictive Analytics</CardTitle>
                <CardDescription>
                  AI-powered insights that predict trends, identify opportunities, and recommend optimization strategies.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </FeatureLayout>
  );
}