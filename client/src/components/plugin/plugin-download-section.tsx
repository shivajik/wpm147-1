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
    // Download the WP Remote Manager plugin
    const link = document.createElement('a');
    link.href = '/wp-remote-manager-plugin.zip';
    link.download = 'wp-remote-manager-plugin.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "WP Remote Manager plugin is being downloaded.",
    });
  };

  const handleCopyInstallInstructions = () => {
    const instructions = `1. Download Plugin
2. Goto Plugin and upload
3. Activate
4. Go to Settings → Remote Manager and Generate new secure API key and add to your AIO Webcare dashboard`;

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
              <CardTitle className="text-lg">WP Remote Manager</CardTitle>
              <p className="text-sm text-muted-foreground">
                WordPress Remote Management Plugin
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Latest Version
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">

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
              Download Plugin
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[1.2rem]">2.</span>
              Goto Plugin and upload
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[1.2rem]">3.</span>
              Activate
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[1.2rem]">4.</span>
              Go to Settings → Remote Manager and Generate new secure API key and add to your AIO Webcare dashboard
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
            Download Plugin
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}