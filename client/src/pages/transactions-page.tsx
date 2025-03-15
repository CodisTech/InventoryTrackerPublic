import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Transaction, Personnel, InventoryItemWithCategory, User } from "@shared/schema";
import { Printer, Eye, RotateCcw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CheckInOutModal from "@/components/inventory/check-in-out-modal";
import ItemDetailModal from "@/components/inventory/item-detail-modal";

const TransactionsPage: React.FC = () => {
  const { toast } = useToast();
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isCheckInOutModalOpen, setIsCheckInOutModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemWithCategory | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading transactions",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const { data: inventory = [] } = useQuery<InventoryItemWithCategory[]>({
    queryKey: ["/api/inventory"],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // This query is kept for backward compatibility
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const handlePrint = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setPrintModalOpen(true);
  };
  
  const handleViewItem = (transaction: Transaction) => {
    const item = inventory.find(i => i.id === transaction.itemId);
    if (item) {
      setSelectedItem(item);
      setViewModalOpen(true);
    } else {
      toast({
        title: "Item not found",
        description: "Could not find the item associated with this transaction.",
        variant: "destructive",
      });
    }
  };
  
  const handleCheckIn = (transaction: Transaction) => {
    // Only allow check-in for checked-out items that haven't been returned
    if (transaction.type !== "check-out" || transaction.returnDate) {
      toast({
        title: "Cannot check in this item",
        description: "This item is not currently checked out or has already been returned.",
        variant: "destructive",
      });
      return;
    }
    
    const item = inventory.find(i => i.id === transaction.itemId);
    if (item) {
      setSelectedItem(item);
      setIsCheckInOutModalOpen(true);
    } else {
      toast({
        title: "Item not found",
        description: "Could not find the item associated with this transaction.",
        variant: "destructive",
      });
    }
  };

  const printTransaction = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print failed",
        description: "Unable to open print window. Please check your browser settings.",
        variant: "destructive",
      });
      return;
    }

    // Find related data
    const item = inventory.find(i => i.id === selectedTransaction?.itemId);
    const person = personnel.find(p => p.id === selectedTransaction?.userId);

    // Format dates
    const checkoutDate = selectedTransaction?.timestamp 
      ? format(new Date(selectedTransaction.timestamp), "MMMM dd, yyyy")
      : 'N/A';
    const checkoutTime = selectedTransaction?.timestamp
      ? format(new Date(selectedTransaction.timestamp), "h:mm a")
      : 'N/A';
    const dueDate = selectedTransaction?.dueDate
      ? format(new Date(selectedTransaction.dueDate), "MMMM dd, yyyy h:mm a")
      : 'N/A';
    const returnDate = selectedTransaction?.returnDate
      ? format(new Date(selectedTransaction.returnDate), "MMMM dd, yyyy h:mm a")
      : 'Not returned';

    // Create HTML content for printing
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction TRX-${selectedTransaction?.id.toString().padStart(4, '0')}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .transaction-id {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 5px;
              border-bottom: 1px solid #ddd;
            }
            .row {
              display: flex;
              margin-bottom: 5px;
            }
            .label {
              font-weight: bold;
              width: 180px;
            }
            .value {
              flex: 1;
            }
            .signature-area {
              margin-top: 50px;
              border-top: 1px dashed #999;
              padding-top: 20px;
            }
            .signature-line {
              margin-top: 70px;
              border-top: 1px solid #333;
              width: 250px;
              display: inline-block;
              margin-right: 20px;
            }
            .footer {
              margin-top: 50px;
              font-size: 11px;
              color: #666;
              text-align: center;
            }
            @media print {
              .no-print {
                display: none;
              }
              body {
                margin: 0;
                padding: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CODIS TECHNOLOGY</h1>
            <div class="transaction-id">Transaction: TRX-${selectedTransaction?.id.toString().padStart(4, '0')}</div>
            <div>${selectedTransaction?.type === 'check-out' ? 'EQUIPMENT CHECKOUT' : 'EQUIPMENT CHECK-IN'}</div>
          </div>
          
          <div class="section">
            <div class="section-title">PERSONNEL INFORMATION</div>
            <div class="row">
              <div class="label">First Name:</div>
              <div class="value">${person?.firstName || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">Last Name:</div>
              <div class="value">${person?.lastName || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">Division:</div>
              <div class="value">${person?.division || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">Department:</div>
              <div class="value">${person?.department || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">J-Dial:</div>
              <div class="value">${person?.jDial || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">LCPO:</div>
              <div class="value">${person?.lcpoName || 'N/A'}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">ITEM INFORMATION</div>
            <div class="row">
              <div class="label">Item Code:</div>
              <div class="value">${item?.itemCode || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">Item Name:</div>
              <div class="value">${item?.name || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">Description:</div>
              <div class="value">${item?.description || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">Category:</div>
              <div class="value">${item?.category?.name || 'N/A'}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">TRANSACTION DETAILS</div>
            <div class="row">
              <div class="label">Transaction Type:</div>
              <div class="value">${selectedTransaction?.type === 'check-out' ? 'Check Out' : 'Check In'}</div>
            </div>
            <div class="row">
              <div class="label">Date:</div>
              <div class="value">${checkoutDate}</div>
            </div>
            <div class="row">
              <div class="label">Time:</div>
              <div class="value">${checkoutTime}</div>
            </div>
            <div class="row">
              <div class="label">Due Date:</div>
              <div class="value">${dueDate}</div>
            </div>
            ${selectedTransaction?.type === 'check-out' ? `
            <div class="row">
              <div class="label">Return Date:</div>
              <div class="value">${returnDate}</div>
            </div>` : ''}
            <div class="row">
              <div class="label">Notes:</div>
              <div class="value">${selectedTransaction?.notes || 'N/A'}</div>
            </div>
          </div>
          
          <div class="signature-area">
            <div class="row">
              <div class="label">Personnel Signature:</div>
              <div class="signature-line"></div>
            </div>
            <div class="row">
              <div class="label">Administrator Signature:</div>
              <div class="signature-line"></div>
            </div>
          </div>
          
          <div class="footer">
            <p>This document serves as the official record of equipment transaction. Personnel are responsible for all equipment until properly returned.</p>
            <p>All equipment must be returned within 24 hours of checkout unless a special exception has been granted.</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print(); window.close();">Print Document</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const columns = [
    {
      header: "Transaction ID",
      accessorKey: "id",
      cell: (transaction: Transaction) => `TRX-${transaction.id.toString().padStart(4, "0")}`,
      sortable: true,
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (transaction: Transaction) => {
        const isCheckout = transaction.type === "check-out";
        return (
          <div className="flex items-center">
            <span className={`material-icons mr-2 ${isCheckout ? "text-warning" : "text-success"}`}>
              {isCheckout ? "logout" : "login"}
            </span>
            <Badge variant={isCheckout ? "warning" : "success"}>
              {isCheckout ? "Check Out" : "Check In"}
            </Badge>
          </div>
        );
      },
      sortable: true,
    },
    {
      header: "Item",
      accessorKey: "itemId",
      cell: (transaction: Transaction) => {
        const item = inventory.find((i: any) => i.id === transaction.itemId);
        return item ? item.name : `Item #${transaction.itemId}`;
      },
      sortable: true,
    },
    {
      header: "Personnel",
      accessorKey: "userId",
      cell: (transaction: Transaction) => {
        const person = personnel.find(p => p.id === transaction.userId);
        if (person) {
          return `${person.firstName} ${person.lastName}${person.division ? ` (${person.division})` : ''}`;
        }
        // Fallback to users table for backward compatibility
        const user = users && users.find((u: User) => u.id === transaction.userId);
        return user ? user.fullName : `Personnel #${transaction.userId}`;
      },
      sortable: true,
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      sortable: true,
    },
    {
      header: "Date",
      accessorKey: "timestamp",
      cell: (transaction: Transaction) => {
        return transaction.timestamp 
          ? format(new Date(transaction.timestamp), "MMM dd, yyyy h:mm a") 
          : "-";
      },
      sortable: true,
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      cell: (transaction: Transaction) => {
        if (!transaction.dueDate) return "-";
        
        const dueDate = new Date(transaction.dueDate);
        const now = new Date();
        const isOverdue = transaction.type === "check-out" && 
                         !transaction.returnDate && 
                         dueDate < now;
        
        return (
          <span className={isOverdue ? "text-destructive font-medium" : ""}>
            {format(dueDate, "MMM dd, yyyy h:mm a")}
            {isOverdue && " (Overdue)"}
          </span>
        );
      },
      sortable: true,
    },
    {
      header: "Return Date",
      accessorKey: "returnDate",
      cell: (transaction: Transaction) => {
        if (transaction.type !== "check-out") return "-";
        return transaction.returnDate 
          ? format(new Date(transaction.returnDate), "MMM dd, yyyy h:mm a") 
          : "Not returned";
      },
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (transaction: Transaction) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewItem(transaction)}
            title="View Item Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {transaction.type === "check-out" && !transaction.returnDate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCheckIn(transaction)}
              title="Check In Item"
              className="text-green-600"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePrint(transaction)}
            title="Print Transaction Details"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-neutral-900">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={transactions}
            columns={columns}
            searchPlaceholder="Search transactions..."
          />
        </CardContent>
      </Card>

      {/* Print Preview Modal */}
      <Dialog open={printModalOpen} onOpenChange={setPrintModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Print Transaction</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you ready to print this transaction record?</p>
            <p className="text-sm text-muted-foreground mt-2">
              This will open a printable version in a new window.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={printTransaction}>
              Print Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal 
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          item={selectedItem}
          onCheckInOut={() => {
            setViewModalOpen(false);
            setIsCheckInOutModalOpen(true);
          }}
        />
      )}
      
      {/* Check In/Out Modal */}
      <CheckInOutModal
        isOpen={isCheckInOutModalOpen}
        onClose={() => setIsCheckInOutModalOpen(false)}
        selectedItem={selectedItem}
      />
    </div>
  );
};

export default TransactionsPage;
