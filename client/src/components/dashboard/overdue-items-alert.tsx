import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ClockIcon, UserCircle, Package, ArrowRight, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { TransactionWithDetails } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const OverdueItemsAlert = () => {
  const { toast } = useToast();
  const [_, navigate] = useLocation();

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

  const handleViewDetails = () => {
    navigate("/reports?tab=overdueItems");
  };

  // Group overdueItems by user/division
  const userOverdueMap = React.useMemo(() => {
    const map = new Map();
    
    overdueItems.forEach(item => {
      const userId = item.user.id;
      if (!map.has(userId)) {
        map.set(userId, {
          user: item.user,
          items: []
        });
      }
      map.get(userId).items.push(item);
    });
    
    return Array.from(map.values());
  }, [overdueItems]);

  if (isLoading) {
    return (
      <Card className="mb-6 border-neutral-200 bg-neutral-50 shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-md font-medium flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Checking for overdue items...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!overdueItems || overdueItems.length === 0) {
    return null; // Don't show anything if there are no overdue items
  }

  return (
    <Card className="mb-6 border-red-200 bg-red-50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center text-red-700">
          <AlertCircle className="mr-2 h-5 w-5" />
          Overdue Items Alert (24-hour limit exceeded)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-64 overflow-auto pr-1">
          {/* Group by users/divisions */}
          {userOverdueMap.map((userGroup) => (
            <div key={userGroup.user.id} className="mb-4">
              <div className="flex items-center mb-2 text-red-800 bg-red-100 rounded-md px-3 py-2">
                <Users className="h-4 w-4 mr-2" />
                <span className="font-medium">{userGroup.user.fullName}</span>
                <Badge variant="destructive" className="ml-auto">
                  {userGroup.items.length} item{userGroup.items.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              {userGroup.items.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="mb-3 p-3 rounded-md bg-white border border-red-100 shadow-sm cursor-pointer hover:bg-red-50"
                  onClick={() => navigate(`/reports?tab=overdueItems&id=${transaction.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 p-2 rounded-full bg-red-100">
                        <Package className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{transaction.item.name}</p>
                        <div className="text-sm text-neutral-600 mt-1">
                          <span>Item Code: {transaction.item.itemCode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge variant="destructive" className="mb-1 font-medium">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {transaction.dueDate
                          ? `Overdue by ${formatDistanceToNow(new Date(transaction.dueDate))}`
                          : "Overdue"}
                      </Badge>
                      <span className="text-xs text-neutral-500">
                        ID: TRX-{transaction.id.toString().padStart(4, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="bg-red-100 rounded-b-lg pt-2">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full bg-red-700 hover:bg-red-800 text-white"
          onClick={handleViewDetails}
        >
          View Detailed Report
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OverdueItemsAlert;