import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gauge, TrendingUp, Clock, CheckCircle2, Zap, Globe, Activity, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import FeatureLayout from "@/components/layout/feature-layout";

export default function PerformanceMonitoring() {
  return (
    <FeatureLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
        {/* Feature Header */}
        <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Gauge className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Performance Monitoring</h1>
              <p className="text-xl text-green-100 max-w-2xl mx-auto mb-8">
                Real-time performance tracking with detailed insights and optimization recommendations
              </p>
              <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                Start Monitoring
              </Button>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-green-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Avg Load Time</p>
                    <p className="text-2xl font-bold text-slate-900">1.2s</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Gauge className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">15% faster</span>
                    <span className="text-slate-500">this week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Uptime</p>
                    <p className="text-2xl font-bold text-slate-900">99.9%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={99.9} className="h-2" />
                  <p className="text-sm text-slate-500 mt-2">Last 30 days</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-orange-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Page Score</p>
                    <p className="text-2xl font-bold text-slate-900">94/100</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Activity className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-orange-600 font-medium">Excellent</span>
                    <span className="text-slate-500">Google PageSpeed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-purple-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Issues Found</p>
                    <p className="text-2xl font-bold text-slate-900">3</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-purple-600 font-medium">2 critical</span>
                    <span className="text-slate-500">need attention</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Gauge className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Real-time Monitoring</CardTitle>
                <CardDescription>
                  Continuous monitoring of website performance with instant alerts for slowdowns and outages.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Core Web Vitals</CardTitle>
                <CardDescription>
                  Track Google's Core Web Vitals including LCP, FID, and CLS for optimal search rankings.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Performance Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics with historical data, trends, and performance comparisons across time periods.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Optimization Suggestions</CardTitle>
                <CardDescription>
                  AI-powered recommendations for improving website speed and performance with actionable insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Global Monitoring</CardTitle>
                <CardDescription>
                  Monitor performance from multiple geographic locations to ensure consistent user experience worldwide.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Automated Alerts</CardTitle>
                <CardDescription>
                  Intelligent alerting system that notifies you of performance issues before they impact users.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </FeatureLayout>
  );
}