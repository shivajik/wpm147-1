import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiCall, queryClient } from "@/lib/queryClient";
import { registerSchema, type RegisterUser } from "@shared/schema";
import { Link } from "wouter";
import { SiWordpress } from "react-icons/si";
import { CheckCircle2, ArrowRight, Shield, Users, Zap, Sparkles, Gift, Clock, Star, TrendingUp, Globe, Activity } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterUser>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterUser) => {
      const response = await apiCall("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: async (data) => {
      // Store the token
      localStorage.setItem("auth_token", data.token);
      
      // Set user data in cache immediately to avoid loading state
      queryClient.setQueryData(["/api/auth/user"], data.user);
      
      toast({
        title: "Account created successfully",
        description: "Welcome to your WordPress maintenance dashboard!",
      });
      
      // Immediate redirect - router will handle token-based routing
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      // Enhanced error handling for registration
      let title = "Registration Failed";
      let description = "Please try again";
      
      if (error.type) {
        switch (error.type) {
          case 'EMAIL_ALREADY_EXISTS':
            title = "Email Already Registered";
            description = "An account with this email already exists. Please use a different email or try logging in.";
            break;
          case 'VALIDATION_ERROR':
            title = "Invalid Information";
            description = "Please check all required fields and ensure your email format is correct.";
            break;
          case 'SYSTEM_ERROR':
            title = "System Error";
            description = "An unexpected error occurred during registration. Please try again in a moment.";
            break;
          default:
            description = error.message || "Failed to create account. Please try again.";
        }
      } else {
        description = error.message || "Failed to create account. Please try again.";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterUser) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Left Panel - Benefits */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-yellow-400/50 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-green-400/50 rounded-full animate-ping delay-700"></div>
        <div className="absolute top-2/3 right-1/2 w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-ping delay-1500"></div>
        
        <div className="relative z-10 max-w-md text-center text-white">
          {/* Special Offer Banner */}
          <div className="mb-8 p-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl border border-yellow-400/30 backdrop-blur-sm animate-pulse">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-spin" />
              <span className="text-yellow-400 font-bold text-sm">LIMITED TIME OFFER</span>
              <Sparkles className="h-5 w-5 text-yellow-400 animate-spin" />
            </div>
            <p className="text-sm text-white">Get 3 months FREE when you sign up today!</p>
          </div>

          {/* Main Logo with Animation */}
          <div className="mb-12">
            <div className="relative">
              <div className="w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-float">
                <SiWordpress className="h-12 w-12 text-white" />
              </div>
              {/* Floating celebration icons */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce delay-200">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce delay-500">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div className="absolute top-0 -left-6 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce delay-1000">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
              Join WP ProCare
            </h1>
            <p className="text-xl text-slate-300">Start your WordPress management journey</p>
          </div>

          {/* Enhanced Benefits with Animated Icons */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/40 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform relative">
                <Gift className="h-6 w-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  30-Day Free Trial 
                  <span className="text-yellow-400 text-xs bg-yellow-400/20 px-2 py-1 rounded-full">FREE</span>
                </h3>
                <p className="text-slate-300 text-sm">Full access to all features, no credit card required</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl backdrop-blur-sm border border-blue-400/20 hover:border-blue-400/40 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  Unlimited Sites
                  <span className="text-blue-400 text-xs">∞</span>
                </h3>
                <p className="text-slate-300 text-sm">Manage as many WordPress sites as you need</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl backdrop-blur-sm border border-green-400/20 hover:border-green-400/40 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  Auto-Everything
                  <Clock className="h-3 w-3 text-green-400 animate-spin" />
                </h3>
                <p className="text-slate-300 text-sm">Updates, backups, security scans run automatically</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl backdrop-blur-sm border border-purple-400/20 hover:border-purple-400/40 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  24/7 Monitoring
                  <TrendingUp className="h-3 w-3 text-purple-400" />
                </h3>
                <p className="text-slate-300 text-sm">Real-time performance and security monitoring</p>
              </div>
            </div>
          </div>

          {/* Success Stats */}
          <div className="flex justify-center gap-6 mt-12 pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                <Star className="h-5 w-5 text-yellow-400" />
                4.9
              </div>
              <div className="text-xs text-slate-400">User Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10k+</div>
              <div className="text-xs text-slate-400">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-xs text-slate-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-8 relative">
            {/* Mobile Logo with Special Offer */}
            <div className="lg:hidden mb-6">
              <div className="relative">
                <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                  <SiWordpress className="h-10 w-10 text-white" />
                </div>
                {/* Special offer badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <Gift className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              </div>
              {/* Mobile special offer */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center gap-2 text-orange-600">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold">3 Months FREE - Limited Time!</span>
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute top-4 right-8 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 left-12 w-1 h-1 bg-green-400 rounded-full animate-ping delay-500"></div>
            
            <Badge variant="outline" className="mx-auto bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700">
              <Gift className="w-3 h-3 mr-1" />
              Get Started Today
            </Badge>
            <CardTitle className="text-3xl font-bold gradient-text">Create Account</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Join thousands of WordPress professionals
            </CardDescription>
            
            {/* Benefits Preview */}
            <div className="flex justify-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                <Gift className="w-3 h-3" />
                <span>3 Months Free</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                <span>30s Setup</span>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a strong password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}