import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  RotateCw, 
  Plus, 
  Package, 
  LogOut, 
  CheckCircle2, 
  Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SummaryCard from "@/components/dashboard/summary-card";
import RecentActivity from "@/components/dashboard/recent-activity";
import LowStockItems from "@/components/dashboard/low-stock-items";
import OverdueItemsAlert from "@/components/dashboard/overdue-items-alert";
import CheckInOutModal from "@/components/inventory/check-in-out-modal";
import AddItemModal from "@/components/inventory/add-item-modal";
import { DashboardStats } from "@shared/schema";
import { Link } from "wouter";

const DashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [isCheckInOutModalOpen, setIsCheckInOutModalOpen] = React.useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = React.useState(false);

  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading dashboard stats",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div id="dashboard">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-neutral-900">Dashboard</h2>
        <div className="flex">
          <Button 
            variant="outline" 
            className="mr-2 border-2 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={() => setIsCheckInOutModalOpen(true)}
          >
            <RotateCw className="w-4 h-4 mr-2" />
            <span>Check In/Out</span>
          </Button>
          <Button onClick={() => setIsAddItemModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>
      
      {/* Overdue Items Alert - Always rendered and handles its own data fetching */}
      <OverdueItemsAlert />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Items"
          value={stats?.totalItems || 0}
          icon={<Package className="w-6 h-6" />}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
        />
        <SummaryCard
          title="Checked Out"
          value={stats?.checkedOutItems || 0}
          icon={<LogOut className="w-6 h-6" />}
          iconColor="text-amber-500"
          iconBgColor="bg-amber-50"
        />
        <SummaryCard
          title="Available"
          value={stats?.availableItems || 0}
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconColor="text-emerald-500"
          iconBgColor="bg-emerald-50"
        />
        <SummaryCard
          title="Personnel"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
          iconColor="text-indigo-500"
          iconBgColor="bg-indigo-50"
        />
      </div>

      {/* Recent Activities & Low Stock Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={stats?.recentActivity || []} />
        <LowStockItems items={stats?.lowStockItems || []} />
      </div>

      {/* Modals */}
      <CheckInOutModal
        isOpen={isCheckInOutModalOpen}
        onClose={() => setIsCheckInOutModalOpen(false)}
      />
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
