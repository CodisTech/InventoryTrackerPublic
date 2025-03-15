import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionWithDetails } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const OverdueItemsAlert = () => {
  const { toast } = useToast();

  const { data: overdueItems = [], isLoading, error } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/overdue-items"],
    refetchInterval: 60000, // Refetch every minute to keep the list updated
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching overdue items",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <Card className="border-muted">
        <CardHeader className="py-3">
          <CardTitle className="text-md font-medium flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-muted-foreground" />
            Checking for overdue items...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (overdueItems.length === 0) {
    return null; // Don't show anything if there are no overdue items
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="mb-1">Overdue Items Alert (24-hour limit exceeded)</AlertTitle>
      <AlertDescription>
        <div className="mt-2 max-h-40 overflow-auto">
          {overdueItems.map((transaction) => (
            <div 
              key={transaction.id} 
              className="mb-2 flex justify-between items-center p-2 rounded bg-destructive/10"
            >
              <div>
                <p className="font-medium">{transaction.item.name}</p>
                <p className="text-sm opacity-80">
                  Checked out by: {transaction.user.fullName}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant="destructive" className="mb-1">
                  {transaction.dueDate
                    ? `Overdue by ${formatDistanceToNow(new Date(transaction.dueDate))}`
                    : "Overdue"}
                </Badge>
                <span className="text-xs opacity-70">
                  Transaction ID: #{transaction.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default OverdueItemsAlert;