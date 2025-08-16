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
import { loginSchema, type LoginUser } from "@shared/schema";
import { Link } from "wouter";
import { SiWordpress } from "react-icons/si";
import { Eye, EyeOff, ArrowRight, Shield, Lock, Zap, Activity, TrendingUp, CheckCircle2, Globe, Users, RefreshCw } from "lucide-react";


export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);


  const form = useForm<LoginUser>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      const response = await apiCall("/api/auth/login", {
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
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Store a flag to trigger auto-sync on dashboard
      localStorage.setItem("trigger_auto_sync", "true");
      
      // Immediately redirect to dashboard
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      // Debug logging to understand error structure
      console.log('Login error caught:', error);
      console.log('Error type:', error.type);
      console.log('Error message:', error.message);
      
      // Enhanced error handling with specific user-friendly messages
      let title = "Login Failed";
      let description = "Please try again";
      
      if (error.type) {
        switch (error.type) {
          case 'USER_NOT_FOUND':
            title = "Account Not Found";
            description = "No account found with this email address. Please check your email or create a new account.";
            break;
          case 'INVALID_PASSWORD':
            title = "Incorrect Password";
            description = "The password you entered is incorrect. Please try again or reset your password.";
            break;
          case 'VALIDATION_ERROR':
            title = "Invalid Input";
            description = "Please check your email and password format.";
            break;
          case 'SYSTEM_ERROR':
            title = "System Error";
            description = "An unexpected error occurred. Please try again in a moment.";
            break;
          default:
            description = error.message || "Please check your credentials and try again.";
        }
      } else {
        description = error.message || "Please check your credentials and try again.";
      }
      
      console.log('Showing toast with:', { title, description });
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginUser) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
        <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white/30 rounded-full animate-ping delay-500"></div>
        
        <div className="relative z-10 max-w-md text-center text-white">
          {/* Main Logo with Animation */}
          <div className="mb-12">
            <div className="relative">
              <div className="w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-float">
                <SiWordpress className="h-12 w-12 text-white" />
              </div>
              {/* Floating icons around the main logo */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce delay-300">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce delay-700">
                <Shield className="h-4 w-4 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              AIO Webcare
            </h1>
            <p className="text-xl text-slate-300">Professional WordPress Management Platform</p>
          </div>

          {/* Feature Benefits with Icons */}
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Advanced Security</h3>
                <p className="text-slate-300 text-sm">24/7 malware detection & protection</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Automated Tasks</h3>
                <p className="text-slate-300 text-sm">Updates, backups & maintenance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Real-time Analytics</h3>
                <p className="text-slate-300 text-sm">Performance monitoring & insights</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex justify-center gap-8 mt-12 pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10k+</div>
              <div className="text-xs text-slate-400">Sites Protected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-xs text-slate-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-xs text-slate-400">Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-8 relative">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-6">
              <div className="relative">
                <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                  <SiWordpress className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
            
            <Badge variant="outline" className="mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <Lock className="w-3 h-3 mr-1" />
              Welcome Back
            </Badge>
            <CardTitle className="text-3xl font-bold gradient-text">Sign In</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Access your WordPress maintenance dashboard
            </CardDescription>
            
            {/* Trust Indicators */}
            <div className="flex justify-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Shield className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Users className="w-3 h-3" />
                <span>500+ Users</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <TrendingUp className="w-3 h-3" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
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
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
          
          {/* Demo Login Button */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button"
              variant="outline"
              className="w-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 text-blue-700 font-medium"
              disabled={loginMutation.isPending}
              onClick={() => {
                // Fill in demo credentials
                form.setValue("email", "demo@wpmaintenance.com");
                form.setValue("password", "demo123");
                // Submit the form with demo credentials
                const demoData = {
                  email: "demo@wpmaintenance.com",
                  password: "demo123"
                };
                loginMutation.mutate(demoData);
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              {loginMutation.isPending ? "Logging in..." : "Quick Demo Login"}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Use demo account to explore the platform
            </p>
          </div>
          <div className="text-center mt-4">
            <Link href="/forgot-password">
              <Button variant="link" className="p-0 h-auto text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                Forgot your password?
              </Button>
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}