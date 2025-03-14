import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
    // Check if username is "admin" and password is "admin123"
    if (data.username === "admin" && data.password === "admin123") {
      loginMutation.mutate(data);
    } else {
      setLoginError("Invalid administrator credentials");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col lg:flex-row">
      {/* Left side: Auth form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <span className="material-icons text-5xl text-primary">inventory_2</span>
            </div>
            <h1 className="text-2xl font-bold">Inventory Management System</h1>
            <p className="text-neutral-500 mt-2">
              Administrator access only
            </p>
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
                    className="w-full" 
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
      <div className="hidden lg:flex flex-1 bg-primary p-12 text-white items-center justify-center">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-6">
            Streamline Your Inventory Management
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="material-icons mr-3 mt-0.5">check_circle</span>
              <span>Track items with real-time availability</span>
            </li>
            <li className="flex items-start">
              <span className="material-icons mr-3 mt-0.5">check_circle</span>
              <span>Centrally manage item check-ins and check-outs</span>
            </li>
            <li className="flex items-start">
              <span className="material-icons mr-3 mt-0.5">check_circle</span>
              <span>Get alerts for low stock items</span>
            </li>
            <li className="flex items-start">
              <span className="material-icons mr-3 mt-0.5">check_circle</span>
              <span>Assign items to personnel with easy tracking</span>
            </li>
            <li className="flex items-start">
              <span className="material-icons mr-3 mt-0.5">check_circle</span>
              <span>Complete transaction history for all inventory items</span>
            </li>
          </ul>
          <div className="mt-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-white/10">
              <span className="material-icons text-6xl">inventory_2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
