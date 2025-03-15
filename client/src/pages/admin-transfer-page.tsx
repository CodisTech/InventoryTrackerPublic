import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TransactionWithDetails, User } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  UserCheck, 
  Eye, 
  Check,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const AdminTransferPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithDetails | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState<string>("");
  const [transferType, setTransferType] = useState<"single" | "all">("single");

  const { data: transactions = [], isLoading, error, refetch } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/transactions/details"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
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

  const transferAdminMutation = useMutation({
    mutationFn: async ({ 
      transactionId, 
      adminId, 
      transferAll 
    }: { 
      transactionId: number; 
      adminId: number; 
      transferAll: boolean;
    }) => {
      return await apiRequest(
        transferAll 
          ? `/api/transactions/admin/transfer-all` 
          : `/api/transactions/${transactionId}/admin/transfer`,
        {
          method: "PATCH",
          data: { 
            adminId,
            oldAdminId: transferAll ? selectedTransaction?.administratorId : undefined
          },
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Administrator transferred",
        description: transferType === "single" 
          ? "The transaction has been assigned to the new administrator."
          : "All relevant transactions have been transferred to the new administrator.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/details"] });
      setIsTransferModalOpen(false);
      setSelectedTransaction(null);
      setNewAdmin("");
      setTransferType("single");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to transfer administrator",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTransferClick = (transaction: TransactionWithDetails) => {
    setSelectedTransaction(transaction);
    setIsTransferModalOpen(true);
  };

  const handleTransfer = () => {
    if (!selectedTransaction || !newAdmin) return;
    
    transferAdminMutation.mutate({
      transactionId: selectedTransaction.id,
      adminId: parseInt(newAdmin),
      transferAll: transferType === "all",
    });
  };

  const adminOptions = users
    .filter(user => user.role === "admin" || user.role === "superadmin")
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const columns = [
    {
      header: "Transaction ID",
      accessorKey: "id",
      cell: (transaction: TransactionWithDetails) => `TRX-${transaction.id.toString().padStart(4, "0")}`,
      sortable: true,
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (transaction: TransactionWithDetails) => {
        const isCheckout = transaction.type === "check-out";
        return (
          <Badge variant={isCheckout ? "warning" : "success"}>
            {isCheckout ? "Check Out" : "Check In"}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      header: "Item",
      accessorKey: "itemId",
      cell: (transaction: TransactionWithDetails) => {
        return transaction.item ? transaction.item.name : `Item #${transaction.itemId}`;
      },
      sortable: true,
    },
    {
      header: "Personnel",
      accessorKey: "userId",
      cell: (transaction: TransactionWithDetails) => {
        if (transaction.person) {
          return `${transaction.person.firstName} ${transaction.person.lastName}${transaction.person.division ? ` (${transaction.person.division})` : ''}`;
        }
        return transaction.user ? transaction.user.fullName : `Personnel #${transaction.userId}`;
      },
      sortable: true,
    },
    {
      header: "Current Administrator",
      accessorKey: "administratorId",
      cell: (transaction: TransactionWithDetails) => {
        return transaction.administrator ? (
          <div className="flex items-center">
            <UserCheck className="h-4 w-4 mr-2 text-primary" />
            <span>{transaction.administrator.fullName}</span>
          </div>
        ) : "-";
      },
      sortable: true,
    },
    {
      header: "Date",
      accessorKey: "timestamp",
      cell: (transaction: TransactionWithDetails) => {
        return transaction.timestamp 
          ? format(new Date(transaction.timestamp), "MMM dd, yyyy h:mm a") 
          : "-";
      },
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (transaction: TransactionWithDetails) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleTransferClick(transaction)}
            title="Transfer Administrator"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="View Transaction Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-5">
          <CardTitle className="text-2xl font-medium text-neutral-900">
            Administrator Transfer
          </CardTitle>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center">
              <UserCheck className="h-12 w-12 text-muted-foreground/50" />
              <div className="text-xl font-medium">No transactions found</div>
              <div className="text-sm text-muted-foreground">
                No transactions are available to transfer to a different administrator.
              </div>
            </div>
          ) : (
            <DataTable
              data={transactions}
              columns={columns}
              searchable
              searchPlaceholder="Search transactions..."
            />
          )}
        </CardContent>
      </Card>

      {/* Transfer Administrator Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Administrator</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedTransaction && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Transaction:</span>
                  <span className="font-medium">TRX-{selectedTransaction.id.toString().padStart(4, "0")}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Item:</span>
                  <span className="font-medium">
                    {selectedTransaction.item ? selectedTransaction.item.name : `Item #${selectedTransaction.itemId}`}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Current Administrator:</span>
                  <span className="font-medium">
                    {selectedTransaction.administrator ? selectedTransaction.administrator.fullName : "None"}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Transfer Type</label>
              <RadioGroup defaultValue="single" value={transferType} onValueChange={(value) => setTransferType(value as "single" | "all")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="r1" />
                  <Label htmlFor="r1">Transfer this transaction only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="r2" />
                  <Label htmlFor="r2">
                    Transfer all transactions with the same administrator
                    {selectedTransaction?.administrator && (
                      <span className="text-xs text-muted-foreground block mt-1">
                        (All transactions handled by {selectedTransaction.administrator.fullName})
                      </span>
                    )}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select New Administrator</label>
              <Select
                value={newAdmin}
                onValueChange={setNewAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select administrator" />
                </SelectTrigger>
                <SelectContent>
                  {adminOptions
                    .filter(admin => !selectedTransaction || admin.id !== selectedTransaction.administratorId)
                    .map(admin => (
                      <SelectItem key={admin.id} value={admin.id.toString()}>
                        {admin.fullName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center pt-2">
              <ArrowLeft className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="flex-1 h-px bg-border"></div>
              <Check className="h-5 w-5 mx-3" />
              <div className="flex-1 h-px bg-border"></div>
              <ArrowRight className="h-5 w-5 text-muted-foreground ml-2" />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsTransferModalOpen(false)}
              disabled={transferAdminMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleTransfer}
              disabled={!newAdmin || transferAdminMutation.isPending}
            >
              {transferAdminMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                "Transfer Administrator"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTransferPage;