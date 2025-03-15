import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Search, Package, LogOut, CheckCircle2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InventoryItemWithCategory, Personnel } from "@shared/schema";

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
          (person.jDial && person.jDial.toLowerCase().includes(search)) ||
          (person.lcpoName && person.lcpoName.toLowerCase().includes(search))
        );
      });
    } else {
      // Filter inventory items based on list type
      let filteredItems = inventory;
      if (listType === "checked-out") {
        filteredItems = inventory.filter(item => item.checkedOutBy !== null);
      } else if (listType === "available") {
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
  const personnelColumns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (row: Personnel) => `${row.firstName} ${row.lastName}`,
    },
    {
      header: "Division",
      accessorKey: "division",
      cell: (row: Personnel) => row.division || "-",
    },
    {
      header: "Department",
      accessorKey: "department",
      cell: (row: Personnel) => row.department || "-",
    },
    {
      header: "J-Dial",
      accessorKey: "jDial",
      cell: (row: Personnel) => row.jDial || "-",
    },
    {
      header: "LCPO",
      accessorKey: "lcpoName",
      cell: (row: Personnel) => row.lcpoName || "-",
    },
  ];

  // Define columns for inventory table
  const inventoryColumns = [
    {
      header: "Item Code",
      accessorKey: "itemCode",
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row: InventoryItemWithCategory) => row.category.name,
    },
    {
      header: "Available / Total",
      accessorKey: "availableQuantity",
      cell: (row: InventoryItemWithCategory) => `${row.availableQuantity} / ${row.totalQuantity}`,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: InventoryItemWithCategory) => {
        if (row.availableQuantity === 0) {
          return <span className="text-destructive font-medium">Out of Stock</span>;
        }
        if (row.availableQuantity < (row.minStockLevel || 3)) {
          return <span className="text-amber-500 font-medium">Low Stock</span>;
        }
        return <span className="text-emerald-500">In Stock</span>;
      },
    },
    {
      header: "Checked Out By",
      accessorKey: "checkedOutBy",
      cell: (row: InventoryItemWithCategory) => row.checkedOutBy ? row.checkedOutBy.fullName : "-",
    },
  ];

  const filteredData = getFilteredData();
  const columns = listType === "personnel" ? personnelColumns : inventoryColumns;

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
          <DataTable
            data={filteredData}
            columns={columns}
          />
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ListModal;