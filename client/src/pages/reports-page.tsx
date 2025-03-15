import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Info, AlertCircle, ClockIcon, UserCircle, Package, CheckCircle2, Users, 
  ChevronRight, ArrowLeft, User, Check, Clock, AlertTriangle, Phone, RotateCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TransactionWithDetails } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";

// Transaction Detail Component
interface TransactionDetailProps {
  transactionId: number;
  onBack: () => void;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transactionId, onBack }) => {
  const { toast } = useToast();
  
  const { data: overdueItems = [], isLoading, error } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/overdue-items"],
    refetchInterval: 5000, // Refetch every 5 seconds to keep data current
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching transaction details",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const transaction = React.useMemo(() => {
    return overdueItems.find(item => item.id === transactionId);
  }, [overdueItems, transactionId]);

  if (isLoading) {
    return (
      <Card className="border-neutral-200 bg-neutral-50 shadow-sm">
        <CardContent className="p-6 flex justify-center items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading transaction details...</span>
        </CardContent>
      </Card>
    );
  }

  if (!transaction) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className="rounded-full bg-orange-50 p-3 mb-3">
              <AlertCircle className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-medium mb-1">Transaction Not Found</h3>
            <p className="text-neutral-500 max-w-md mb-4">
              The transaction you are looking for could not be found. It may have been returned or deleted.
            </p>
            <Button variant="outline" onClick={onBack}>
              Back to Overdue Items
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={onBack} className="mr-2 p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-lg font-medium">Overdue Transaction Details</h3>
      </div>

      <Card className="border-red-200 overflow-hidden">
        <CardHeader className="bg-red-50 pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              TRX-{transaction.id.toString().padStart(4, '0')}
            </CardTitle>
            <Badge variant="destructive" className="font-medium">
              <ClockIcon className="h-3 w-3 mr-1" />
              {transaction.dueDate
                ? `Overdue by ${formatDistanceToNow(new Date(transaction.dueDate))}`
                : "Overdue"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-500 mb-1">Item Information</h4>
                <div className="bg-neutral-50 rounded-lg p-4 border">
                  <div className="flex items-center mb-2">
                    <div className="mr-3 p-2 rounded-full bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium">{transaction.item.name}</h5>
                      <p className="text-sm text-neutral-500">Code: {transaction.item.itemCode}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-neutral-500">Category:</p>
                      <p className="font-medium">{transaction.item.category?.name || "Uncategorized"}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Status:</p>
                      <p className="font-medium text-red-600">Checked Out</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Total Quantity:</p>
                      <p className="font-medium">{transaction.item.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Available:</p>
                      <p className="font-medium">{transaction.item.availableQuantity}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-neutral-500 mb-1">Transaction Timeline</h4>
                <div className="bg-neutral-50 rounded-lg p-4 border space-y-3">
                  <div className="flex">
                    <div className="mr-3 p-1">
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Checked Out</p>
                      <p className="text-sm text-neutral-500">
                        {transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-3 p-1">
                      <div className="h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Due Date</p>
                      <p className="text-sm text-neutral-500">
                        {transaction.dueDate ? new Date(transaction.dueDate).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-3 p-1">
                      <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Marked Overdue</p>
                      <p className="text-sm text-neutral-500">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-500 mb-1">User Information</h4>
                <div className="bg-neutral-50 rounded-lg p-4 border">
                  <div className="flex items-center mb-2">
                    <div className="mr-3 p-2 rounded-full bg-blue-50">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h5 className="font-medium">{transaction.user.fullName}</h5>
                      <p className="text-sm text-neutral-500">User ID: {transaction.user.id}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-sm">
                    <div className="mb-2">
                      <p className="text-neutral-500">Username:</p>
                      <p className="font-medium">{transaction.user.username}</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-neutral-500">Role:</p>
                      <p className="font-medium">{transaction.user.role || "Standard User"}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-neutral-500 mb-1">Transaction Notes</h4>
                <div className="bg-neutral-50 rounded-lg p-4 border h-32">
                  <p className="text-sm">
                    {transaction.notes || "No notes provided for this transaction."}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-neutral-500 mb-1">Actions</h4>
                <div className="bg-neutral-50 rounded-lg p-4 border">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact User
                    </Button>
                    <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                      <RotateCw className="h-4 w-4 mr-2" />
                      Process Return
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Overdue Reports Tab Component
const OverdueReportsTab: React.FC = () => {
  const { toast } = useToast();
  const [location] = useLocation();
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = React.useState<number | null>(null);
  
  // Parse the transaction ID from the URL if present
  React.useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const id = params.get('id');
    if (id) {
      setSelectedTransactionId(parseInt(id));
    } else {
      setSelectedTransactionId(null);
    }
  }, [location]);
  
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

  // Group overdueItems by user
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

  // Filter transactions based on selected user
  const filteredTransactions = React.useMemo(() => {
    if (selectedUserId === null) {
      return overdueItems;
    }
    return overdueItems.filter(item => item.user.id === selectedUserId);
  }, [overdueItems, selectedUserId]);

  // If a transaction is selected, show the detail view
  if (selectedTransactionId !== null) {
    return (
      <TransactionDetail 
        transactionId={selectedTransactionId} 
        onBack={() => setSelectedTransactionId(null)} 
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">24-Hour Overdue Items Report</h3>
        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
          {isLoading ? "Loading..." : `${overdueItems.length} Overdue Items`}
        </Badge>
      </div>

      {/* User filter dropdown */}
      {userOverdueMap.length > 0 && (
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-sm font-medium">Filter by:</div>
          <Select
            value={selectedUserId === null ? 'all' : selectedUserId.toString()}
            onValueChange={(value) => setSelectedUserId(value === 'all' ? null : parseInt(value))}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select user/division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {userOverdueMap.map((group) => (
                <SelectItem key={group.user.id} value={group.user.id.toString()}>
                  {group.user.fullName} ({group.items.length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
      ) : !filteredTransactions.length ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="rounded-full bg-green-50 p-3 mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Overdue Items {selectedUserId !== null && 'for Selected User'}</h3>
              <p className="text-neutral-500 max-w-md">
                {selectedUserId === null 
                  ? 'All items are currently within the 24-hour checkout limit. This report will update as items become overdue.'
                  : 'The selected user has no overdue items. Try selecting a different user or view all users.'}
              </p>
              {selectedUserId !== null && (
                <Button variant="outline" className="mt-4" onClick={() => setSelectedUserId(null)}>
                  View All Users
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* If filtering by user, show user header */}
          {selectedUserId !== null && userOverdueMap.find(g => g.user.id === selectedUserId) && (
            <div className="flex items-center px-4 py-3 bg-red-100 rounded-lg mb-2">
              <Users className="h-5 w-5 mr-3 text-red-700" />
              <div>
                <h4 className="font-medium text-red-900">
                  {userOverdueMap.find(g => g.user.id === selectedUserId)?.user.fullName}
                </h4>
                <p className="text-sm text-red-700">
                  {userOverdueMap.find(g => g.user.id === selectedUserId)?.items.length} overdue item(s)
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-red-700 hover:bg-red-200"
                onClick={() => setSelectedUserId(null)}
              >
                Clear Filter
              </Button>
            </div>
          )}
        
          {filteredTransactions.map((transaction) => (
            <Card 
              key={transaction.id} 
              className="border-red-100 shadow-sm cursor-pointer hover:border-red-300"
              onClick={() => setSelectedTransactionId(transaction.id)}
            >
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
                          Checkout date: {transaction.timestamp ? new Date(transaction.timestamp).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center">
                    <ChevronRight className="h-5 w-5 text-neutral-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-end mt-4">
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
  const [location] = useLocation();
  
  // Determine the default tab based on URL parameters
  const getDefaultTab = () => {
    if (!location.includes('?')) return "overdueItems";
    
    const params = new URLSearchParams(location.split('?')[1]);
    const tab = params.get('tab');
    return tab || "overdueItems";
  };

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

      <Tabs defaultValue={getDefaultTab()} className="mb-6">
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