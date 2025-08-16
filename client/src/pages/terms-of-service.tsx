import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle2, XCircle, Users } from "lucide-react";
import { SiWordpress } from "react-icons/si";

export default function TermsOfService() {
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
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
                <p className="text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <p className="text-lg text-slate-600 leading-relaxed">
              These Terms of Service govern your use of AIO Webcare's WordPress maintenance and management services. 
              By using our services, you agree to these terms.
            </p>
          </div>

          <div className="space-y-8">
            {/* Service Agreement */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Service Agreement</h2>
              </div>
              <div className="space-y-4 text-slate-700">
                <p>AIO Webcare provides WordPress maintenance, security, performance optimization, and management services ("Services") to website owners and businesses ("Clients").</p>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Our Services Include:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>WordPress core, plugin, and theme updates</li>
                    <li>Security monitoring and malware scanning</li>
                    <li>Performance optimization and monitoring</li>
                    <li>Automated backups and restore services</li>
                    <li>SEO analysis and reporting</li>
                    <li>Link monitoring and broken link detection</li>
                    <li>Client reporting and analytics</li>
                    <li>Technical support and consultation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">User Responsibilities</h2>
              </div>
              <div className="space-y-4 text-slate-700">
                <p>As a user of our services, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide accurate and complete information about your WordPress websites</li>
                  <li>Maintain valid WordPress admin credentials and access permissions</li>
                  <li>Keep your account information up to date</li>
                  <li>Pay all fees and charges on time according to your selected plan</li>
                  <li>Use our services only for legitimate business purposes</li>
                  <li>Comply with WordPress.org terms and all applicable laws</li>
                  <li>Not interfere with or disrupt our services or servers</li>
                  <li>Maintain reasonable backups independent of our backup services</li>
                </ul>
              </div>
            </section>

            {/* Service Levels and Limitations */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Service Levels and Limitations</h2>
              </div>
              <div className="space-y-4 text-slate-700">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Service Availability</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>We strive for 99.9% uptime but do not guarantee uninterrupted service</li>
                    <li>Planned maintenance will be announced in advance when possible</li>
                    <li>Emergency maintenance may occur without notice</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Service Limitations</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>We provide maintenance services, not custom development or design</li>
                    <li>Plugin and theme compatibility issues may require manual intervention</li>
                    <li>Some websites may have unique configurations that limit automated services</li>
                    <li>Third-party plugin or theme issues are outside our direct control</li>
                    <li>We cannot guarantee specific performance improvements or search rankings</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Billing and Payments */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Billing and Payments</h2>
              <div className="space-y-3 text-slate-700">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Subscription Plans:</strong> Services are billed monthly or annually based on your selected plan</li>
                  <li><strong>Auto-renewal:</strong> Subscriptions automatically renew unless cancelled before the next billing cycle</li>
                  <li><strong>Payment Methods:</strong> We accept major credit cards and digital payment methods</li>
                  <li><strong>Late Payments:</strong> Services may be suspended for accounts with overdue payments</li>
                  <li><strong>Refunds:</strong> Refunds are provided according to our refund policy (see Cancellation section)</li>
                  <li><strong>Price Changes:</strong> We may adjust pricing with 30 days advance notice</li>
                </ul>
              </div>
            </section>

            {/* Data and Security */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data and Security</h2>
              <div className="space-y-3 text-slate-700">
                <p>We take data security seriously and implement industry-standard protection measures:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Data Protection:</strong> Your website data is encrypted and securely stored</li>
                  <li><strong>Access Control:</strong> Strict access controls limit who can view your data</li>
                  <li><strong>Backup Security:</strong> Backups are encrypted and stored in secure locations</li>
                  <li><strong>Credential Management:</strong> WordPress credentials are encrypted and regularly rotated</li>
                  <li><strong>Incident Response:</strong> We have procedures for handling security incidents</li>
                </ul>
                <p>For detailed information, please review our <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>.</p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="h-5 w-5 text-red-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Limitation of Liability</h2>
              </div>
              <div className="space-y-3 text-slate-700">
                <p><strong>IMPORTANT:</strong> Please read this section carefully as it limits our liability.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Our total liability for any claim is limited to the amount you paid for services in the 12 months preceding the claim</li>
                  <li>We are not liable for indirect, incidental, special, or consequential damages</li>
                  <li>We are not responsible for data loss due to third-party actions, natural disasters, or circumstances beyond our control</li>
                  <li>We strongly recommend maintaining independent backups of your website</li>
                  <li>We are not liable for losses due to hacking, security breaches, or malware attacks</li>
                  <li>Our services are provided "as is" without warranties of any kind</li>
                </ul>
              </div>
            </section>

            {/* Cancellation and Refunds */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Cancellation and Refunds</h2>
              <div className="space-y-3 text-slate-700">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Cancellation Policy</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>You may cancel your subscription at any time from your account dashboard</li>
                    <li>Cancellations take effect at the end of your current billing period</li>
                    <li>No further charges will be made after cancellation</li>
                    <li>You retain access to services until the end of your billing period</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Refund Policy</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>30-Day Money-Back Guarantee:</strong> Full refund available within 30 days of first subscription</li>
                    <li><strong>Pro-rated Refunds:</strong> Available for annual plans cancelled within the first 30 days</li>
                    <li><strong>No Partial Refunds:</strong> Monthly subscriptions are not refundable after 30 days</li>
                    <li><strong>Processing Time:</strong> Refunds are processed within 5-10 business days</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Termination</h2>
              <div className="space-y-3 text-slate-700">
                <p>We may suspend or terminate your account if you:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Violate these Terms of Service</li>
                  <li>Fail to pay fees when due</li>
                  <li>Use our services for illegal or harmful purposes</li>
                  <li>Engage in abusive behavior toward our staff or other users</li>
                  <li>Attempt to reverse engineer or compromise our systems</li>
                </ul>
                <p>Upon termination, your access to services will cease, and your data may be deleted after a reasonable notice period.</p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Intellectual Property</h2>
              <div className="space-y-3 text-slate-700">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>AIO Webcare retains all rights to our platform, software, and proprietary technology</li>
                  <li>You retain ownership of your website content and data</li>
                  <li>You grant us limited rights to access and manage your WordPress sites as necessary to provide services</li>
                  <li>You are responsible for ensuring you have rights to all content on your websites</li>
                  <li>Our reports and analytics remain our intellectual property but you may use them for your business purposes</li>
                </ul>
              </div>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Modifications to Terms</h2>
              <p className="text-slate-700">
                We may modify these Terms of Service from time to time. Material changes will be communicated via email 
                or through our service at least 30 days before taking effect. Continued use of our services after changes 
                become effective constitutes acceptance of the updated terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Governing Law</h2>
              <p className="text-slate-700">
                These Terms of Service are governed by and construed in accordance with applicable laws. 
                Any disputes will be resolved through binding arbitration or in courts of competent jurisdiction.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-slate-50 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
              <p className="text-slate-700 mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>Email:</strong> legal@aiowebcare.com</p>
                <p><strong>Support:</strong> support@aiowebcare.com</p>
                <p><strong>Address:</strong> AIO Webcare Legal Department</p>
                <p><strong>Response Time:</strong> We will respond to legal inquiries within 5 business days</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}