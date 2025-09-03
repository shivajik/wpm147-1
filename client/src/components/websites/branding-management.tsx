import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Crown, Upload, Palette, Globe, Type, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";

interface BrandingData {
  whiteLabelEnabled: boolean;
  brandName?: string;
  brandLogo?: string;
  brandColor?: string;
  brandWebsite?: string;
  footerText?: string;
}

interface BrandingManagementProps {
  websiteId: number;
}

export default function BrandingManagement({ websiteId }: BrandingManagementProps) {
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
  const { data: subscription } = useQuery({
    queryKey: ['/api/user/subscription'],
  });

  // Get website branding data
  const { data: brandingData, isLoading } = useQuery({
    queryKey: [`/api/websites/${websiteId}/branding`],
    enabled: !!websiteId,
  });

  // Update branding mutation
  const updateBrandingMutation = useMutation({
    mutationFn: async (data: BrandingData) => {
      return await apiCall(`/api/websites/${websiteId}/branding`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Branding Updated",
        description: "Your white-label branding has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/branding`] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      if (error.code === 'UPGRADE_REQUIRED') {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            White-Label Branding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          White-Label Branding
          {!isPaidUser && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Pro Feature
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Customize your reports with your own branding - logo, colors, and company information.
          {!isPaidUser && " Available with paid subscription plans."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isPaidUser ? (
          <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">Upgrade to Add Your Branding</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  White-label your reports with your company logo, colors, and custom footer text. 
                  Available with maintain, protect, and perform plans.
                </p>
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
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.whiteLabelEnabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, whiteLabelEnabled: checked }))
                }
              />
              <Label>Enable White-Label Branding</Label>
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

            <Separator />

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateBrandingMutation.isPending}>
                {updateBrandingMutation.isPending ? "Saving..." : "Save Branding"}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}