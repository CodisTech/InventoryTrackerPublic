import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Search, Package, LogOut, CheckCircle2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InventoryItemWithCategory, Personnel } from "@shared/schema";
import ItemDetailModal from "@/components/inventory/item-detail-modal";
import PersonnelDetailModal from "@/components/users/personnel-detail-modal";
import CheckInOutModal from "@/components/inventory/check-in-out-modal";

interface ListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listType: "total" | "checked-out" | "available" | "personnel";
  inventory?: InventoryItemWithCategory[];
  personnel?: Personnel[];
}

const ListModal: React.FC<ListModalProps> = ({
  isOpen,
  onClose,
  listType,
  inventory = [],
  personnel = [],
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState<InventoryItemWithCategory | null>(null);
  const [selectedPersonnel, setSelectedPersonnel] = React.useState<Personnel | null>(null);
  const [isCheckInOutOpen, setIsCheckInOutOpen] = React.useState(false);

  // Configure modal title and icon based on list type
  const getModalConfig = () => {
    switch (listType) {
      case "total":
        return {
          title: "All Inventory Items",
          icon: <Package className="h-5 w-5 mr-2 text-primary" />,
        };
      case "checked-out":
        return {
          title: "Checked Out Items",
          icon: <LogOut className="h-5 w-5 mr-2 text-amber-500" />,
        };
      case "available":
        return {
          title: "Available Items",
          icon: <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500" />,
        };
      case "personnel":
        return {
          title: "All Personnel",
          icon: <Users className="h-5 w-5 mr-2 text-indigo-500" />,
        };
      default:
        return {
          title: "Items List",
          icon: <Package className="h-5 w-5 mr-2 text-primary" />,
        };
    }
  };

  const config = getModalConfig();

  // Filter the appropriate list based on type and search term
  const getFilteredData = () => {
    if (listType === "personnel") {
      return personnel.filter(person => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          `${person.firstName} ${person.lastName}`.toLowerCase().includes(search) ||
          (person.division && person.division.toLowerCase().includes(search)) ||
          (person.department && person.department.toLowerCase().includes(search)) ||
          (person.jDial && person.jDial && person.jDial.toLowerCase().includes(search)) ||
          (person.lcpoName && person.lcpoName.toLowerCase().includes(search))
        );
      });
    } else {
      // Filter inventory items based on list type
      let filteredItems = inventory;
      if (listType === "checked-out") {
        // Only show checked out items that have a person assigned
        filteredItems = inventory.filter(item => 
          item.checkedOutBy !== null && 
          item.checkedOutBy !== undefined
        );
      } else if (listType === "available") {
        // Show items that are available
        filteredItems = inventory.filter(item => item.availableQuantity > 0);
      }

      // Apply search filtering
      return filteredItems.filter(item => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          item.name.toLowerCase().includes(search) ||
          item.itemCode.toLowerCase().includes(search) ||
          (item.description && item.description.toLowerCase().includes(search)) ||
          item.category.name.toLowerCase().includes(search)
        );
      });
    }
  };

  // Define columns for personnel table
  const personnelColumns: Column<Personnel>[] = [
    {
      header: "Name",
      accessorKey: "firstName" as keyof Personnel,
      cell: (person: Personnel) => `${person.firstName} ${person.lastName}`,
    },
    {
      header: "Division",
      accessorKey: "division" as keyof Personnel,
      cell: (person: Personnel) => person.division || "-",
    },
    {
      header: "Department",
      accessorKey: "department" as keyof Personnel,
      cell: (person: Personnel) => person.department || "-",
    },
    {
      header: "J-Dial",
      accessorKey: "jDial" as keyof Personnel,
      cell: (person: Personnel) => person.jDial || "-",
    },
    {
      header: "LCPO",
      accessorKey: "lcpoName" as keyof Personnel,
      cell: (person: Personnel) => person.lcpoName || "-",
    },
  ];

  // Define columns for inventory table
  const inventoryColumns: Column<InventoryItemWithCategory>[] = [
    {
      header: "Item Code",
      accessorKey: "itemCode" as keyof InventoryItemWithCategory,
    },
    {
      header: "Name",
      accessorKey: "name" as keyof InventoryItemWithCategory,
    },
    {
      header: "Category",
      accessorKey: "category" as keyof InventoryItemWithCategory,
      cell: (item: InventoryItemWithCategory) => item.category.name,
    },
    {
      header: "Available / Total",
      accessorKey: "availableQuantity" as keyof InventoryItemWithCategory,
      cell: (item: InventoryItemWithCategory) => `${item.availableQuantity} / ${item.totalQuantity}`,
    },
    {
      header: "Status",
      accessorKey: "status" as keyof InventoryItemWithCategory,
      cell: (item: InventoryItemWithCategory) => {
        // If the item has no available quantity and is assigned to someone
        if (item.availableQuantity === 0 && item.checkedOutBy) {
          return <span className="text-amber-500 font-medium">Checked Out</span>;
        }
        
        // If the item has no available quantity but is not assigned
        if (item.availableQuantity === 0) {
          return <span className="text-destructive font-medium">Out of Stock</span>;
        }
        
        // If someone has this item checked out but some quantity is still available
        if (item.checkedOutBy && item.availableQuantity > 0) {
          return <span className="text-blue-500 font-medium">Partially Checked Out</span>;
        }
        
        // Low stock warning
        if (item.availableQuantity < (item.minStockLevel || 3)) {
          return <span className="text-amber-500 font-medium">Low Stock</span>;
        }
        
        // Normal in-stock status
        return <span className="text-emerald-500">In Stock</span>;
      },
    },
    {
      header: "Checked Out By",
      accessorKey: "checkedOutBy" as keyof InventoryItemWithCategory,
      cell: (item: InventoryItemWithCategory) => {
        if (!item.checkedOutBy) return "-";
        const quantityCheckedOut = item.totalQuantity - item.availableQuantity;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{item.checkedOutBy.fullName}</span>
            {quantityCheckedOut > 1 && (
              <span className="text-sm text-muted-foreground">
                Qty: {quantityCheckedOut}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const filteredData = getFilteredData();
  
  // Use type assertion to address Column type compatibility issue
  const columns = listType === "personnel" 
    ? personnelColumns as Column<any>[]
    : inventoryColumns as Column<any>[];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {config.icon}
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-auto max-h-[400px]">
          {/* Use properly typed data */}
          <DataTable
            data={filteredData}
            columns={columns as any}
            onRowClick={(item) => {
              if (listType === "personnel") {
                setSelectedPersonnel(item as Personnel);
              } else {
                setSelectedItem(item as InventoryItemWithCategory);
              }
            }}
          />
        </div>

        <DialogFooter className="flex justify-between">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
          onCheckInOut={() => {
            setSelectedItem(null);
            setIsCheckInOutOpen(true);
          }}
        />
      )}
      
      {/* Personnel Detail Modal */}
      {selectedPersonnel && (
        <PersonnelDetailModal
          isOpen={!!selectedPersonnel}
          onClose={() => setSelectedPersonnel(null)}
          personnel={selectedPersonnel}
        />
      )}
      
      {/* Check In/Out Modal */}
      {isCheckInOutOpen && (
        <CheckInOutModal
          isOpen={isCheckInOutOpen}
          onClose={() => {
            setIsCheckInOutOpen(false);
            onClose();
          }}
          selectedItem={selectedItem}
        />
      )}
    </Dialog>
  );
};

export default ListModal;