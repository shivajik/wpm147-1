import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Shield, 
  Clock, 
  Users, 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  Star,
  ArrowRight,
  Gauge,
  Lock,
  Activity,
  Globe,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Rocket,
  Target,
  MonitorSpeaker,
  Database,
  Settings,
  Eye,
  Layers,
  MousePointer,
  Bot,
  Download,
  RefreshCw,
  FileText,
  Search,
  Monitor,
  Link,
  Cloud,
  Code,
  Smartphone,
  Mail,
  Calendar,
  HardDrive,
  LineChart,
  Loader2,
  Check,
  X,
  Crown,
  Award,
  Headphones
} from "lucide-react";
import { SiWordpress } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

type SubscriptionPlan = {
  id: number;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isActive: boolean;
};

export default function Features() {
  const { data: subscriptionPlans, isLoading, error } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create a comprehensive feature list with plan availability
  const createFeatureComparison = () => {
    if (!subscriptionPlans) return [];
    
    // Sort plans by price
    const sortedPlans = [...subscriptionPlans].sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    
    // Collect all unique features across all plans, excluding the ones to remove
    const featuresToRemove = [
      "Google Analytics Integration",
      "Up to 5 websites", 
      "Up to 1 website",
      "API access"
    ];
    
    const allFeatureNames = new Set<string>();
    sortedPlans.forEach(plan => {
      if (Array.isArray(plan.features)) {
        plan.features.forEach(feature => {
          // Only add features that are not in the removal list
          if (!featuresToRemove.some(removeFeature => feature.toLowerCase().includes(removeFeature.toLowerCase()))) {
            allFeatureNames.add(feature);
          }
        });
      }
    });

    // Add some universal features that should appear for all plans (excluding Google Analytics)
    const universalFeatures = [
      "WordPress Dashboard Access",
      "Website Health Monitoring", 
      "Basic Security Checks",
      "Site Management Tools"
    ];
    
    universalFeatures.forEach(feature => allFeatureNames.add(feature));

    return Array.from(allFeatureNames).map(featureName => {
      const availability: Record<string, boolean> = {};
      
      sortedPlans.forEach(plan => {
        // Universal features are available to all plans
        if (universalFeatures.includes(featureName)) {
          availability[plan.name] = true;
        } else {
          availability[plan.name] = Array.isArray(plan.features) && plan.features.includes(featureName);
        }
      });

      return {
        name: featureName,
        availability
      };
    });
  };

  const featureComparison = createFeatureComparison();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading features...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-slate-600">Failed to load features. Please try again later.</p>
        </div>
      </div>
    );
  }
  // Sort plans by price for consistent ordering
  const sortedPlans = subscriptionPlans ? [...subscriptionPlans].sort((a, b) => a.monthlyPrice - b.monthlyPrice) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="bg-white/95 border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                  <SiWordpress className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900">AIO Webcare</h1>
                <p className="text-sm text-slate-600 font-medium hidden sm:block">Professional WordPress Management</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Home</a>
              <a href="/features" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Features</a>
              <a href="/pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>

              <a href="/contact" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Contact</a>
            </nav>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild className="hidden sm:flex bg-white/90 border-slate-300">
                <a href="/login">Sign In</a>
              </Button>
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                <a href="/register">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
            Everything you need to automate your workflow
          </Badge>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            WordPress Management
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Forget login spreadsheets, bookmarks and password managers. Once you add your websites to the dashboard, 
            all are accessible from one place, with a simple click.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-white shadow-xl">
              <a href="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-2 bg-white/90">
              <Activity className="mr-2 h-5 w-5" />
              View All Features
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Feature Comparison
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              WordPress Management
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Plans & Features
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Compare features across all plans to find the perfect fit for your needs.
            </p>
          </div>

          {/* Feature Comparison Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-xl">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200">
              <div className="grid grid-cols-5 gap-4 p-6">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-900">Features</h3>
                </div>
                {sortedPlans.map((plan) => {
                  const iconMap: Record<string, React.ReactNode> = {
                    'free': <Zap className="w-5 h-5" />,
                    'maintain': <Settings className="w-5 h-5" />,
                    'protect': <Shield className="w-5 h-5" />,
                    'perform': <Crown className="w-5 h-5" />
                  };

                  return (
                    <div key={plan.id} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm border">
                          {iconMap[plan.name] || <Star className="w-5 h-5" />}
                        </div>
                      </div>
                      <h4 className="font-semibold text-slate-900">{plan.displayName}</h4>
                      <p className="text-sm text-slate-600">
                        {plan.monthlyPrice === 0 ? '$0' : `$${(plan.monthlyPrice / 100).toFixed(0)}`}
                        <span className="text-xs block">
                          {plan.monthlyPrice === 0 ? 'forever' : '/month'}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature Rows */}
            <div className="divide-y divide-slate-100">
              {featureComparison.map((feature, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center">
                    <span className="font-medium text-slate-900">{feature.name}</span>
                  </div>
                  {sortedPlans.map((plan) => (
                    <div key={plan.id} className="flex justify-center items-center">
                      {feature.availability[plan.name] ? (
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full">
                          <X className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-slate-200">
              <div className="grid grid-cols-5 gap-4 p-6">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-slate-600">Ready to get started?</span>
                </div>
                {sortedPlans.map((plan) => {
                  const ctaText = plan.name === 'free' ? 'Get Started Free' : 
                                 plan.name === 'perform' ? 'Contact Sales' : 'Start Free Trial';
                  
                  return (
                    <div key={plan.id} className="flex justify-center">
                      <Button 
                        className={`w-full ${plan.name === 'maintain' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        variant={plan.name === 'maintain' ? 'default' : 'outline'}
                      >
                        {ctaText}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard Preview */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics & Reporting
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Comprehensive Site Analytics
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Get detailed insights into your website's health, performance, and optimization opportunities with our advanced analytics dashboard.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/60 bg-gradient-to-br from-purple-100 to-blue-100 p-8">
              {/* Custom Analytics Dashboard SVG */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* URLs Having Errors Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-gray-700 text-sm font-medium mb-4">URLs Having Errors</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-gray-900">12,000</span>
                    <span className="text-green-500 text-sm font-medium flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      395
                    </span>
                  </div>
                </div>

                {/* Site Health Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-gray-700 text-sm font-medium">Site Health</h3>
                      <div className="flex items-end gap-2 mt-2">
                        <span className="text-4xl font-bold text-gray-900">85%</span>
                        <span className="text-green-500 text-sm font-medium flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          3%
                        </span>
                      </div>
                    </div>
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${85 * 2.51} ${100 * 2.51}`}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* HTTP Status Codes Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-gray-700 text-sm font-medium mb-6">HTTP Status Codes By Depth</h3>
                <div className="flex items-end gap-8 h-32">
                  {/* Legend */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm text-gray-600">2XX</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-300"></div>
                      <span className="text-sm text-gray-600">3XX</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pink-300"></div>
                      <span className="text-sm text-gray-600">4XX</span>
                    </div>
                  </div>
                  
                  {/* Chart Bars */}
                  <div className="flex items-end gap-4 flex-1 h-full">
                    {[
                      { success: 20, redirect: 5, error: 2 },
                      { success: 35, redirect: 8, error: 4 },
                      { success: 45, redirect: 12, error: 6 },
                      { success: 55, redirect: 15, error: 8 },
                      { success: 40, redirect: 18, error: 12 }
                    ].map((bar, index) => (
                      <div key={index} className="flex flex-col items-center gap-1 flex-1">
                        <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden relative" style={{ height: '100px' }}>
                          <div 
                            className="absolute bottom-0 w-full bg-purple-500 rounded-t-lg"
                            style={{ height: `${bar.success}%` }}
                          />
                          <div 
                            className="absolute w-full bg-purple-300"
                            style={{ 
                              bottom: `${bar.success}%`, 
                              height: `${bar.redirect}%` 
                            }}
                          />
                          <div 
                            className="absolute w-full bg-pink-300 rounded-t-lg"
                            style={{ 
                              bottom: `${bar.success + bar.redirect}%`, 
                              height: `${bar.error}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Real-time Monitoring</h3>
                <p className="text-sm text-slate-600">Track site health, uptime, and performance metrics in real-time</p>
              </div>
              
              <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Performance Insights</h3>
                <p className="text-sm text-slate-600">Detailed analysis of HTTP status codes and optimization opportunities</p>
              </div>
              
              <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Automated Reports</h3>
                <p className="text-sm text-slate-600">Professional reports with actionable insights for clients</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Industry Leaders Stats */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Real numbers from real businesses scaling with AIO Webcare
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Sites Managed */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <div className="text-4xl lg:text-5xl font-bold text-slate-900">
                  25,000+
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Sites Managed</h3>
                <p className="text-sm text-slate-500">Active WordPress sites under management</p>
              </div>
            </div>

            {/* Uptime Guarantee */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <div className="text-4xl lg:text-5xl font-bold text-slate-900">
                  99.9%
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Uptime Guarantee</h3>
                <p className="text-sm text-slate-500">Average uptime across all managed sites</p>
              </div>
            </div>

            {/* Time Saved Daily */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <div className="text-4xl lg:text-5xl font-bold text-slate-900">
                  8hrs
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Time Saved Daily</h3>
                <p className="text-sm text-slate-500">Average time saved per agency per day</p>
              </div>
            </div>

            {/* Happy Clients */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <div className="text-4xl lg:text-5xl font-bold text-slate-900">
                  5,000+
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Happy Clients</h3>
                <p className="text-sm text-slate-500">Agencies and freelancers worldwide</p>
              </div>
            </div>
          </div>

          {/* Additional Trust Indicators */}
          <div className="mt-16 pt-16 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex items-center justify-center space-x-3">
                <Shield className="w-8 h-8 text-green-500" />
                <div>
                  <div className="font-semibold text-slate-900">Enterprise Security</div>
                  <div className="text-sm text-slate-600">SOC2 Type II Certified</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Award className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="font-semibold text-slate-900">Industry Leader</div>
                  <div className="text-sm text-slate-600">Top WordPress Management Tool</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Headphones className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="font-semibold text-slate-900">24/7 Support</div>
                  <div className="text-sm text-slate-600">Average 2min response time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Over 65,000 WordPress professionals trust AIO Webcare
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Add as many websites as you want for free, no credit card required. 
            Sign up and start saving time!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl">
              <a href="/register">
                Sign Up Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600">
              <Mail className="mr-2 h-5 w-5" />
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <SiWordpress className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AIO Webcare</h3>
                  <p className="text-slate-400">Professional WordPress Management</p>
                </div>
              </div>
              <p className="text-slate-400 max-w-md">
                The comprehensive WordPress maintenance platform trusted by professionals worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>

              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-400">© 2025 AIO Webcare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}