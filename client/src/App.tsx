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
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import AppLayout from "./components/layout/app-layout";

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
      />
      <ProtectedRoute 
        path="/inventory" 
        component={() => (
          <AppLayout>
            <InventoryPage />
          </AppLayout>
        )} 
      />
      <ProtectedRoute 
        path="/transactions" 
        component={() => (
          <AppLayout>
            <TransactionsPage />
          </AppLayout>
        )} 
      />
      <ProtectedRoute 
        path="/users" 
        component={() => (
          <AppLayout>
            <UsersPage />
          </AppLayout>
        )} 
      />
      <ProtectedRoute 
        path="/reports" 
        component={() => (
          <AppLayout>
            <ReportsPage />
          </AppLayout>
        )} 
      />
      <ProtectedRoute 
        path="/checked-out" 
        component={() => (
          <AppLayout>
            <CheckedOutPage />
          </AppLayout>
        )} 
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
