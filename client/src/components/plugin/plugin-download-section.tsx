import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, Info, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function PluginDownloadSection() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    // Download the exact plugin that works with KSoft Solution (AS College compatibility fix)
    const link = document.createElement('a');
    link.href = '/wp-remote-manager-enhanced-users-v3.2.0-final-exact.zip';
    link.download = 'wp-remote-manager-enhanced-users-v3.2.0-final-exact.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "WP Remote Manager Enhanced Users v3.2.0 Final (API Key Sync Fixed) is being downloaded.",
    });
  };

  const handleCopyInstallInstructions = () => {
    const instructions = `1. Download wp-remote-manager-enhanced-users-v3.2.0-api-key-sync-fixed.zip
2. Extract the zip file to reveal wp-remote-manager-enhanced-users.php
3. Upload wp-remote-manager-enhanced-users.php to wp-content/plugins/
4. Activate the plugin in WordPress admin
5. Go to Settings → Remote Manager

✨ FIXED: API Key Sync Issue Resolved
- Two-way sync: Generate keys in WordPress OR dashboard
- WordPress → Dashboard: Generate key in WordPress, copy to dashboard
- Dashboard → WordPress: Generate key in dashboard, paste in WordPress
- User email addresses included (like ManageWP)
- Detailed user metadata and login tracking
- Enhanced security with enterprise-grade protection

Note: This version enables proper API key synchronization between WordPress and the dashboard.`;

    navigator.clipboard.writeText(instructions).then(() => {
      setCopied(true);
      toast({
        title: "Instructions Copied",
        description: "Installation instructions copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">WP Remote Manager - Enhanced Users</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enhanced User Metadata Edition with Email Support - Like ManageWP
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            v3.2.0 Final (API Key Sync Fixed)
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Enhanced Features */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-foreground">🆕 Enhanced User Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                User email addresses included (like ManageWP)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Detailed user metadata & profiles
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Login tracking & user activity
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Fixed API key sync between WordPress & dashboard
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Enterprise CSRF protection
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Rate limiting (60 requests/minute)
              </li>
            </ul>
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-foreground">Requirements</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Info className="h-3 w-3 text-blue-500" />
                WordPress 5.0+ (tested up to 6.8)
              </li>
              <li className="flex items-center gap-2">
                <Info className="h-3 w-3 text-blue-500" />
                PHP 7.4+ (supports up to 8.2)
              </li>
              <li className="flex items-center gap-2">
                <Info className="h-3 w-3 text-blue-500" />
                Production-ready hosting
              </li>
              <li className="flex items-center gap-2">
                <Info className="h-3 w-3 text-blue-500" />
                Admin access to WordPress site
              </li>
            </ul>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-foreground">Quick Installation</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyInstallInstructions}
              className="h-7 px-2"
            >
              {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[1.2rem]">1.</span>
              Download the Enhanced Users Plugin v3.2.0 (Navigation Enhanced)
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[1.2rem]">2.</span>
              Upload <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">wp-remote-manager-enhanced-users.php</code> to <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">wp-content/plugins/</code>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[1.2rem]">3.</span>
              Activate the plugin in WordPress admin
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[1.2rem]">4.</span>
              Go to Settings → Remote Manager
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[1.2rem]">5.</span>
              Generate new secure API key and add to your AIO Webcare dashboard
            </li>
          </ol>
        </div>

        {/* Download Button */}
        <div className="flex gap-3 pt-2">
          <Button 
            onClick={handleDownload} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            data-testid="button-download-plugin"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Enhanced Plugin (v3.2.0 - Navigation Enhanced)
          </Button>
          
          <Button variant="outline" asChild>
            <a 
              href="https://github.com/updraftplus/updraftplus" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Get UpdraftPlus
            </a>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-muted-foreground">
            <Info className="h-3 w-3 inline mr-1" />
            Enhanced User Metadata Edition with user email support, detailed profiles, and enterprise security. 
            API key sync issue resolved with easy navigation options - supports two-way synchronization between WordPress and dashboard, settings link in plugin list, admin bar menu, and tabbed interface. Now provides user data like ManageWP with CSRF protection, rate limiting, and login tracking.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}