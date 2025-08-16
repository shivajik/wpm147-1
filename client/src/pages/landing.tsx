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
  Bot
} from "lucide-react";
import { SiWordpress } from "react-icons/si";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced Professional Header */}
      <header className="bg-white/95 border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 xs:h-16 sm:h-18 lg:h-20">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-primary/20 animate-scale-in">
                  <SiWordpress className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 xs:-top-1 xs:-right-1 w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="hidden xs:block">
                <h1 className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">AIO Webcare</h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium hidden sm:block">Professional WordPress Management</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="/" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Home</a>
              <a href="/features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Features</a>
              <a href="/pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>

              <a href="/contact" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Contact</a>
            </nav>
            
            <div className="flex gap-2 xs:gap-2.5 sm:gap-3">
              <Button variant="outline" size="sm" asChild className="hidden sm:flex sm:size-lg shadow-button hover:shadow-card bg-white/90 border-slate-300 text-slate-900 hover:bg-white hover:text-slate-900">
                <a href="/login">Sign In</a>
              </Button>
              <Button size="sm" asChild className="xs:size-default sm:size-lg bg-primary hover:bg-primary/90 text-white shadow-elevated hover:shadow-xl transition-all text-xs xs:text-sm sm:text-base px-2.5 xs:px-3 sm:px-6 py-2 xs:py-2.5">
                <a href="/register">
                  <span className="hidden sm:inline">Get Started Free</span>
                  <span className="sm:hidden">Start Free</span>
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section with Visual Elements */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Animated Background with Enhanced Patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/40"></div>
        <div className="absolute inset-0 bg-mesh-gradient"></div>
        <div className="absolute inset-0 bg-dots-blue-200/40 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)]"></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-2xl rotate-12 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500/10 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-green-500/10 rounded-xl rotate-45 animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-40 w-24 h-24 bg-orange-500/10 rounded-3xl rotate-12 animate-bounce delay-500"></div>
        
        {/* Additional Decorative Elements */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-blue-400/60 rounded-full animate-ping delay-300"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400/40 rounded-full animate-pulse delay-1500"></div>
        <div className="absolute top-1/2 right-1/2 w-1 h-1 bg-green-400/70 rounded-full animate-ping delay-800"></div>
        
        
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium animate-scale-in">
                <Star className="w-4 h-4 mr-2 text-yellow-500 animate-pulse" />
                Trusted by 500+ WordPress Professionals
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 mb-6 sm:mb-8 leading-tight">
                WordPress Management
                <span className="gradient-text block animate-slide-up">Made Professional</span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 sm:mb-12 leading-relaxed animate-slide-up delay-200">
                Transform your WordPress maintenance business with intelligent automation, 
                comprehensive monitoring, and client management tools that scale with your success.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:justify-start justify-center mb-8 sm:mb-12 animate-slide-up delay-300">
                <Button size="lg" asChild className="sm:size-xl bg-primary hover:bg-primary/90 text-white shadow-xl hover:shadow-2xl transition-all text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 font-semibold group">
                  <a href="/register">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="sm:size-xl text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 border-2 border-slate-300 bg-white/90 text-slate-900 hover:bg-white hover:text-slate-900 font-semibold group">
                  <Activity className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap lg:justify-start justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-muted-foreground animate-slide-up delay-400">
                <div className="flex items-center gap-1 sm:gap-2 group">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 group-hover:scale-110 transition-transform" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 group">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">No credit card required</span>
                  <span className="sm:hidden">No card required</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 group">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 group-hover:scale-110 transition-transform" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Right Visual Element - Dashboard Preview */}
            <div className="relative lg:block hidden animate-scale-in delay-500">
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform rotate-3 hover:rotate-0 transition-transform duration-700">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <SiWordpress className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">WP ProCare Dashboard</h3>
                      <p className="text-sm text-slate-600">Live Management Center</p>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Security</span>
                      </div>
                      <div className="text-2xl font-bold text-green-700">98%</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium">Performance</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">A+</div>
                    </div>
                  </div>
                  
                  {/* Progress Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Active Sites</span>
                        <span>23/25</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-[92%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Updates Complete</span>
                        <span>18/20</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full w-[90%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center animate-pulse">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section with Icons */}
      <section className="py-20 bg-gradient-to-r from-slate-50 via-white to-slate-50 relative overflow-hidden">
        {/* Enhanced Background Patterns */}
        <div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:linear-gradient(0deg,transparent,black,transparent)]"></div>
        <div className="absolute inset-0 bg-dots-slate-200/30 [mask-image:linear-gradient(90deg,transparent,black_30%,black_70%,transparent)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-hexagon-pattern opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 animate-scale-in">
              <TrendingUp className="w-4 h-4 mr-2" />
              Proven Results
            </Badge>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Trusted by Industry Leaders</h3>
            <p className="text-lg text-slate-600">Real numbers from real businesses scaling with WP ProCare</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">10k+</div>
              <div className="text-slate-600 dark:text-slate-300 font-medium">Sites Managed</div>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">99.9%</div>
              <div className="text-slate-600 dark:text-slate-300 font-medium">Uptime Guarantee</div>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">2.5hrs</div>
              <div className="text-slate-600 dark:text-slate-300 font-medium">Time Saved Daily</div>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">500+</div>
              <div className="text-slate-600 dark:text-slate-300 font-medium">Happy Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-circuit-pattern opacity-30"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Everything you need to manage
              <span className="block gradient-text">WordPress like a pro</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools designed specifically for WordPress maintenance professionals and agencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Smart Client Management */}
            <Card className="relative border-0 shadow-card hover:shadow-elevated transition-all duration-500 group overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-blue-600 transition-colors">Smart Client Management</CardTitle>
                <CardDescription className="text-base leading-relaxed mb-4">
                  Organize clients with detailed profiles, contact history, and automated communication workflows that keep relationships strong.
                </CardDescription>
                <Link href="/features/client-management">
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardHeader>
            </Card>

            {/* Performance Monitoring */}
            <Card className="relative border-0 shadow-card hover:shadow-elevated transition-all duration-500 group overflow-hidden bg-gradient-to-br from-white via-white to-green-50/50">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                  <Gauge className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-green-600 transition-colors">Performance Monitoring</CardTitle>
                <CardDescription className="text-base leading-relaxed mb-4">
                  Real-time performance metrics, Core Web Vitals tracking, and automated optimization suggestions for lightning-fast sites.
                </CardDescription>
                <Link href="/features/performance-monitoring">
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardHeader>
            </Card>

            {/* Security Scanning */}
            <Card className="relative border-0 shadow-card hover:shadow-elevated transition-all duration-500 group overflow-hidden bg-gradient-to-br from-white via-white to-red-50/50">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-red-600 transition-colors">Security Scanning</CardTitle>
                <CardDescription className="text-base leading-relaxed mb-4">
                  Advanced malware detection, vulnerability scanning, and automated security hardening measures that protect your reputation.
                </CardDescription>
                <Link href="/features/security-scanning">
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardHeader>
            </Card>

            {/* Automated Maintenance */}
            <Card className="relative border-0 shadow-card hover:shadow-elevated transition-all duration-500 group overflow-hidden bg-gradient-to-br from-white via-white to-purple-50/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-purple-600 transition-colors">Automated Maintenance</CardTitle>
                <CardDescription className="text-base leading-relaxed mb-4">
                  Schedule updates, backups, and maintenance tasks with intelligent automation and rollback protection for peace of mind.
                </CardDescription>
                <Link href="/features/automated-maintenance">
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardHeader>
            </Card>

            {/* Advanced Analytics */}
            <Card className="relative border-0 shadow-card hover:shadow-elevated transition-all duration-500 group overflow-hidden bg-gradient-to-br from-white via-white to-cyan-50/50">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-cyan-600 transition-colors">Advanced Analytics</CardTitle>
                <CardDescription className="text-base leading-relaxed mb-4">
                  Comprehensive reporting, client dashboards, and business intelligence insights that drive growth and impress clients.
                </CardDescription>
                <Link href="/features/advanced-analytics">
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardHeader>
            </Card>

            {/* One-Click Actions */}
            <Card className="relative border-0 shadow-card hover:shadow-elevated transition-all duration-500 group overflow-hidden bg-gradient-to-br from-white via-white to-yellow-50/50">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                  <MousePointer className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-yellow-600 transition-colors">One-Click Actions</CardTitle>
                <CardDescription className="text-base leading-relaxed mb-4">
                  Streamlined workflows for common tasks like plugin updates, security fixes, and performance optimizations in seconds.
                </CardDescription>
                <Link href="/features/one-click-actions">
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="secondary" className="mb-6">Why Choose WP ProCare</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Scale your WordPress business with confidence
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Save 15+ Hours Per Week</h3>
                    <p className="text-slate-300">Automate routine maintenance tasks and focus on growing your business instead of manual updates.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Increase Client Retention by 40%</h3>
                    <p className="text-slate-300">Proactive monitoring and transparent reporting build trust and demonstrate value to clients.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Prevent 95% of Security Issues</h3>
                    <p className="text-slate-300">Advanced threat detection and automated security measures keep sites safe from attacks.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
              <Card className="relative bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <CardTitle className="text-white text-2xl">Dashboard Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/80">Active Sites</span>
                      <span className="text-green-400 font-semibold">127</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/80">Updates Available</span>
                      <span className="text-yellow-400 font-semibold">23</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/80">Security Score</span>
                      <span className="text-green-400 font-semibold">98%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Enhanced Background Patterns */}
        <div className="absolute inset-0 bg-diagonal-lines opacity-20"></div>
        <div className="absolute inset-0 bg-dots-white/20 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_90%)]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-400/20 to-blue-600/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/20 to-indigo-600/20 rounded-full blur-2xl"></div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Ready to transform your
            <span className="block gradient-text">WordPress business?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Join hundreds of WordPress professionals who trust WP ProCare to manage their client websites.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" asChild className="bg-primary hover:bg-primary/90 text-white shadow-xl hover:shadow-2xl transition-all text-lg px-12 py-6 font-semibold">
              <a href="/register">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="xl" className="text-lg px-12 py-6 border-2 border-slate-300 bg-white/90 text-slate-900 hover:bg-white hover:text-slate-900 font-semibold">
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 30-day free trial • Cancel anytime
          </p>
        </div>
      </section>


      {/* Enhanced Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-slate-800 pb-8 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <SiWordpress className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">AIO Webcare</h3>
                  <p className="text-slate-400">Professional WordPress Management Platform</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-white hover:text-slate-900">
                  Start Free Trial
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-800 hover:text-white">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Our Services</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Shield className="h-3 w-3 text-primary" />
                  Security Scanning
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Gauge className="h-3 w-3 text-primary" />
                  Performance Monitoring
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <BarChart3 className="h-3 w-3 text-primary" />
                  SEO Analysis & Reporting
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Bot className="h-3 w-3 text-primary" />
                  Automated Maintenance
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Users className="h-3 w-3 text-primary" />
                  Client Management
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Eye className="h-3 w-3 text-primary" />
                  Link Monitor
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Contact Us</h4>
              <div className="space-y-3 text-slate-400 text-sm">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Globe className="h-3 w-3 text-primary" />
                  <span>aiowebcare.com</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Users className="h-3 w-3 text-primary" />
                  <span>24/7 Expert Support</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Clock className="h-3 w-3 text-primary" />
                  <span>2-hour response time</span>
                </div>
                <div className="pt-2">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                    Get Support
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Platform</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/security" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="/documentation" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="/help-center" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/status" className="hover:text-white transition-colors">System Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Legal & Policies</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="/do-not-sell" className="hover:text-white transition-colors">Do Not Sell My Personal Information</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-sm">
                © 2025 AIO Webcare. All rights reserved. Professional WordPress maintenance and security platform.
              </p>
              <div className="flex items-center gap-4 text-slate-400 text-sm">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  All Systems Operational
                </span>
                <span>|</span>
                <span>v2.1.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
