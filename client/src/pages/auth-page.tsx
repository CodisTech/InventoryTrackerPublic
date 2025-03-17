import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { VersionIndicator } from "@/components/layout/version-indicator";
import inventoryLogoLight from "../assets/images/inventory-logo-light.svg";
import inventoryLogoDark from "../assets/images/inventory-logo-dark.svg";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    setLoginError(null);
    loginMutation.mutate(data, {
      onError: (error) => {
        setLoginError(error.message || "Invalid administrator credentials");
      }
    });
  };

  const { repoType } = useFeatureFlags();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col lg:flex-row">
      {/* Left side: Auth form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <img src={inventoryLogoLight} alt="Inventory Management" className="w-48 h-48" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold">Inventory Management System</h1>
              <span 
                className={`
                  inline-block text-xs font-bold text-white px-2 py-0.5 rounded
                  ${repoType === 'private' ? 'bg-red-600' : 
                  repoType === 'public' ? 'bg-green-600' : 'bg-amber-500'}
                `}
              >
                {repoType.toUpperCase()}
              </span>
            </div>
            <p className="text-neutral-500 mt-2">
              Administrator access only
            </p>
            
            <div className="mt-2 flex justify-center">
              <VersionIndicator />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Administrator Login</CardTitle>
              <CardDescription>
                Enter your credentials to access the inventory management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your username" 
                            {...field} 
                            autoComplete="username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            {...field} 
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {loginError && (
                    <div className="text-destructive text-sm font-medium">{loginError}</div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-black hover:bg-black/80 text-white" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login as Administrator"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Use admin/admin123 for login
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Right side: Hero content */}
      <div className="hidden lg:flex flex-1 bg-black p-12 text-white items-center justify-center">
        <div className="max-w-md">
          <div className="mb-6 flex justify-center">
            <img src={inventoryLogoDark} alt="Inventory Management" className="w-52 h-52" />
          </div>
          <h2 className="text-3xl font-bold mb-6 text-center">
            Inventory Management System
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-3 mt-0.5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Track items with real-time availability</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-3 mt-0.5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Centrally manage item check-ins and check-outs</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-3 mt-0.5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Get alerts for low stock items</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-3 mt-0.5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Assign items to personnel with easy tracking</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-3 mt-0.5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Complete transaction history for all inventory items</span>
            </li>
          </ul>
          <div className="mt-8 text-center">
            <p className="text-sm text-white/70">
              © Inventory Management System 2020-{new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
