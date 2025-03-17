import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { 
  insertUserSchema, 
  User as SelectUser, 
  InsertUser, 
  USER_ROLES,
  UserRole
} from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Permission levels for different user actions
export enum Permission {
  // View-only permissions
  VIEW_INVENTORY = "view_inventory",
  VIEW_TRANSACTIONS = "view_transactions",
  VIEW_CHECKED_OUT = "view_checked_out",
  
  // Standard user permissions
  CHECK_IN_OUT_ITEMS = "check_in_out_items",
  
  // Admin permissions
  MANAGE_INVENTORY = "manage_inventory",
  MANAGE_PERSONNEL = "manage_personnel",
  VIEW_REPORTS = "view_reports",
  
  // Super admin permissions
  MANAGE_ADMINS = "manage_admins",
  TRANSFER_OWNERSHIP = "transfer_ownership"
}

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  activeRole: UserRole | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  switchRoleMutation: UseMutationResult<void, Error, UserRole>;
  hasPermission: (permission: Permission) => boolean;
  getUserRole: () => UserRole | null;
  getHighestRole: () => UserRole | null;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Initialize active role when user data changes
  useEffect(() => {
    if (user && !activeRole) {
      setActiveRole(user.role as UserRole);
    }
  }, [user, activeRole]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", { data: credentials });
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      setActiveRole(user.role as UserRole);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", { data: credentials });
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      setActiveRole(user.role as UserRole);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      setActiveRole(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Switch role mutation - this just updates the activeRole state locally
  // since we're doing client-side role switching without server updates
  const switchRoleMutation = useMutation({
    mutationFn: async (newRole: UserRole) => {
      // We're not actually making a server request here,
      // but we'll keep the async pattern for consistency
      return Promise.resolve();
    },
    onSuccess: (_, newRole) => {
      setActiveRole(newRole);
      
      // Invalidate relevant queries that might depend on user permissions
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      // No need to invalidate user data since the actual user record isn't changing
    }
  });

  // Check if user has the specified permission based on their active role
  const hasPermission = (permission: Permission): boolean => {
    if (!user || !activeRole) return false;
    
    // Define permission mapping by role
    const rolePermissions = {
      [USER_ROLES.STANDARD_USER]: [
        Permission.VIEW_INVENTORY,
        Permission.VIEW_TRANSACTIONS,
        Permission.VIEW_CHECKED_OUT,
        Permission.CHECK_IN_OUT_ITEMS,
      ],
      [USER_ROLES.ADMIN]: [
        Permission.VIEW_INVENTORY,
        Permission.VIEW_TRANSACTIONS,
        Permission.VIEW_CHECKED_OUT,
        Permission.CHECK_IN_OUT_ITEMS,
        Permission.MANAGE_INVENTORY, 
        Permission.MANAGE_PERSONNEL,
        Permission.VIEW_REPORTS,
      ],
      [USER_ROLES.SUPER_ADMIN]: [
        Permission.VIEW_INVENTORY,
        Permission.VIEW_TRANSACTIONS,
        Permission.VIEW_CHECKED_OUT,
        Permission.CHECK_IN_OUT_ITEMS,
        Permission.MANAGE_INVENTORY, 
        Permission.MANAGE_PERSONNEL,
        Permission.VIEW_REPORTS,
        Permission.MANAGE_ADMINS,
        Permission.TRANSFER_OWNERSHIP,
      ],
    };

    // Get permissions for the active role (not the user's actual role)
    const userPermissions = rolePermissions[activeRole] || [];
    
    return userPermissions.includes(permission);
  };
  
  // Get the current active role or null if not logged in
  const getUserRole = (): UserRole | null => {
    return activeRole;
  };
  
  // Get the highest role the user has access to
  const getHighestRole = (): UserRole | null => {
    if (!user) return null;
    return user.role as UserRole;
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        activeRole,
        loginMutation,
        logoutMutation,
        registerMutation,
        switchRoleMutation,
        hasPermission,
        getUserRole,
        getHighestRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
