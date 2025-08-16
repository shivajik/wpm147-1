import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { forgotPasswordSchema, type ForgotPasswordUser } from "@shared/schema";
import { Link } from "wouter";
import { ArrowLeft, Mail, Shield, CheckCircle2, Activity, TrendingUp, Globe, Users } from "lucide-react";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordUser>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordUser) => {
      console.log("Making forgot password request to:", "/api/auth/forgot-password");
      console.log("Request data:", data);
      
      try {
        const response = await apiCall("/api/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify(data),
        });
        console.log("Forgot password response:", response);
        return response;
      } catch (error) {
        console.error("API call failed:", error);
        console.error("Error details:", {
          message: (error as any)?.message,
          type: (error as any)?.type,
          errors: (error as any)?.errors
        });
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Forgot password request successful");
      setIsSubmitted(true);
      toast({
        title: "Password reset email sent",
        description: "If an account with that email exists, you'll receive a password reset link.",
      });
    },
    onError: (error: any) => {
      console.error("Forgot password mutation error:", error);
      console.error("Full error object:", error);
      
      let errorMessage = "Something went wrong. Please try again.";
      if (error.message) {
        if (error.message.includes("API endpoint not found")) {
          errorMessage = "Connection issue detected. Please check your internet connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ForgotPasswordUser) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
          <div className="mb-8">
            <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
              Reset Your Password
            </h1>
            <p className="text-xl xl:text-2xl text-blue-100 leading-relaxed">
              Don't worry, it happens to the best of us. Enter your email and we'll send you a link to reset your password.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-200" />
                <span className="text-lg font-semibold">Secure Reset</span>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-purple-200" />
                <span className="text-lg font-semibold">Real-time Updates</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-indigo-200" />
                <span className="text-lg font-semibold">Quick Recovery</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-8 w-8 text-blue-200" />
                <span className="text-lg font-semibold">24/7 Access</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-blue-100">
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-lg">Trusted by 10,000+ WordPress professionals</span>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
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
                {isSubmitted ? "Check Your Email" : "Forgot Password"}
              </CardTitle>
              <CardDescription>
                {isSubmitted 
                  ? "We've sent a password reset link to your email address if an account exists."
                  : "Enter your email address and we'll send you a link to reset your password."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isSubmitted ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="Enter your email"
                                className="pl-10 h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                disabled={forgotPasswordMutation.isPending}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={forgotPasswordMutation.isPending}
                    >
                      {forgotPasswordMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-5 w-5" />
                          <span>Send Reset Link</span>
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
                      Email Sent Successfully
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Check your email for the password reset link. The link will expire in 1 hour.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      form.reset();
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Send Another Email
                  </Button>
                </div>
              )}

              <div className="text-center">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Don't have an account?{" "}
              <Link href="/register">
                <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400">
                  Sign up
                </Button>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}