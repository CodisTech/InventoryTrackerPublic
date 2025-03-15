import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle, ClockIcon, UserCircle, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TransactionWithDetails } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

// Overdue Reports Tab Component
const OverdueReportsTab: React.FC = () => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">24-Hour Overdue Items Report</h3>
        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
          {isLoading ? "Loading..." : `${overdueItems.length} Overdue Items`}
        </Badge>
      </div>

      {isLoading ? (
        <Card className="border-neutral-200 bg-neutral-50 shadow-sm">
          <CardContent className="p-6 flex justify-center items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading overdue items data...</span>
          </CardContent>
        </Card>
      ) : !overdueItems.length ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="rounded-full bg-green-50 p-3 mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Overdue Items</h3>
              <p className="text-neutral-500 max-w-md">
                All items are currently within the 24-hour checkout limit. This report will update as items become overdue.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {overdueItems.map((transaction) => (
            <Card key={transaction.id} className="border-red-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1 p-2 rounded-full bg-red-100">
                      <Package className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium text-neutral-900">{transaction.item.name}</p>
                        <Badge variant="destructive" className="ml-3">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {transaction.dueDate
                            ? `Overdue by ${formatDistanceToNow(new Date(transaction.dueDate))}`
                            : "Overdue"}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-neutral-600 mt-1">
                        <UserCircle className="h-4 w-4 mr-1" />
                        <span>Checked out by: {transaction.user.fullName}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="text-xs bg-neutral-100 px-2 py-1 rounded">
                          Item code: {transaction.item.itemCode}
                        </div>
                        <div className="text-xs bg-neutral-100 px-2 py-1 rounded">
                          Transaction ID: TRX-{transaction.id.toString().padStart(4, '0')}
                        </div>
                        <div className="text-xs bg-neutral-100 px-2 py-1 rounded">
                          Checkout date: {new Date(transaction.checkoutDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-end">
            <Button variant="outline" className="text-xs">
              Export Overdue Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const ReportsPage: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-neutral-900">Reports</h2>
        <div className="flex gap-2">
          <Select defaultValue="thisMonth">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <span>Export</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 1C7.22386 1 7 1.22386 7 1.5V8.5C7 8.77614 7.22386 9 7.5 9C7.77614 9 8 8.77614 8 8.5V1.5C8 1.22386 7.77614 1 7.5 1ZM4.85355 4.14645C4.65829 3.95118 4.34171 3.95118 4.14645 4.14645C3.95118 4.34171 3.95118 4.65829 4.14645 4.85355L7.14645 7.85355C7.34171 8.04882 7.65829 8.04882 7.85355 7.85355L10.8536 4.85355C11.0488 4.65829 11.0488 4.34171 10.8536 4.14645C10.6583 3.95118 10.3417 3.95118 10.1464 4.14645L7.5 6.79289L4.85355 4.14645ZM3 10C2.44772 10 2 10.4477 2 11V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11C11 11 11 11 11 11C11 11 11 12 11 12C11 12 11 12 11 12C11 12 3 12 3 12C3 12 3 12 3 12C3 12 3 11 3 11C3 11 3 11 3 11C3 10.4477 2.55228 10 2 10C2 10 2 10 2 10L3 10Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overdueItems" className="mb-6">
        <TabsList className="w-full">
          <TabsTrigger value="overdueItems" className="relative">
            <span>Overdue Items</span>
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
              !
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="personnel">Personnel Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overdueItems" className="pt-4">
          <OverdueReportsTab />
        </TabsContent>
        <TabsContent value="inventory" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This section will display inventory status charts and statistics.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This section will display category distribution charts.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="transactions" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This section will display transaction activity charts and statistics.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Checkout Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This section will display checkout duration analysis.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="personnel" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personnel Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This section will display personnel activity charts and statistics.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Department Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This section will display department usage analysis.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This section will allow administrators to build custom reports with selected metrics and date ranges.
                The reports module is planned for the next update.
              </AlertDescription>
            </Alert>
            <Button variant="secondary" disabled>
              Build Custom Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;