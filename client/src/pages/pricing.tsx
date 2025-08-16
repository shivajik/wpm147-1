import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Shield,
  Rocket,
  Crown,
  Star,
  Sparkles,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { SiWordpress } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";

type SubscriptionPlan = {
  id: number;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isActive: boolean;
};

export default function Pricing() {
  const { data: subscriptionPlans, isLoading, error } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (error || !subscriptionPlans) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-slate-600">Failed to load pricing plans. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Transform database plans to display format
  const plans = subscriptionPlans.map(plan => {
    const iconMap: Record<string, React.ReactNode> = {
      'free': <Zap className="w-6 h-6" />,
      'maintain': <Shield className="w-6 h-6" />,
      'protect': <Rocket className="w-6 h-6" />,
      'perform': <Crown className="w-6 h-6" />
    };

    const badgeMap: Record<string, string | null> = {
      'free': null,
      'maintain': 'Most Popular',
      'protect': null,
      'perform': 'Enterprise'
    };

    const ctaMap: Record<string, string> = {
      'free': 'Get Started Free',
      'maintain': 'Start Free Trial',
      'protect': 'Start Free Trial',
      'perform': 'Contact Sales'
    };

    return {
      name: plan.displayName,
      price: plan.monthlyPrice === 0 ? '$0' : `$${(plan.monthlyPrice / 100).toFixed(0)}`,
      period: plan.monthlyPrice === 0 ? 'forever' : 'per website/month',
      description: plan.description || `${plan.displayName} plan features`,
      badge: badgeMap[plan.name],
      features: Array.isArray(plan.features) ? plan.features : [],
      cta: ctaMap[plan.name] || 'Get Started',
      popular: plan.name === 'maintain',
      icon: iconMap[plan.name] || <Star className="w-6 h-6" />
    };
  });


  const faqs = [
    {
      question: "How does the free plan work?",
      answer: "Our free plan includes unlimited websites, basic management tools, and monthly backups. No credit card required, no time limits."
    },
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated."
    },
    {
      question: "What happens if I exceed my limits?",
      answer: "We'll notify you before you reach your limits and help you choose the right plan. No surprise charges or service interruptions."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked."
    },
    {
      question: "Is there a setup fee?",
      answer: "No setup fees, no termination penalties, and no long-term contracts. Monthly payment cycles with transparent pricing."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="bg-white/95 border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                  <SiWordpress className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900">AIO Webcare</h1>
                <p className="text-sm text-slate-600 font-medium hidden sm:block">Professional WordPress Management</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Home</a>
              <a href="/features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Features</a>
              <a href="/pricing" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Pricing</a>

              <a href="/contact" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Contact</a>
            </nav>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild className="hidden sm:flex bg-white/90 border-slate-300">
                <a href="/login">Sign In</a>
              </Button>
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                <a href="/register">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
            Transparent pricing
          </Badge>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Simple, Transparent
            <span className="block text-blue-600">Pricing</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Monthly payment cycle, no setup fee, no termination penalties or long term contracts. 
            Choose the plan that fits your needs and scale as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative group hover:shadow-xl transition-all duration-300 ${
                plan.popular 
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg scale-105' 
                  : 'border-slate-200 hover:border-blue-300'
              } bg-white/80 backdrop-blur-sm`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1 shadow-lg">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-6 pt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {plan.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      {plan.name}
                    </CardTitle>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-600 ml-2">/{plan.period}</span>
                    </div>
                  </div>
                  
                  <CardDescription className="text-slate-600">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    } shadow-lg`}
                    asChild
                  >
                    <a href={plan.name === "Perform" ? "/contact" : "/register"}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600">
              Get answers to common questions about our pricing and plans
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed ml-11">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of WordPress professionals who trust AIO Webcare for their website management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl">
              <a href="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600">
              <Star className="mr-2 h-5 w-5" />
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <SiWordpress className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AIO Webcare</h3>
                  <p className="text-slate-400">Professional WordPress Management</p>
                </div>
              </div>
              <p className="text-slate-400 max-w-md">
                The comprehensive WordPress maintenance platform trusted by professionals worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-400">© 2025 AIO Webcare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}