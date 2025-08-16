import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { resetPasswordSchema, type ResetPasswordUser } from "@shared/schema";
import { Link } from "wouter";
import { Eye, EyeOff, Lock, Shield, CheckCircle2, Activity, TrendingUp, Globe, Users, AlertTriangle } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get token from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    setToken(resetToken);
  }, []);

  const form = useForm<ResetPasswordUser>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      password: "",
    },
  });

  // Set token in form when it's available
  useEffect(() => {
    if (token) {
      form.setValue('token', token);
    }
  }, [token, form]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordUser) => {
      const response = await apiCall("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
    },
    onError: (error: any) => {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResetPasswordUser) => {
    resetPasswordMutation.mutate(data);
  };

  // If no token, show error
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              The password reset link is missing or invalid.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/forgot-password">
              <Button className="w-full">
                Request New Reset Link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
          <div className="mb-8">
            <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
              Set Your New Password
            </h1>
            <p className="text-xl xl:text-2xl text-blue-100 leading-relaxed">
              You're almost done! Create a strong new password for your account.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-green-200" />
                <span className="text-lg font-semibold">Secure Account</span>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-blue-200" />
                <span className="text-lg font-semibold">Real-time Monitoring</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-purple-200" />
                <span className="text-lg font-semibold">Performance Insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-8 w-8 text-green-200" />
                <span className="text-lg font-semibold">Global Access</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-blue-100">
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-lg">Your security is our top priority</span>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-green-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              AIO Webcare
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              WordPress Management Platform
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold">
                {isSuccess ? "Password Reset Complete" : "Reset Your Password"}
              </CardTitle>
              <CardDescription>
                {isSuccess
                  ? "Your password has been successfully reset."
                  : "Enter your new password below. Make it strong and secure."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isSuccess ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your new password"
                                className="pl-10 pr-12 h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                disabled={resetPasswordMutation.isPending}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={resetPasswordMutation.isPending}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Password must be at least 6 characters long
                          </p>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Resetting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5" />
                          <span>Reset Password</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Password Updated Successfully
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      You can now log in with your new password.
                    </p>
                  </div>
                  <Link href="/login">
                    <Button className="w-full">
                      Continue to Login
                    </Button>
                  </Link>
                </div>
              )}

              {!isSuccess && (
                <div className="text-center">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Back to Login
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Remember your password?{" "}
              <Link href="/login">
                <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400">
                  Sign in
                </Button>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}