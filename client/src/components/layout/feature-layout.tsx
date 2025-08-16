import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Gauge, BarChart3, Bot, Users, Eye, Globe, Clock } from "lucide-react";
import { SiWordpress } from "react-icons/si";

interface FeatureLayoutProps {
  children: React.ReactNode;
}

export default function FeatureLayout({ children }: FeatureLayoutProps) {
  return (
    <>
      {/* Header */}
      <header className="bg-white/95 border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 xs:h-16 sm:h-18 lg:h-20">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="relative">
                    <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                      <SiWordpress className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 xs:-top-1 xs:-right-1 w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div className="hidden xs:block">
                    <h1 className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">AIO Webcare</h1>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium hidden sm:block">Professional WordPress Management</p>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link href="/" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Home</Link>
              <Link href="/features" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Features</Link>
              <Link href="/pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</Link>
              <Link href="/contact" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Contact</Link>
            </nav>
            
            <div className="flex gap-2 xs:gap-2.5 sm:gap-3">
              <Button variant="outline" size="sm" asChild className="hidden sm:flex sm:size-lg shadow-button hover:shadow-card bg-white/90 border-slate-300 text-slate-900 hover:bg-white hover:text-slate-900">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="xs:size-default sm:size-lg bg-primary hover:bg-primary/90 text-white shadow-elevated hover:shadow-xl transition-all text-xs xs:text-sm sm:text-base px-2.5 xs:px-3 sm:px-6 py-2 xs:py-2.5">
                <Link href="/register">
                  <span className="hidden sm:inline">Get Started Free</span>
                  <span className="sm:hidden">Start Free</span>
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {children}

      {/* Enhanced Footer - Matching Landing Page */}
      <footer className="bg-slate-900 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <SiWordpress className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AIO Webcare</h3>
                  <p className="text-xs text-slate-400">WordPress Excellence</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Transform your WordPress maintenance business with our comprehensive platform. 
                Trusted by 500+ professionals worldwide for reliable, secure, and scalable solutions.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-400">99.9% Uptime Guarantee</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-xs text-slate-400">24/7 Expert Support</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-xs text-slate-400">2-hour response time</span>
                </div>
                <div className="pt-2">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                    Get Support
                  </Button>
                </div>
              </div>
            </div>
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
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">System Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Legal & Policies</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link href="/do-not-sell" className="hover:text-white transition-colors">Do Not Sell My Personal Information</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
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
    </>
  );
}