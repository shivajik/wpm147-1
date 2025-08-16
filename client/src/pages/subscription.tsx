import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Star, Zap, Shield, TrendingUp, Crown } from "lucide-react";
import type { SubscriptionPlan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Subscription() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch subscription plans
  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
  });

  // Fetch current user subscription
  const { data: currentSubscription, isLoading: isLoadingSubscription } = useQuery<{
    subscriptionPlan: string;
    subscriptionStatus: string;
    subscriptionEndsAt: string | null;
  }>({
    queryKey: ['/api/user/subscription'],
  });

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: async ({ planName, billingPeriod }: { planName: string; billingPeriod: 'monthly' | 'yearly' }) => {
      const response = await fetch('/api/upgrade-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ planName, billingPeriod }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upgrade subscription');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/subscription'] });
      toast({
        title: "Subscription Upgraded",
        description: "Your subscription has been successfully upgraded!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Choose Your Plan
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
          {Array.isArray(plans) && plans.map((plan) => {
            const isPopular = plan.name === 'protect';
            const isCurrentPlan = currentSubscription?.subscriptionPlan === plan.name;
            const currentPrice = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const savings = billingPeriod === 'yearly' ? getYearlySavings(plan.monthlyPrice, plan.yearlyPrice) : 0;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  isCurrentPlan 
                    ? 'border-2 border-blue-500 shadow-lg' 
                    : isPopular 
                      ? 'border-2 border-green-500 shadow-lg' 
                      : 'border border-border/50'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 text-sm font-semibold flex items-center justify-center gap-2">
                    <Crown className="h-4 w-4" />
                    Current Plan
                  </div>
                )}
                {!isCurrentPlan && isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={`text-center ${(isCurrentPlan || isPopular) ? 'pt-12' : 'pt-8'}`}>
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
                      isCurrentPlan
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                        : plan.name === 'free' 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                          : `bg-gradient-to-r ${getPlanGradient(plan.name)}`
                    } hover:shadow-lg transition-all duration-300`}
                    size="lg"
                    disabled={isCurrentPlan || upgradeMutation.isPending}
                    onClick={() => {
                      if (!isCurrentPlan) {
                        if (plan.name === 'free') {
                          // For free plan, just update the user's subscription
                          upgradeMutation.mutate({ planName: 'free', billingPeriod: 'monthly' });
                        } else {
                          upgradeMutation.mutate({ planName: plan.name, billingPeriod });
                        }
                      }
                    }}
                  >
                    {upgradeMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Processing...
                      </div>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : plan.name === 'free' ? (
                      'Start Free'
                    ) : (
                      'Upgrade'
                    )}
                  </Button>

                  <div className="space-y-3">
                    {Array.isArray(plan.features) && (plan.features as string[]).map((feature, index) => (
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

        {/* FAQ or Additional Info */}
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
    </AppLayout>
  );
}