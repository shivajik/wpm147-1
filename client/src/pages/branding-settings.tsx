import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Crown, Upload, Palette, Globe, Type, FileText, Save, Edit, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import AppLayout from "@/components/layout/app-layout";

interface BrandingData {
  whiteLabelEnabled: boolean;
  brandName?: string;
  brandLogo?: string;
  brandColor?: string;
  brandWebsite?: string;
  footerText?: string;
}

interface WhiteLabelResponse {
  whiteLabelEnabled: boolean;
  brandName?: string;
  brandLogo?: string;
  brandColor?: string;
  brandWebsite?: string;
  brandingData?: {
    footerText?: string;
  };
  canCustomize?: boolean;
}

interface UserSubscription {
  subscriptionPlan: string;
  subscriptionStatus: string;
}

export default function BrandingSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<BrandingData>({
    whiteLabelEnabled: false,
    brandName: "",
    brandLogo: "",
    brandColor: "#1e40af",
    brandWebsite: "",
    footerText: ""
  });

  // Check user subscription
  const { data: subscription } = useQuery<UserSubscription>({
    queryKey: ['/api/user/subscription'],
  });

  // Get all websites to apply branding to
  const { data: websites = [] } = useQuery<any[]>({
    queryKey: ['/api/websites'],
  });

  // Get branding data from the first website (global branding concept)
  const firstWebsiteId = websites.length > 0 ? websites[0].id : null;
  
  const { data: brandingResponse, isLoading } = useQuery<WhiteLabelResponse>({
    queryKey: [`/api/websites/${firstWebsiteId}/white-label`],
    enabled: !!firstWebsiteId,
  });

  // Transform the API response to match our UI data format
  const brandingData: BrandingData | undefined = brandingResponse ? {
    whiteLabelEnabled: brandingResponse.whiteLabelEnabled || false,
    brandName: brandingResponse.brandName,
    brandLogo: brandingResponse.brandLogo,
    brandColor: brandingResponse.brandColor,
    brandWebsite: brandingResponse.brandWebsite,
    footerText: brandingResponse.brandingData?.footerText
  } : undefined;

  // Update branding mutation
  const updateBrandingMutation = useMutation({
    mutationFn: async (data: BrandingData) => {
      if (!firstWebsiteId) {
        throw new Error("No website found to apply branding to");
      }

      // Transform data to match white-label API format
      const requestData = {
        whiteLabelEnabled: data.whiteLabelEnabled,
        brandName: data.brandName,
        brandLogo: data.brandLogo,
        brandColor: data.brandColor,
        brandWebsite: data.brandWebsite,
        brandingData: {
          footerText: data.footerText
        }
      };
      
      const response = await apiCall(`/api/websites/${firstWebsiteId}/white-label`, {
        method: "POST",
        body: JSON.stringify(requestData),
      });
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Branding Updated",
        description: "Your white-label branding has been updated successfully. Changes will appear in all future reports.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${firstWebsiteId}/white-label`] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      if (error.message?.includes('SUBSCRIPTION_REQUIRED')) {
        toast({
          title: "Upgrade Required",
          description: "White-label branding is only available for paid subscription plans. Please upgrade to customize your branding.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update branding settings",
          variant: "destructive",
        });
      }
    },
  });

  const isPaidUser = subscription?.subscriptionPlan && subscription.subscriptionPlan !== 'free';
  const hasExistingBranding = brandingData?.whiteLabelEnabled && brandingData?.brandName;

  const handleEdit = () => {
    setFormData({
      whiteLabelEnabled: brandingData?.whiteLabelEnabled || false,
      brandName: brandingData?.brandName || "",
      brandLogo: brandingData?.brandLogo || "",
      brandColor: brandingData?.brandColor || "#1e40af",
      brandWebsite: brandingData?.brandWebsite || "",
      footerText: brandingData?.footerText || ""
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateBrandingMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">White-Label Branding</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Customize your reports with your own branding
            </p>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            White-Label Branding
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Customize your reports with your own company branding - logo, colors, and footer text.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Brand Customization
              {!isPaidUser && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Pro Feature
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Customize how your reports appear to clients with your own branding.
              {!isPaidUser && " Available with paid subscription plans."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!isPaidUser ? (
              <div className="border border-yellow-200 bg-yellow-50 p-6 rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6 text-yellow-600" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Upgrade to Add Your Branding</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      White-label your reports with your company logo, colors, and custom footer text. 
                      Available with maintain, protect, and perform plans.
                    </p>
                    <Button 
                      className="mt-3" 
                      onClick={() => window.location.href = '/pricing'}
                    >
                      View Pricing Plans
                    </Button>
                  </div>
                </div>
              </div>
            ) : !isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={brandingData?.whiteLabelEnabled || false}
                      disabled={!isPaidUser}
                    />
                    <Label>Enable White-Label Branding</Label>
                  </div>
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    {hasExistingBranding ? "Edit Branding" : "Setup Branding"}
                  </Button>
                </div>

                {hasExistingBranding && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Brand Name</Label>
                        <p className="text-sm text-gray-600">{brandingData?.brandName || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Brand Color</Label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: brandingData?.brandColor || "#1e40af" }}
                          />
                          <p className="text-sm text-gray-600">{brandingData?.brandColor || "#1e40af"}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Website</Label>
                        <p className="text-sm text-gray-600">{brandingData?.brandWebsite || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Logo URL</Label>
                        <p className="text-sm text-gray-600 break-all">
                          {brandingData?.brandLogo ? brandingData.brandLogo.substring(0, 50) + "..." : "Not set"}
                        </p>
                      </div>
                    </div>
                    {brandingData?.footerText && (
                      <div>
                        <Label className="text-sm font-medium">Footer Text</Label>
                        <p className="text-sm text-gray-600">{brandingData.footerText}</p>
                      </div>
                    )}
                  </div>
                )}

                {!hasExistingBranding && brandingData && (
                  <div className="text-center py-8 text-gray-500">
                    <Palette className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No custom branding configured yet.</p>
                    <p className="text-sm">Reports will use default AIO Webcare branding.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.whiteLabelEnabled}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, whiteLabelEnabled: checked }))
                      }
                    />
                    <Label>Enable White-Label Branding</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={updateBrandingMutation.isPending} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      {updateBrandingMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brandName" className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Brand Name *
                    </Label>
                    <Input
                      id="brandName"
                      value={formData.brandName}
                      onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                      placeholder="Your Company Name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandLogo" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Logo URL
                    </Label>
                    <Input
                      id="brandLogo"
                      value={formData.brandLogo}
                      onChange={(e) => setFormData(prev => ({ ...prev, brandLogo: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                      type="url"
                    />
                    <p className="text-xs text-gray-500">
                      Provide a direct URL to your logo image (PNG, JPG, SVG). Recommended size: 200x60 pixels.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandColor" className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Brand Color
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="brandColor"
                        type="color"
                        value={formData.brandColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.brandColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                        placeholder="#1e40af"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandWebsite" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website URL
                    </Label>
                    <Input
                      id="brandWebsite"
                      value={formData.brandWebsite}
                      onChange={(e) => setFormData(prev => ({ ...prev, brandWebsite: e.target.value }))}
                      placeholder="https://yourcompany.com"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footerText" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Footer Text
                    </Label>
                    <Textarea
                      id="footerText"
                      value={formData.footerText}
                      onChange={(e) => setFormData(prev => ({ ...prev, footerText: e.target.value }))}
                      placeholder="Powered by Your Company - Professional WordPress Management"
                      maxLength={500}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      This text will appear in the footer of your reports. Maximum 500 characters.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Section */}
        {isPaidUser && hasExistingBranding && (
          <Card>
            <CardHeader>
              <CardTitle>Branding Preview</CardTitle>
              <CardDescription>
                Here's how your branding will appear in reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 rounded-lg text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30">
                    {brandingData?.brandLogo ? (
                      <img src={brandingData.brandLogo} alt="Brand Logo" className="w-8 h-8 object-contain" />
                    ) : (
                      <Crown className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{brandingData?.brandName || "Your Brand"}</h3>
                    <p className="text-blue-200 text-sm">Professional WordPress Management</p>
                  </div>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <p className="text-sm text-white/70">
                    {brandingData?.footerText || "Powered by Your Brand - Professional WordPress Management"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}