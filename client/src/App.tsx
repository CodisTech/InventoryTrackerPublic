import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import InventoryPage from "@/pages/inventory-page";
import TransactionsPage from "@/pages/transactions-page";
import UsersPage from "@/pages/users-page";
import ReportsPage from "@/pages/reports-page";
import CheckedOutPage from "@/pages/checked-out-page";
import AdminManagementPage from "@/pages/admin-management-page";
import AdminActivityPage from "@/pages/admin-activity-page";
import AdminTransferPage from "@/pages/admin-transfer-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider, Permission } from "./hooks/use-auth";
import AppLayout from "./components/layout/app-layout";
import { USER_ROLES } from "@shared/schema";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute 
        path="/" 
        component={() => (
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        )}
        requiredPermission={Permission.VIEW_INVENTORY}
      />
      <ProtectedRoute 
        path="/inventory" 
        component={() => (
          <AppLayout>
            <InventoryPage />
          </AppLayout>
        )}
        requiredPermission={Permission.VIEW_INVENTORY}
      />
      <ProtectedRoute 
        path="/transactions" 
        component={() => (
          <AppLayout>
            <TransactionsPage />
          </AppLayout>
        )}
        requiredPermission={Permission.VIEW_TRANSACTIONS}
      />
      <ProtectedRoute 
        path="/users" 
        component={() => (
          <AppLayout>
            <UsersPage />
          </AppLayout>
        )}
        requiredPermission={Permission.MANAGE_PERSONNEL}
      />
      <ProtectedRoute 
        path="/reports" 
        component={() => (
          <AppLayout>
            <ReportsPage />
          </AppLayout>
        )}
        requiredPermission={Permission.VIEW_REPORTS}
      />
      <ProtectedRoute 
        path="/checked-out" 
        component={() => (
          <AppLayout>
            <CheckedOutPage />
          </AppLayout>
        )}
        requiredPermission={Permission.VIEW_CHECKED_OUT}
      />
      <ProtectedRoute 
        path="/admin/management" 
        component={() => (
          <AppLayout>
            <AdminManagementPage />
          </AppLayout>
        )}
        requiredPermission={Permission.MANAGE_ADMINS}
        requiredRole={USER_ROLES.SUPER_ADMIN}
      />
      <ProtectedRoute 
        path="/admin/activity" 
        component={() => (
          <AppLayout>
            <AdminActivityPage />
          </AppLayout>
        )}
        requiredRole={USER_ROLES.ADMIN}
      />
      <ProtectedRoute 
        path="/admin/transfers" 
        component={() => (
          <AppLayout>
            <AdminTransferPage />
          </AppLayout>
        )}
        requiredPermission={Permission.TRANSFER_OWNERSHIP}
        requiredRole={USER_ROLES.SUPER_ADMIN}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
