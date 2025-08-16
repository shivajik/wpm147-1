import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Star, Zap, Shield, TrendingUp } from "lucide-react";

// Mock data for preview
const mockPlans = [
  {
    id: 1,
    name: "free",
    displayName: "Free",
    description: "Get Started with Basic Monitoring",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Basic uptime monitoring",
      "Monthly WordPress updates",
      "Email support",
      "1 website monitoring",
      "Basic analytics dashboard"
    ]
  },
  {
    id: 2,
    name: "maintain",
    displayName: "Maintain",
    description: "Standard Site Maintenance",
    monthlyPrice: 2999,
    yearlyPrice: 29999,
    features: [
      "Weekly WordPress updates",
      "24/7 emergency support",
      "24/7 uptime monitoring",
      "Google Analytics integration",
      "Cloud backups (4x daily)"
    ]
  },
  {
    id: 3,
    name: "protect",
    displayName: "Protect",
    description: "Sites Needing Edits and Security",
    monthlyPrice: 4999,
    yearlyPrice: 49999,
    features: [
      "All features from Maintain",
      "24/7 unlimited website edits",
      "Security optimization",
      "Malware scanning & removal",
      "SSL certificate management",
      "WordPress firewall protection"
    ]
  },
  {
    id: 4,
    name: "perform",
    displayName: "Perform",
    description: "Advanced Functionality Sites",
    monthlyPrice: 7999,
    yearlyPrice: 79999,
    features: [
      "All features from Protect",
      "Speed optimization",
      "Mobile optimization",
      "Image optimization",
      "Complete malware removal",
      "Performance monitoring",
      "SEO optimization",
      "Advanced analytics"
    ]
  }
];

export default function SubscriptionPreview() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free':
        return <TrendingUp className="h-8 w-8 text-gray-500" />;
      case 'maintain':
        return <Star className="h-8 w-8 text-blue-500" />;
      case 'protect':
        return <Shield className="h-8 w-8 text-green-500" />;
      case 'perform':
        return <Zap className="h-8 w-8 text-purple-500" />;
      default:
        return <TrendingUp className="h-8 w-8 text-gray-500" />;
    }
  };

  const getPlanGradient = (planName: string) => {
    switch (planName) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'maintain':
        return 'from-blue-500 to-blue-600';
      case 'protect':
        return 'from-green-500 to-green-600';
      case 'perform':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getYearlySavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyCost = (monthlyPrice * 12) / 100;
    const yearlyCost = yearlyPrice / 100;
    const savings = monthlyCost - yearlyCost;
    return Math.round(savings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            WordPress Maintenance Plans
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect maintenance plan for your WordPress websites. 
            All plans include 24/7 support and monitoring.
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-8">
          <Tabs value={billingPeriod} onValueChange={(value) => setBillingPeriod(value as 'monthly' | 'yearly')} className="w-fit">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="monthly" className="px-8">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="px-8 relative">
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">Save up to $160</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {Array.isArray(mockPlans) && mockPlans.map((plan) => {
            const isPopular = plan.name === 'protect';
            const currentPrice = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const savings = billingPeriod === 'yearly' ? getYearlySavings(plan.monthlyPrice, plan.yearlyPrice) : 0;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  isPopular ? 'border-2 border-green-500 shadow-lg' : 'border border-border/50'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={`text-center ${isPopular ? 'pt-12' : 'pt-8'}`}>
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.displayName}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      {plan.name === 'free' ? (
                        <span className="text-4xl font-bold text-green-600">Free</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">${formatPrice(currentPrice)}</span>
                          <span className="text-muted-foreground ml-2">
                            /{billingPeriod === 'monthly' ? 'month' : 'year'}
                          </span>
                        </>
                      )}
                    </div>
                    {billingPeriod === 'yearly' && savings > 0 && plan.name !== 'free' && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Save ${savings}/year
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-8">
                  <Button 
                    className={`w-full mb-6 ${
                      plan.name === 'free' 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                        : `bg-gradient-to-r ${getPlanGradient(plan.name)}`
                    } hover:shadow-lg transition-all duration-300`}
                    size="lg"
                  >
                    {plan.name === 'free' ? 'Start Free' : 'Get Started'}
                  </Button>

                  <div className="space-y-3">
                    {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6">Not sure which plan is right for you?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with our Maintain plan for basic WordPress management, then easily upgrade 
            when you need more advanced features like security optimization or performance tuning.
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}