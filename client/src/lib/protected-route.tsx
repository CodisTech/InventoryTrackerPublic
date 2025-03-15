import { useAuth, Permission } from "@/hooks/use-auth";
import { Loader2, ShieldAlert } from "lucide-react";
import { Redirect, Route } from "wouter";
import { USER_ROLES } from "@shared/schema";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  requiredPermission?: Permission;
  requiredRole?: string;
}

export function ProtectedRoute({
  path,
  component: Component,
  requiredPermission,
  requiredRole
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check required role if specified
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You need {requiredRole === USER_ROLES.SUPER_ADMIN ? "super admin" : "admin"} privileges to access this page.
          </p>
        </div>
      </Route>
    );
  }

  // Check required permission if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </Route>
    );
  }

  // If all checks pass, render the component
  return <Route path={path} component={Component} />;
}
