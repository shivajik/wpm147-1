import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldX, Eye, AlertCircle, Mail, CheckCircle2, XCircle } from "lucide-react";
import { SiWordpress } from "react-icons/si";

export default function DoNotSell() {
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
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <ShieldX className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Do Not Sell My Personal Information</h1>
                <p className="text-slate-600">Your California Privacy Rights (CCPA)</p>
              </div>
            </div>
            <p className="text-lg text-slate-600 leading-relaxed">
              California residents have the right to request that businesses not sell their personal information. 
              Learn about your rights under the California Consumer Privacy Act (CCPA) and how AIO Webcare handles your data.
            </p>
          </div>

          <div className="space-y-8">
            {/* Important Notice */}
            <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Notice</h3>
                  <p className="text-blue-800">
                    <strong>AIO Webcare does not sell personal information.</strong> We do not sell, rent, or trade your personal information 
                    to third parties for monetary or other valuable consideration. This page explains your rights under California law 
                    and how we protect your privacy.
                  </p>
                </div>
              </div>
            </section>

            {/* What This Means */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-5 w-5 text-green-600" />
                <h2 className="text-2xl font-semibold text-slate-900">What "Do Not Sell" Means</h2>
              </div>
              <div className="space-y-4 text-slate-700">
                <p>Under the California Consumer Privacy Act (CCPA), "selling" personal information means:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Sharing personal information with third parties for monetary payment</li>
                  <li>Exchanging personal information for other valuable consideration</li>
                  <li>Making personal information available to third parties for their commercial purposes</li>
                </ul>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Our Commitment</h3>
                  </div>
                  <p className="text-green-800">
                    AIO Webcare has never sold personal information and we never will. Your data is used solely to provide 
                    WordPress maintenance services and improve our platform.
                  </p>
                </div>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Personal Information We Collect</h2>
              <div className="space-y-4 text-slate-700">
                <p>We collect the following categories of personal information to provide our WordPress maintenance services:</p>
                <div className="grid gap-4">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Contact Information</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Name, email address, phone number</li>
                      <li>Company name and business information</li>
                      <li>Billing and payment details</li>
                    </ul>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Website Information</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>WordPress website URLs and credentials (encrypted)</li>
                      <li>Website performance and security data</li>
                      <li>Plugin, theme, and content information</li>
                    </ul>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Usage Information</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Platform usage patterns and preferences</li>
                      <li>Support interactions and communications</li>
                      <li>Account settings and configurations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Share Information */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">How We Share Information</h2>
              <div className="space-y-4 text-slate-700">
                <p>We may share your personal information only in these limited circumstances:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Service Providers</h3>
                      <p className="text-sm">Third-party services that help us operate our platform (payment processors, hosting providers, analytics)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Legal Requirements</h3>
                      <p className="text-sm">When required by law, court order, or to protect our rights and safety</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Business Transfers</h3>
                      <p className="text-sm">In the event of a merger, acquisition, or sale of assets (with proper notice)</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">What We Don't Do</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-red-800 text-sm ml-4">
                    <li>Sell your information to data brokers or marketers</li>
                    <li>Share your data with advertising networks for profit</li>
                    <li>Trade your information for business benefits</li>
                    <li>Rent your contact information to third parties</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Your California Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your California Privacy Rights</h2>
              <div className="space-y-4 text-slate-700">
                <p>If you are a California resident, you have the right to:</p>
                <div className="grid gap-4">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Right to Know</h3>
                    <p className="text-sm">Request information about the personal information we collect, use, and share about you</p>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Right to Delete</h3>
                    <p className="text-sm">Request deletion of your personal information (subject to certain exceptions)</p>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Right to Opt-Out</h3>
                    <p className="text-sm">Request that we not sell your personal information (already our policy)</p>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Right to Non-Discrimination</h3>
                    <p className="text-sm">We cannot discriminate against you for exercising your privacy rights</p>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Exercise Your Rights */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-5 w-5 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">How to Exercise Your Rights</h2>
              </div>
              <div className="space-y-4 text-slate-700">
                <p>To exercise your California privacy rights, you can:</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Contact Us Directly</h3>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> privacy@aiowebcare.com</p>
                    <p><strong>Subject Line:</strong> California Privacy Rights Request</p>
                    <p><strong>Phone:</strong> Available through your account dashboard</p>
                    <p><strong>Mail:</strong> AIO Webcare Privacy Team</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Verification Process</h3>
                  <p>To protect your privacy, we will verify your identity before processing requests by:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Confirming your email address associated with your account</li>
                    <li>Asking for account verification details</li>
                    <li>Requiring additional identity verification for sensitive requests</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Response Timeline</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Acknowledgment:</strong> Within 10 business days</li>
                    <li><strong>Response:</strong> Within 45 days (may extend to 90 days for complex requests)</li>
                    <li><strong>Free Service:</strong> We do not charge fees for processing privacy requests</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Authorized Agents */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Authorized Agents</h2>
              <div className="space-y-3 text-slate-700">
                <p>You may use an authorized agent to submit a privacy request on your behalf. We require:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Written permission from you authorizing the agent to act on your behalf</li>
                  <li>Verification of the agent's identity</li>
                  <li>Direct confirmation from you of the request (in some cases)</li>
                </ul>
              </div>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Updates to This Policy</h2>
              <p className="text-slate-700">
                We may update this notice to reflect changes in our practices or for legal reasons. 
                Material changes will be communicated via email or through our service. 
                The updated notice will be effective when posted on this page.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-slate-50 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Questions or Concerns?</h2>
              <p className="text-slate-700 mb-4">
                If you have questions about your privacy rights or our data practices:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>Privacy Team:</strong> privacy@aiowebcare.com</p>
                <p><strong>General Support:</strong> support@aiowebcare.com</p>
                <p><strong>Response Time:</strong> Privacy inquiries answered within 10 business days</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  For more information about our data practices, see our 
                  <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline mx-1">Privacy Policy</a>
                  and 
                  <a href="/cookie-policy" className="text-blue-600 hover:text-blue-800 underline mx-1">Cookie Policy</a>.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}