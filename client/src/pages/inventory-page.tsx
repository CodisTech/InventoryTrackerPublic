import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddItemModal from "@/components/inventory/add-item-modal";
import CheckInOutModal from "@/components/inventory/check-in-out-modal";
import { InventoryItemWithCategory } from "@shared/schema";
import { format } from "date-fns";

const InventoryPage: React.FC = () => {
  const { toast } = useToast();
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isCheckInOutModalOpen, setIsCheckInOutModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemWithCategory | null>(null);

  const { data: inventoryItems = [], isLoading, error } = useQuery<InventoryItemWithCategory[]>({
    queryKey: ["/api/inventory"],
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading inventory",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleViewItem = (item: InventoryItemWithCategory) => {
    setSelectedItem(item);
    setIsCheckInOutModalOpen(true);
  };

  const columns = [
    {
      header: "Item Code",
      accessorKey: "itemCode",
      sortable: true,
    },
    {
      header: "Item Name",
      accessorKey: "name",
      cell: (item: InventoryItemWithCategory) => (
        <div className="flex items-center">
          <div className="w-8 h-8 flex-shrink-0 mr-3 bg-neutral-100 rounded-md flex items-center justify-center">
            <span className="material-icons text-neutral-500">
              {getCategoryIcon(item.category.name)}
            </span>
          </div>
          <span>{item.name}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (item: InventoryItemWithCategory) => item.category.name,
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: InventoryItemWithCategory) => {
        let variant: 
          | "success" 
          | "warning" 
          | "error" = "success";
        let label = "Available";

        if (item.availableQuantity === 0) {
          variant = "error";
          label = "Out of Stock";
        } else if (item.checkedOutBy) {
          variant = "warning";
          label = "Checked Out";
        } else if (item.availableQuantity <= item.minStockLevel) {
          variant = "warning";
          label = "Low Stock";
        }

        return (
          <Badge variant={variant}>
            {label}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      header: "Available",
      accessorKey: "availableQuantity",
      cell: (item: InventoryItemWithCategory) => `${item.availableQuantity} / ${item.totalQuantity}`,
      sortable: true,
    },
    {
      header: "Checked Out By",
      accessorKey: "checkedOutBy",
      cell: (item: InventoryItemWithCategory) => item.checkedOutBy?.fullName || "-",
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (item: InventoryItemWithCategory) => (
        <Button variant="link" onClick={() => handleViewItem(item)}>
          View
        </Button>
      ),
    },
  ];

  // Helper function to get icon based on category
  function getCategoryIcon(category: string): string {
    const categoryMap: Record<string, string> = {
      "Laptops": "laptop",
      "Desktops": "desktop_windows",
      "Mobile Devices": "smartphone",
      "Storage": "storage",
      "A/V Equipment": "videocam",
      "Accessories": "devices",
    };

    return categoryMap[category] || "inventory";
  }

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between">
          <CardTitle className="text-2xl font-medium text-neutral-900">Inventory</CardTitle>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 md:mt-0">
            <Button variant="outline" className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button onClick={() => setIsAddItemModalOpen(true)} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={inventoryItems}
            columns={columns}
            searchPlaceholder="Search inventory..."
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
      />
      <CheckInOutModal
        isOpen={isCheckInOutModalOpen}
        onClose={() => setIsCheckInOutModalOpen(false)}
        selectedItem={selectedItem}
      />
    </div>
  );
};

export default InventoryPage;
