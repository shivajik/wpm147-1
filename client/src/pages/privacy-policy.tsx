import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Database, Eye, Users, FileText } from "lucide-react";
import { SiWordpress } from "react-icons/si";

export default function PrivacyPolicy() {
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
                <p className="text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <p className="text-lg text-slate-600 leading-relaxed">
              At AIO Webcare, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our WordPress maintenance and management services.
            </p>
          </div>

          <div className="space-y-8">
            {/* Information We Collect */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-5 w-5 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-slate-700">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name and contact information (email address, phone number)</li>
                    <li>Company information and billing details</li>
                    <li>WordPress website URLs and access credentials (encrypted)</li>
                    <li>Account preferences and settings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Technical Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Website performance metrics and analytics data</li>
                    <li>Security scan results and vulnerability reports</li>
                    <li>Plugin and theme update logs</li>
                    <li>Backup and maintenance activity logs</li>
                    <li>IP addresses and browser information for security purposes</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-green-600" />
                <h2 className="text-2xl font-semibold text-slate-900">How We Use Your Information</h2>
              </div>
              <div className="space-y-3 text-slate-700">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Provide WordPress maintenance services:</strong> Monitor, update, and secure your websites</li>
                  <li><strong>Generate reports:</strong> Create performance, security, and maintenance reports</li>
                  <li><strong>Communicate with you:</strong> Send service updates, alerts, and important notifications</li>
                  <li><strong>Improve our services:</strong> Analyze usage patterns to enhance our platform</li>
                  <li><strong>Ensure security:</strong> Detect and prevent fraudulent or malicious activities</li>
                  <li><strong>Process payments:</strong> Handle billing and subscription management</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-5 w-5 text-red-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Data Security</h2>
              </div>
              <div className="space-y-3 text-slate-700">
                <p>We implement industry-standard security measures to protect your data:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Encryption:</strong> All sensitive data is encrypted both in transit and at rest</li>
                  <li><strong>Access controls:</strong> Strict access controls and authentication requirements</li>
                  <li><strong>Regular security audits:</strong> Ongoing security assessments and vulnerability testing</li>
                  <li><strong>Secure infrastructure:</strong> Enterprise-grade hosting with 24/7 monitoring</li>
                  <li><strong>Data backups:</strong> Regular encrypted backups stored in secure locations</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-5 w-5 text-purple-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Information Sharing</h2>
              </div>
              <div className="space-y-3 text-slate-700">
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Service providers:</strong> Trusted third-party services that help us operate our platform (payment processors, hosting providers)</li>
                  <li><strong>Legal requirements:</strong> When required by law, court order, or regulatory authorities</li>
                  <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
                  <li><strong>Protection:</strong> To protect the rights, property, or safety of AIO Webcare, our users, or others</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-orange-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Your Rights</h2>
              </div>
              <div className="space-y-3 text-slate-700">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Access:</strong> Request access to your personal information we hold</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                  <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                </ul>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Retention</h2>
              <div className="space-y-3 text-slate-700">
                <p>We retain your information for as long as necessary to provide our services and comply with legal obligations:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Account information:</strong> Retained while your account is active and for up to 7 years after closure for legal compliance</li>
                  <li><strong>Website monitoring data:</strong> Retained for up to 2 years for historical reporting and analysis</li>
                  <li><strong>Security logs:</strong> Retained for up to 1 year for security and fraud prevention</li>
                  <li><strong>Marketing data:</strong> Retained until you unsubscribe or request deletion</li>
                </ul>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Cookies and Tracking</h2>
              <div className="space-y-3 text-slate-700">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maintain your login session and preferences</li>
                  <li>Analyze website usage and improve our services</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
                <p>You can control cookies through your browser settings. For more information, see our <a href="/cookie-policy" className="text-blue-600 hover:text-blue-800 underline">Cookie Policy</a>.</p>
              </div>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-slate-700">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. 
                We will notify you of any material changes by email or through our service. The updated policy will be 
                effective when posted on this page.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-slate-50 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
              <p className="text-slate-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>Email:</strong> privacy@aiowebcare.com</p>
                <p><strong>Address:</strong> AIO Webcare Privacy Team</p>
                <p><strong>Response Time:</strong> We will respond to privacy inquiries within 30 days</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}