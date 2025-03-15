import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Loader2, Info, Search, PackageCheck, Calendar } from "lucide-react";
import { InventoryItemWithCategory, TransactionWithDetails } from "@shared/schema";
import CheckInOutModal from "@/components/inventory/check-in-out-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isAfter, parseISO } from "date-fns";

export default function CheckedOutPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItemWithCategory | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  // Fetch transactions with details
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/transactions/details"],
    refetchInterval: 5000,
  });

  // Filter only checkout transactions that don't have a matching check-in
  const checkedOutTransactions = transactions.filter(
    trx => trx.type === "check-out" && 
    !transactions.some(
      t => t.type === "check-in" && 
      t.itemId === trx.itemId && 
      t.timestamp > trx.timestamp
    )
  );

  // Filter transactions based on search term
  const filteredTransactions = checkedOutTransactions.filter(trx => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      trx.item.name.toLowerCase().includes(searchLower) ||
      trx.item.itemCode.toLowerCase().includes(searchLower) ||
      trx.user.fullName.toLowerCase().includes(searchLower) ||
      trx.user.username.toLowerCase().includes(searchLower) ||
      (trx.personnel?.division && trx.personnel.division.toLowerCase().includes(searchLower)) ||
      (trx.personnel?.department && trx.personnel.department.toLowerCase().includes(searchLower))
    );
  });

  // Define columns for the data table
  const columns = [
    {
      header: "Item",
      accessorKey: "item.name" as any,
      cell: (trx: TransactionWithDetails) => (
        <div className="flex flex-col">
          <span className="font-medium">{trx.item.name}</span>
          <span className="text-xs text-muted-foreground">{trx.item.itemCode}</span>
        </div>
      ),
    },
    {
      header: "Checked Out To",
      accessorKey: "user.fullName" as any,
      cell: (trx: TransactionWithDetails) => (
        <div className="flex flex-col">
          <span>{trx.user.fullName}</span>
          {trx.personnel && (
            <span className="text-xs text-muted-foreground">
              {trx.personnel.division || ''} {trx.personnel.department ? `• ${trx.personnel.department}` : ''}
            </span>
          )}
        </div>
      ),
    },
    // Quantity column removed as system now only handles single items
    {
      header: "Checkout Date",
      accessorKey: "timestamp" as any,
      cell: (trx: TransactionWithDetails) => (
        <div className="flex flex-col">
          <span>{format(new Date(trx.timestamp), "MMM d, yyyy")}</span>
          <span className="text-xs text-muted-foreground">{format(new Date(trx.timestamp), "h:mm a")}</span>
        </div>
      ),
    },
    {
      header: "Due Date",
      accessorKey: "dueDate" as any,
      cell: (trx: TransactionWithDetails) => {
        if (!trx.dueDate) return "-";
        
        const dueDate = new Date(trx.dueDate);
        const now = new Date();
        const isOverdue = isAfter(now, dueDate);
        
        return (
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                {format(dueDate, "MMM d, yyyy")}
              </span>
              {isOverdue && (
                <Badge variant="destructive" className="ml-2 px-1 py-0 h-5">
                  Overdue
                </Badge>
              )}
            </div>
            <span className={cn("text-xs", isOverdue ? "text-red-400" : "text-muted-foreground")}>
              {format(dueDate, "h:mm a")}
            </span>
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "id" as any,
      cell: (trx: TransactionWithDetails) => {
        // Find the inventory item with category from transactions
        const handleCheckIn = () => {
          // Extract the inventory item with category from the transaction
          const inventoryItem: InventoryItemWithCategory = {
            ...trx.item,
            category: trx.item.category,
            checkedOutBy: {
              id: trx.user.id,
              fullName: trx.user.fullName
            }
          };
          
          setSelectedItem(inventoryItem);
          setIsCheckInModalOpen(true);
        };
        
        return (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCheckIn}
            >
              <PackageCheck className="h-4 w-4 mr-1" />
              Check In
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Checkout Details</h4>
                    <p className="text-sm text-muted-foreground">
                      Full details about this item checkout
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium">Transaction ID:</span>
                      <span className="col-span-2 text-sm">TRX-{String(trx.id).padStart(4, '0')}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium">J-Dial:</span>
                      <span className="col-span-2 text-sm">{trx.personnel?.jDial || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium">LCPO:</span>
                      <span className="col-span-2 text-sm">{trx.personnel?.lcpoName || 'N/A'}</span>
                    </div>
                    {trx.notes && (
                      <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium">Notes:</span>
                        <span className="col-span-2 text-sm">{trx.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container py-4 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Checked Out Items</h1>
          <p className="text-muted-foreground">
            View and manage all currently checked out inventory items
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items or personnel..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoadingTransactions ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertTitle>No items checked out</AlertTitle>
          <AlertDescription>
            There are currently no items checked out. When items are checked out,
            they will appear here.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="bg-white rounded-md border shadow-sm">
          <DataTable 
            data={filteredTransactions} 
            columns={columns} 
          />
        </div>
      )}

      {/* Check-in modal */}
      <CheckInOutModal
        isOpen={isCheckInModalOpen}
        onClose={() => {
          setIsCheckInModalOpen(false);
          setSelectedItem(null);
        }}
        selectedItem={selectedItem}
      />
    </div>
  );
}