import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie, Settings, Eye, BarChart3, Shield, CheckCircle2 } from "lucide-react";
import { SiWordpress } from "react-icons/si";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="bg-white/95 border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                  <SiWordpress className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">AIO Webcare</h1>
                <p className="text-sm text-slate-600 font-medium">Professional WordPress Management</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 md:p-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Cookie className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Cookie Policy</h1>
                <p className="text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <p className="text-lg text-slate-600 leading-relaxed">
              This Cookie Policy explains how AIO Webcare uses cookies and similar technologies when you visit our website 
              and use our WordPress maintenance services. Learn about what cookies we use, why we use them, and how you can control them.
            </p>
          </div>

          <div className="space-y-8">
            {/* What Are Cookies */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="h-5 w-5 text-orange-600" />
                <h2 className="text-2xl font-semibold text-slate-900">What Are Cookies?</h2>
              </div>
              <div className="space-y-3 text-slate-700">
                <p>
                  Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. 
                  They help websites remember information about your visit, making your next visit easier and the site more useful to you.
                </p>
                <p>
                  Cookies are widely used to make websites work more efficiently and provide a better user experience. 
                  They cannot damage your device or files, and they cannot access personal information unless you provide it.
                </p>
              </div>
            </section>

            {/* Types of Cookies We Use */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Settings className="h-5 w-5 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Types of Cookies We Use</h2>
              </div>
              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Essential Cookies (Required)</h3>
                  </div>
                  <p className="text-slate-700 mb-3">
                    These cookies are necessary for our website to function properly and cannot be disabled.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li><strong>Authentication:</strong> Keep you logged in to your AIO Webcare account</li>
                    <li><strong>Security:</strong> Protect against cross-site request forgery and other security threats</li>
                    <li><strong>Session Management:</strong> Maintain your session and preferences during your visit</li>
                    <li><strong>Load Balancing:</strong> Ensure optimal website performance</li>
                  </ul>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Analytics Cookies (Optional)</h3>
                  </div>
                  <p className="text-slate-700 mb-3">
                    These cookies help us understand how visitors interact with our website by collecting anonymous information.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li><strong>Google Analytics:</strong> Track website usage, popular pages, and user journeys</li>
                    <li><strong>Performance Monitoring:</strong> Identify and fix technical issues</li>
                    <li><strong>User Experience:</strong> Understand how to improve our website and services</li>
                    <li><strong>Feature Usage:</strong> See which features are most valuable to users</li>
                  </ul>
                </div>

                {/* Functional Cookies */}
                <div className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Functional Cookies (Optional)</h3>
                  </div>
                  <p className="text-slate-700 mb-3">
                    These cookies enable enhanced functionality and personalization.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li><strong>Theme Preferences:</strong> Remember your dark/light mode preference</li>
                    <li><strong>Language Settings:</strong> Store your preferred language</li>
                    <li><strong>Dashboard Layout:</strong> Remember your customized dashboard settings</li>
                    <li><strong>Notification Preferences:</strong> Store your alert and notification settings</li>
                  </ul>
                </div>

                {/* Third-Party Cookies */}
                <div className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-5 w-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Third-Party Cookies</h3>
                  </div>
                  <p className="text-slate-700 mb-3">
                    Some cookies are set by third-party services that appear on our pages.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li><strong>Payment Processors:</strong> Stripe and other payment services for secure transactions</li>
                    <li><strong>Support Chat:</strong> Customer support chat widgets (when enabled)</li>
                    <li><strong>Content Delivery:</strong> CDN services for faster website loading</li>
                    <li><strong>Security Services:</strong> Anti-fraud and security protection services</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cookie Duration */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Cookie Duration</h2>
              <div className="space-y-3 text-slate-700">
                <p>Cookies have different lifespans depending on their purpose:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent Cookies:</strong> Remain on your device for a set period (usually 1-2 years)</li>
                  <li><strong>Authentication Cookies:</strong> Typically last 30 days or until you log out</li>
                  <li><strong>Preference Cookies:</strong> Usually last 1 year to remember your settings</li>
                  <li><strong>Analytics Cookies:</strong> Typically last 2 years for long-term trend analysis</li>
                </ul>
              </div>
            </section>

            {/* Managing Your Cookie Preferences */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Settings className="h-5 w-5 text-green-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Managing Your Cookie Preferences</h2>
              </div>
              <div className="space-y-4 text-slate-700">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Through Your Browser</h3>
                  <p className="mb-2">You can control cookies through your browser settings:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                    <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                    <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Through Our Website</h3>
                  <p>You can also manage your cookie preferences through our cookie consent banner that appears when you first visit our site, or by adjusting settings in your account dashboard.</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Note:</strong> Disabling essential cookies may affect website functionality and prevent you from using certain features of our service.
                  </p>
                </div>
              </div>
            </section>

            {/* Third-Party Analytics */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Third-Party Analytics</h2>
              <div className="space-y-3 text-slate-700">
                <p>We use Google Analytics to understand how our website is used. Google Analytics may use cookies to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Distinguish unique users and sessions</li>
                  <li>Track page views and user interactions</li>
                  <li>Provide reports on website traffic and user behavior</li>
                  <li>Help us improve our website and services</li>
                </ul>
                <p>
                  You can opt-out of Google Analytics by installing the 
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline mx-1">
                    Google Analytics Opt-out Browser Add-on
                  </a>
                  or by adjusting your cookie preferences.
                </p>
              </div>
            </section>

            {/* Do Not Track */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-purple-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Do Not Track Signals</h2>
              </div>
              <div className="space-y-3 text-slate-700">
                <p>
                  Some browsers include a "Do Not Track" feature that lets you tell websites you don't want to have your online activities tracked. 
                  Currently, there is no standard way for websites to respond to Do Not Track signals.
                </p>
                <p>
                  We respect your privacy choices and provide clear opt-out mechanisms for non-essential cookies. 
                  You can always control your cookie preferences through your browser settings or our cookie management tools.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your Rights</h2>
              <div className="space-y-3 text-slate-700">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Accept or Decline:</strong> Choose which types of cookies to accept</li>
                  <li><strong>Withdraw Consent:</strong> Change your cookie preferences at any time</li>
                  <li><strong>Delete Cookies:</strong> Remove existing cookies from your device</li>
                  <li><strong>Access Information:</strong> Request information about the data collected through cookies</li>
                  <li><strong>Complaint:</strong> File a complaint with data protection authorities if you have concerns</li>
                </ul>
              </div>
            </section>

            {/* Updates to Cookie Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Updates to This Cookie Policy</h2>
              <p className="text-slate-700">
                We may update this Cookie Policy from time to time to reflect changes in our practices, technology, 
                or legal requirements. We will notify you of any material changes by posting the updated policy on this page 
                and updating the "Last updated" date.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-slate-50 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Questions About Cookies?</h2>
              <p className="text-slate-700 mb-4">
                If you have questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>Email:</strong> privacy@aiowebcare.com</p>
                <p><strong>Subject Line:</strong> Cookie Policy Inquiry</p>
                <p><strong>Response Time:</strong> We will respond within 5 business days</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  For more information about our data practices, see our 
                  <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline mx-1">Privacy Policy</a>
                  and 
                  <a href="/do-not-sell" className="text-blue-600 hover:text-blue-800 underline mx-1">Do Not Sell My Personal Information</a>
                  page.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}