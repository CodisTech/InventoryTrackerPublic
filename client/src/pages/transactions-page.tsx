import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Transaction } from "@shared/schema";

const TransactionsPage: React.FC = () => {
  const { toast } = useToast();

  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
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

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

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
      header: "User",
      accessorKey: "userId",
      cell: (transaction: Transaction) => {
        const user = users.find((u: any) => u.id === transaction.userId);
        return user ? user.fullName : `User #${transaction.userId}`;
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
            {format(dueDate, "MMM dd, yyyy")}
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
          ? format(new Date(transaction.returnDate), "MMM dd, yyyy") 
          : "Not returned";
      },
      sortable: true,
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
    </div>
  );
};

export default TransactionsPage;
