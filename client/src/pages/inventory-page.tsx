import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Plus, Check, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import AddItemModal from "@/components/inventory/add-item-modal";
import CheckInOutModal from "@/components/inventory/check-in-out-modal";
import MultiItemCheckoutModal from "@/components/inventory/multi-item-checkout-modal";
import { InventoryItemWithCategory } from "@shared/schema";
import { format } from "date-fns";

const InventoryPage: React.FC = () => {
  const { toast } = useToast();
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isCheckInOutModalOpen, setIsCheckInOutModalOpen] = useState(false);
  const [isMultiCheckoutModalOpen, setIsMultiCheckoutModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemWithCategory | null>(null);
  const [selectedItems, setSelectedItems] = useState<InventoryItemWithCategory[]>([]);
  const [selectMode, setSelectMode] = useState(false);

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

  // Handle toggling item selection
  const handleItemSelect = (item: InventoryItemWithCategory, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, item]);
    } else {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    setSelectMode(prev => !prev);
    // Clear selections when exiting select mode
    if (selectMode) {
      setSelectedItems([]);
    }
  };

  // Handle multi-item checkout
  const handleMultiCheckout = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to check out.",
        variant: "destructive",
      });
      return;
    }
    
    // Filter out items that aren't available
    const availableItems = selectedItems.filter(item => item.availableQuantity > 0);
    
    if (availableItems.length === 0) {
      toast({
        title: "No available items",
        description: "None of the selected items are available for checkout.",
        variant: "destructive",
      });
      return;
    }
    
    if (availableItems.length !== selectedItems.length) {
      toast({
        title: "Some items unavailable",
        description: "Some selected items are unavailable and won't be included in checkout.",
      });
    }
    
    setSelectedItems(availableItems);
    setIsMultiCheckoutModalOpen(true);
  };

  const handleViewItem = (item: InventoryItemWithCategory) => {
    // In select mode, toggle item selection instead of opening the check-in/out modal
    if (selectMode) {
      const isSelected = selectedItems.some(i => i.id === item.id);
      handleItemSelect(item, !isSelected);
      return;
    }
    
    setSelectedItem(item);
    setIsCheckInOutModalOpen(true);
  };

  // Create columns including a selection column when in select mode
  const columns = [
    // Selection column (conditional on selectMode)
    ...(selectMode ? [
      {
        header: () => <div className="text-center">Select</div>,
        accessorKey: "selected",
        cell: (item: InventoryItemWithCategory) => {
          const isSelected = selectedItems.some(i => i.id === item.id);
          return (
            <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
              <Checkbox 
                checked={isSelected}
                onCheckedChange={(checked) => {
                  handleItemSelect(item, checked as boolean);
                }}
                disabled={item.availableQuantity <= 0}
              />
            </div>
          );
        },
      }
    ] : []),
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
        <div className="flex space-x-2">
          <Button 
            variant={item.checkedOutBy ? "secondary" : "default"} 
            size="sm" 
            className={item.checkedOutBy ? "bg-amber-100 text-amber-900 hover:bg-amber-200" : ""}
            onClick={(e) => {
              e.stopPropagation();
              handleViewItem(item);
            }}
          >
            {item.checkedOutBy ? 'Check In' : 'Check Out'}
          </Button>
          <Button variant="outline" size="sm" onClick={(e) => {
            e.stopPropagation();
            handleViewItem(item);
          }}>
            Details
          </Button>
        </div>
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

  // Count how many items are checked out and need returning
  const checkedOutItemsCount = inventoryItems.filter(
    item => item.checkedOutBy !== null
  ).length;

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-medium text-neutral-900">Inventory</CardTitle>
            <div className="mt-2 text-sm text-muted-foreground">
              {checkedOutItemsCount > 0 && (
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2 bg-amber-100">
                    {checkedOutItemsCount} item{checkedOutItemsCount !== 1 ? 's' : ''} checked out
                  </Badge>
                </div>
              )}
              {selectMode && selectedItems.length > 0 && (
                <div className="flex items-center mt-2">
                  <Badge variant="outline" className="mr-2 bg-blue-100 text-blue-800 border-blue-200">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 md:mt-0">
            {selectMode ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={toggleSelectMode} 
                  className="flex items-center"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleMultiCheckout}
                  className="flex items-center"
                  disabled={selectedItems.length === 0}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Check Out Selected ({selectedItems.length})
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={toggleSelectMode} 
                  className="flex items-center"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Select Multiple
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button 
                  onClick={() => setIsAddItemModalOpen(true)} 
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={inventoryItems}
            columns={columns}
            searchPlaceholder="Search inventory..."
            onRowClick={handleViewItem}
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
        onClose={() => {
          setIsCheckInOutModalOpen(false);
          setSelectedItem(null); // Clear selected item when closing modal
        }}
        selectedItem={selectedItem}
      />
    </div>
  );
};

export default InventoryPage;
