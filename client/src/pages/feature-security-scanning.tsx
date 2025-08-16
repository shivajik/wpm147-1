import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle2, Lock, Eye, Zap } from "lucide-react";
import { Link } from "wouter";
import FeatureLayout from "@/components/layout/feature-layout";

export default function SecurityScanning() {
  return (
    <FeatureLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
        {/* Feature Header */}
        <section className="bg-gradient-to-r from-red-600 to-orange-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Security Scanning</h1>
              <p className="text-xl text-red-100 max-w-2xl mx-auto mb-8">
                Advanced malware detection and vulnerability assessment for complete protection
              </p>
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50">
                Start Security Scan
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
                    <p className="text-sm text-slate-600 mb-1">Security Score</p>
                    <p className="text-2xl font-bold text-slate-900">94/100</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">Excellent</span>
                    <span className="text-slate-500">security rating</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-orange-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Threats Blocked</p>
                    <p className="text-2xl font-bold text-slate-900">127</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-orange-600 font-medium">12 this week</span>
                    <span className="text-slate-500">automatic blocking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Last Scan</p>
                    <p className="text-2xl font-bold text-slate-900">2h ago</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={100} className="h-2" />
                  <p className="text-sm text-slate-500 mt-2">No threats found</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-white to-purple-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Vulnerabilities</p>
                    <p className="text-2xl font-bold text-slate-900">2</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Lock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-purple-600 font-medium">1 critical</span>
                    <span className="text-slate-500">needs attention</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Real-time Protection</CardTitle>
                <CardDescription>
                  Continuous monitoring and instant threat detection with automated blocking of malicious activities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Malware Detection</CardTitle>
                <CardDescription>
                  Deep-scan technology that identifies malware, backdoors, and suspicious code patterns across all files.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Vulnerability Assessment</CardTitle>
                <CardDescription>
                  Automated scanning for known vulnerabilities in WordPress core, plugins, and themes with instant alerts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Auto-Remediation</CardTitle>
                <CardDescription>
                  Intelligent security hardening with automated fixes for common vulnerabilities and security configurations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Security Monitoring</CardTitle>
                <CardDescription>
                  24/7 security monitoring with detailed logs and comprehensive reporting for peace of mind.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Threat Intelligence</CardTitle>
                <CardDescription>
                  Advanced threat intelligence with machine learning algorithms to detect emerging security threats.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </FeatureLayout>
  );
}