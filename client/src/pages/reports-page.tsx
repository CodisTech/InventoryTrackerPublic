import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Info, AlertCircle, ClockIcon, UserCircle, Package, CheckCircle2, Users, 
  ChevronRight, ArrowLeft, User, Check, Clock, AlertTriangle, Phone, RotateCw,
  Mail, CopyIcon, Loader2, BarChart3, PieChart, UserPlus, CalendarRange
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TransactionWithDetails, PersonnelActivity, DepartmentUsage, InventoryItemWithCategory, Category } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";

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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                          <Phone className="h-4 w-4 mr-2" />
                          Contact User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Contact {transaction.user.fullName}</DialogTitle>
                          <DialogDescription>
                            Personnel contact information
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg">{transaction.user.fullName}</h3>
                              <p className="text-sm text-muted-foreground">Personnel ID: {transaction.user.id}</p>
                            </div>
                          </div>
                          
                          <div className="border rounded-md p-4 bg-gray-50">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                <p className="font-medium">
                                  {transaction.person?.jDial ? `J-Dial: ${transaction.person.jDial}` : "Not available"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="font-medium">
                                  {`${transaction.user.username}@codis.tech`}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Division</p>
                                <p className="font-medium">
                                  {transaction.person?.division || "Not assigned"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Department</p>
                                <p className="font-medium">
                                  {transaction.person?.department || "Not assigned"}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {transaction.person?.lcpoName && (
                            <div className="border rounded-md p-4 bg-gray-50">
                              <p className="text-sm font-medium text-gray-500 mb-1">LCPO Contact</p>
                              <p className="font-medium">{transaction.person.lcpoName}</p>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="secondary">
                            <CopyIcon className="h-4 w-4 mr-2" />
                            Copy Contact Info
                          </Button>
                          <Button type="button">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
    refetchInterval: 5000, // Refetch every 5 seconds to keep the list updated
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
        <div className="space-y-3">
          {filteredTransactions.map(transaction => (
            <Card 
              key={transaction.id} 
              className="border-red-100 hover:border-red-200 transition-colors cursor-pointer"
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

// Transaction Reports Tab Component
const TransactionReportsTab: React.FC = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = React.useState<string>("thisMonth");
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selectedTransaction, setSelectedTransaction] = React.useState<number | null>(null);
  
  // Fetch transaction data
  const { data: transactions = [], isLoading, error } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/transactions/details"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching transaction history",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Filter transactions based on search term
  const filteredTransactions = React.useMemo(() => {
    if (!searchTerm) {
      return transactions;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return transactions.filter(transaction => 
      transaction.item.name.toLowerCase().includes(searchLower) ||
      transaction.item.itemCode.toLowerCase().includes(searchLower) ||
      transaction.user.fullName.toLowerCase().includes(searchLower) ||
      `TRX-${transaction.id.toString().padStart(4, '0')}`.toLowerCase().includes(searchLower)
    );
  }, [transactions, searchTerm]);
  
  // Find selected transaction details
  const transactionDetail = React.useMemo(() => {
    if (selectedTransaction === null) return null;
    return transactions.find(t => t.id === selectedTransaction);
  }, [selectedTransaction, transactions]);
  
  // Handle back from transaction detail
  const handleBackToList = () => {
    setSelectedTransaction(null);
  };
  
  // If a transaction is selected, show the detail view
  if (selectedTransaction !== null) {
    if (!transactionDetail) {
      return (
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <Button variant="ghost" onClick={handleBackToList} className="mr-2 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-lg font-medium">Transaction Not Found</h3>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center text-center py-6">
                <div className="rounded-full bg-orange-50 p-3 mb-3">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">Transaction Not Found</h3>
                <p className="text-neutral-500 max-w-md mb-4">
                  The transaction you are looking for could not be found. It may have been deleted.
                </p>
                <Button variant="outline" onClick={handleBackToList}>
                  Back to Transaction History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={handleBackToList} className="mr-2 p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h3 className="text-lg font-medium">Transaction Details</h3>
        </div>

        <Card className={`overflow-hidden ${transactionDetail.type === 'check-in' ? 'border-green-200' : 'border-blue-200'}`}>
          <CardHeader className={`pb-3 ${transactionDetail.type === 'check-in' ? 'bg-green-50' : 'bg-blue-50'}`}>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                TRX-{transactionDetail.id.toString().padStart(4, '0')}
              </CardTitle>
              <Badge variant={transactionDetail.type === 'check-in' ? 'default' : 'outline'} className="capitalize font-medium">
                {transactionDetail.type}
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
                        <h5 className="font-medium">{transactionDetail.item.name}</h5>
                        <p className="text-sm text-neutral-500">Code: {transactionDetail.item.itemCode}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-neutral-500">Category:</p>
                        <p className="font-medium">{transactionDetail.item.category?.name || "Uncategorized"}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Status:</p>
                        <p className="font-medium">{transactionDetail.item.status || "Available"}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Total Quantity:</p>
                        <p className="font-medium">{transactionDetail.item.totalQuantity}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Available:</p>
                        <p className="font-medium">{transactionDetail.item.availableQuantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Transaction Timeline</h4>
                  <div className="bg-neutral-50 rounded-lg p-4 border space-y-3">
                    <div className="flex">
                      <div className="mr-3 p-1">
                        <div className={`h-6 w-6 rounded-full ${transactionDetail.type === 'check-in' ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center`}>
                          {transactionDetail.type === 'check-in' ? 
                            <CheckCircle2 className="h-4 w-4 text-white" /> : 
                            <Package className="h-4 w-4 text-white" />
                          }
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">
                          {transactionDetail.type === 'check-in' ? 'Checked In' : 'Checked Out'}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {transactionDetail.timestamp ? new Date(transactionDetail.timestamp).toLocaleString() : "N/A"}
                        </p>
                      </div>
                    </div>
                    
                    {transactionDetail.dueDate && (
                      <div className="flex">
                        <div className="mr-3 p-1">
                          <div className="h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">Due Date</p>
                          <p className="text-sm text-neutral-500">
                            {new Date(transactionDetail.dueDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {transactionDetail.isOverdue && (
                      <div className="flex">
                        <div className="mr-3 p-1">
                          <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">Marked Overdue</p>
                          <p className="text-sm text-neutral-500">
                            Item was not returned by the due date
                          </p>
                        </div>
                      </div>
                    )}
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
                        <h5 className="font-medium">{transactionDetail.user.fullName}</h5>
                        <p className="text-sm text-neutral-500">User ID: {transactionDetail.user.id}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t text-sm">
                      <div className="mb-2">
                        <p className="text-neutral-500">Username:</p>
                        <p className="font-medium">{transactionDetail.user.username}</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-neutral-500">Role:</p>
                        <p className="font-medium">{transactionDetail.user.role || "Standard User"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Transaction Notes</h4>
                  <div className="bg-neutral-50 rounded-lg p-4 border h-32">
                    <p className="text-sm">
                      {transactionDetail.notes || "No notes provided for this transaction."}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Actions</h4>
                  <div className="bg-neutral-50 rounded-lg p-4 border">
                    <div className="grid grid-cols-2 gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                            <Phone className="h-4 w-4 mr-2" />
                            Contact User
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Contact {transactionDetail.user.fullName}</DialogTitle>
                            <DialogDescription>
                              Personnel contact information
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-blue-100 p-3 rounded-full">
                                <User className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-medium text-lg">{transactionDetail.user.fullName}</h3>
                                <p className="text-sm text-muted-foreground">Personnel ID: {transactionDetail.user.id}</p>
                              </div>
                            </div>
                            
                            <div className="border rounded-md p-4 bg-gray-50">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Phone</p>
                                  <p className="font-medium">
                                    {transactionDetail.person?.jDial ? `J-Dial: ${transactionDetail.person.jDial}` : "Not available"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Email</p>
                                  <p className="font-medium">
                                    {`${transactionDetail.user.username}@codis.tech`}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Division</p>
                                  <p className="font-medium">
                                    {transactionDetail.person?.division || "Not assigned"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Department</p>
                                  <p className="font-medium">
                                    {transactionDetail.person?.department || "Not assigned"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {transactionDetail.person?.lcpoName && (
                              <div className="border rounded-md p-4 bg-gray-50">
                                <p className="text-sm font-medium text-gray-500 mb-1">LCPO Contact</p>
                                <p className="font-medium">{transactionDetail.person.lcpoName}</p>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="secondary">
                              <CopyIcon className="h-4 w-4 mr-2" />
                              Copy Contact Info
                            </Button>
                            <Button type="button">
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                        <RotateCw className="h-4 w-4 mr-2" />
                        Print Receipt
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
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Transaction History</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
          {isLoading ? "Loading..." : `${transactions.length} Transactions`}
        </Badge>
      </div>
      
      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
        <div className="flex-1">
          <input
            type="search"
            placeholder="Search by item name, code, or user..."
            className="w-full px-3 py-2 rounded-md border border-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Select
            value={dateRange}
            onValueChange={setDateRange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <Card className="border-neutral-200 bg-neutral-50 shadow-sm">
          <CardContent className="p-6 flex justify-center items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading transaction history...</span>
          </CardContent>
        </Card>
      ) : !filteredTransactions.length ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="rounded-full bg-blue-50 p-3 mb-3">
                <Info className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Transactions Found</h3>
              <p className="text-neutral-500 max-w-md">
                {searchTerm 
                  ? `No transactions match your search for "${searchTerm}". Try a different search term.`
                  : 'There are no transactions recorded in the system for the selected period.'}
              </p>
              {searchTerm && (
                <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map(transaction => (
            <Card 
              key={transaction.id} 
              className="border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer"
              onClick={() => setSelectedTransaction(transaction.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1 p-2 rounded-full bg-blue-100">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium text-neutral-900">{transaction.item.name}</p>
                        <Badge variant="outline" className="ml-3 capitalize">
                          {transaction.type}
                        </Badge>
                        {transaction.isOverdue && (
                          <Badge variant="destructive" className="ml-1">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-neutral-600 mt-1">
                        <UserCircle className="h-4 w-4 mr-1" />
                        <span>{transaction.user.fullName}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="text-xs bg-neutral-100 px-2 py-1 rounded">
                          TRX-{transaction.id.toString().padStart(4, '0')}
                        </div>
                        <div className="text-xs bg-neutral-100 px-2 py-1 rounded">
                          {transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : "N/A"}
                        </div>
                        <div className="text-xs bg-neutral-100 px-2 py-1 rounded">
                          Item: {transaction.item.itemCode}
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
          <div className="flex justify-end mt-2">
            <Button variant="outline" className="text-xs">
              Export Transaction History
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Types for Report Builder
type ReportMetric = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'inventory' | 'transactions' | 'personnel';
};

type DateRangeOption = {
  id: string;
  label: string;
  startDate: () => Date;
  endDate: () => Date;
};

type ReportFormat = 'csv' | 'pdf' | 'excel';

// Report Builder Card Component
const ReportBuilderCard: React.FC = () => {
  const { toast } = useToast();
  const [selectedMetrics, setSelectedMetrics] = React.useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = React.useState<string>('thisMonth');
  const [customStartDate, setCustomStartDate] = React.useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = React.useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState<boolean>(false);
  const [exportFormat, setExportFormat] = React.useState<ReportFormat>('csv');
  const [reportName, setReportName] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  
  // Available metrics
  const availableMetrics: ReportMetric[] = [
    {
      id: 'inventoryStatus',
      label: 'Inventory Status',
      description: 'Current inventory levels and availability',
      icon: <Package className="h-4 w-4" />,
      category: 'inventory'
    },
    {
      id: 'categoryDistribution',
      label: 'Category Distribution',
      description: 'Distribution of items across categories',
      icon: <Package className="h-4 w-4" />,
      category: 'inventory'
    },
    {
      id: 'checkoutFrequency',
      label: 'Checkout Frequency',
      description: 'How often items are checked out',
      icon: <RotateCw className="h-4 w-4" />,
      category: 'transactions'
    },
    {
      id: 'overdueStats',
      label: 'Overdue Statistics',
      description: 'Overdue items and frequency',
      icon: <Clock className="h-4 w-4" />,
      category: 'transactions'
    },
    {
      id: 'personnelActivity',
      label: 'Personnel Activity',
      description: 'Personnel checkout/checkin activity',
      icon: <Users className="h-4 w-4" />,
      category: 'personnel'
    },
    {
      id: 'departmentUsage',
      label: 'Department Usage',
      description: 'Usage statistics by department',
      icon: <Users className="h-4 w-4" />,
      category: 'personnel'
    }
  ];
  
  // Date range options
  const dateRangeOptions: DateRangeOption[] = [
    {
      id: 'today',
      label: 'Today',
      startDate: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      },
      endDate: () => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return today;
      }
    },
    {
      id: 'thisWeek',
      label: 'This Week',
      startDate: () => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
        const monday = new Date(today.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
      },
      endDate: () => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? 0 : 7); // adjust when day is Sunday
        const sunday = new Date(today.setDate(diff));
        sunday.setHours(23, 59, 59, 999);
        return sunday;
      }
    },
    {
      id: 'thisMonth',
      label: 'This Month',
      startDate: () => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
      },
      endDate: () => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      }
    },
    {
      id: 'lastMonth',
      label: 'Last Month',
      startDate: () => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() - 1, 1);
      },
      endDate: () => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
      }
    },
    {
      id: 'thisQuarter',
      label: 'This Quarter',
      startDate: () => {
        const today = new Date();
        const quarter = Math.floor(today.getMonth() / 3);
        return new Date(today.getFullYear(), quarter * 3, 1);
      },
      endDate: () => {
        const today = new Date();
        const quarter = Math.floor(today.getMonth() / 3);
        return new Date(today.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
      }
    },
    {
      id: 'thisYear',
      label: 'This Year',
      startDate: () => {
        const today = new Date();
        return new Date(today.getFullYear(), 0, 1);
      },
      endDate: () => {
        const today = new Date();
        return new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
      }
    },
    {
      id: 'custom',
      label: 'Custom Range',
      startDate: () => new Date(),
      endDate: () => new Date()
    }
  ];
  
  // Toggle metric selection
  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId) 
        : [...prev, metricId]
    );
  };
  
  // Handle form submission
  const handleGenerateReport = async () => {
    if (selectedMetrics.length === 0) {
      toast({
        title: "No metrics selected",
        description: "Please select at least one metric for your report",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedDateRange === 'custom' && (!customStartDate || !customEndDate)) {
      toast({
        title: "Date range incomplete",
        description: "Please select both start and end dates for your custom range",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Get date range
    let startDate, endDate;
    if (selectedDateRange === 'custom') {
      startDate = customStartDate;
      endDate = customEndDate;
    } else {
      const option = dateRangeOptions.find(o => o.id === selectedDateRange);
      if (option) {
        startDate = option.startDate();
        endDate = option.endDate();
      }
    }
    
    // Prepare report generation
    const reportConfig = {
      metrics: selectedMetrics,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      format: exportFormat,
      name: reportName || `Report-${new Date().toISOString().split('T')[0]}`
    };
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      
      toast({
        title: "Report generated successfully",
        description: `Your ${exportFormat.toUpperCase()} report is ready for download`,
        variant: "default",
      });
      
      // In a real implementation, this would trigger a download of the generated report
      console.log("Generated report with config:", reportConfig);
      
      // Download mock file based on format
      const mockData = "Date,Item,User,Action\n" + 
        "2025-03-15,MacBook Pro,John Smith,Check Out\n" +
        "2025-03-14,iPhone 13 Pro,Sarah Rodriguez,Check In\n";
      
      const blob = new Blob([mockData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportConfig.name}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  };
  
  // Group metrics by category
  const groupedMetrics = React.useMemo(() => {
    const grouped: Record<string, ReportMetric[]> = {
      inventory: [],
      transactions: [],
      personnel: []
    };
    
    availableMetrics.forEach(metric => {
      grouped[metric.category].push(metric);
    });
    
    return grouped;
  }, [availableMetrics]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Builder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Report name input */}
          <div>
            <label htmlFor="reportName" className="block text-sm font-medium mb-1">
              Report Name
            </label>
            <input
              id="reportName"
              type="text"
              className="w-full px-3 py-2 rounded-md border border-input"
              placeholder="Enter report name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
          
          {/* Metrics selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Select Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(groupedMetrics).map(([category, metrics]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold capitalize">{category}</h4>
                  {metrics.map(metric => (
                    <div 
                      key={metric.id} 
                      className={`
                        flex items-center p-3 rounded-md cursor-pointer transition-colors
                        ${selectedMetrics.includes(metric.id) 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-neutral-50 border border-neutral-200 hover:border-neutral-300'}
                      `}
                      onClick={() => toggleMetric(metric.id)}
                    >
                      <div className={`
                        mr-3 p-1.5 rounded-full 
                        ${selectedMetrics.includes(metric.id) ? 'bg-primary/20 text-primary' : 'bg-neutral-200 text-neutral-600'}
                      `}>
                        {metric.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{metric.label}</div>
                        <div className="text-xs text-neutral-500">{metric.description}</div>
                      </div>
                      {selectedMetrics.includes(metric.id) && (
                        <div className="ml-auto">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Date range selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Select Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  value={selectedDateRange}
                  onValueChange={value => {
                    setSelectedDateRange(value);
                    setIsDatePickerOpen(value === 'custom');
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRangeOptions.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedDateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 rounded-md border border-input"
                      value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setCustomStartDate(date);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">End Date</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 rounded-md border border-input"
                      value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setCustomEndDate(date);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Export format selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Export Format</h3>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={exportFormat === 'csv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('csv')}
                className="flex-1"
              >
                CSV
              </Button>
              <Button
                type="button"
                variant={exportFormat === 'excel' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('excel')}
                className="flex-1"
              >
                Excel
              </Button>
              <Button
                type="button"
                variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('pdf')}
                className="flex-1"
              >
                PDF
              </Button>
            </div>
          </div>
          
          {/* Generate button */}
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating || selectedMetrics.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Report...
              </>
            ) : (
              'Generate Report'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomReportsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Custom Report Builder</h3>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
          Advanced
        </Badge>
      </div>
      
      <p className="text-neutral-600">
        Create custom reports by selecting metrics, date ranges, and export formats. 
        Reports can be downloaded immediately or scheduled for periodic delivery.
      </p>
      
      <ReportBuilderCard />
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
              <path d="M7.5 1C7.66148 1 7.8125 1.07422 7.91789 1.20508L10.9179 4.70508C11.0908 4.90723 11.0659 5.19922 10.8638 5.37207C10.6616 5.54492 10.3696 5.52002 10.1967 5.31787L8 2.70605V9.5C8 9.77637 7.77637 10 7.5 10C7.22363 10 7 9.77637 7 9.5V2.70605L4.80332 5.31787C4.63043 5.52002 4.33844 5.54492 4.13629 5.37207C3.93414 5.19922 3.90924 4.90723 4.08213 4.70508L7.08213 1.20508C7.1875 1.07422 7.33852 1 7.5 1ZM2.5 10C2.77637 10 3 10.2236 3 10.5V12C3 12.5522 3.44775 13 4 13H11C11.5522 13 12 12.5522 12 12V10.5C12 10.2236 12.2236 10 12.5 10C12.7764 10 13 10.2236 13 10.5V12C13 13.1045 12.1045 14 11 14H4C2.89551 14 2 13.1045 2 12V10.5C2 10.2236 2.22363 10 2.5 10Z" fill="currentColor" />
            </svg>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={getDefaultTab()} className="mt-6">
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
          <TabsTrigger value="customReports">Custom Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overdueItems" className="pt-4">
          <OverdueReportsTab />
        </TabsContent>
        <TabsContent value="inventory" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Inventory Status</CardTitle>
                <Select defaultValue="all">
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="checkedout">Checked Out</SelectItem>
                    <SelectItem value="lowstock">Low Stock</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <InventoryStatusChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Category Distribution</CardTitle>
                <Select defaultValue="quantity">
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="View by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quantity">By Quantity</SelectItem>
                    <SelectItem value="value">By Value</SelectItem>
                    <SelectItem value="items">By Item Count</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <CategoryDistributionChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Top Items by Usage</CardTitle>
                <Select defaultValue="30days">
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <TopItemsUsageChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Inventory Trend</CardTitle>
                <Select defaultValue="90days">
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                    <SelectItem value="alltime">All time</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <InventoryTrendChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="transactions" className="pt-4">
          <TransactionReportsTab />
        </TabsContent>
        <TabsContent value="personnel" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Personnel Activity</CardTitle>
                <Select defaultValue="30days">
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <PersonnelActivityChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Department Usage</CardTitle>
                <Select defaultValue="90days">
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <DepartmentUsageChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="customReports" className="pt-4">
          <CustomReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Personnel Activity Chart Component
const PersonnelActivityChart: React.FC = () => {
  const { toast } = useToast();
  const [period, setPeriod] = React.useState("30days");
  
  const { data: personnelActivity = [], isLoading, error } = useQuery<PersonnelActivity[]>({
    queryKey: ["/api/reports/personnel-activity"],
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching personnel activity data",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!personnelActivity || personnelActivity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
        <Users className="h-12 w-12 text-neutral-300 mb-3" />
        <h3 className="text-lg font-medium mb-1">No Personnel Activity Data</h3>
        <p className="text-neutral-500 max-w-md">
          There is no personnel activity data to display for the selected period.
        </p>
      </div>
    );
  }

  const chartData = personnelActivity.map(item => ({
    personnel: item.personnelName,
    checkouts: item.checkouts,
    returns: item.checkins,
    overdue: item.overdueItems
  }));

  return (
    <div className="h-[300px]">
      <ResponsiveBar
        data={chartData}
        keys={["checkouts", "returns", "overdue"]}
        indexBy="personnel"
        margin={{ top: 10, right: 20, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={["#4f46e5", "#10b981", "#f43f5e"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legendPosition: "middle",
          legendOffset: 40,
          truncateTickAt: 0
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Count",
          legendPosition: "middle",
          legendOffset: -40,
          truncateTickAt: 0
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 50,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: "hover",
                style: {
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
        role="application"
        ariaLabel="Personnel Activity Chart"
      />
    </div>
  );
};

// Department Usage Chart Component
const DepartmentUsageChart: React.FC = () => {
  const { toast } = useToast();
  
  const { data: departmentUsage = [], isLoading, error } = useQuery<DepartmentUsage[]>({
    queryKey: ["/api/reports/department-usage"],
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching department usage data",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!departmentUsage || departmentUsage.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
        <PieChart className="h-12 w-12 text-neutral-300 mb-3" />
        <h3 className="text-lg font-medium mb-1">No Department Usage Data</h3>
        <p className="text-neutral-500 max-w-md">
          There is no department usage data to display for the selected period.
        </p>
      </div>
    );
  }

  const chartData = departmentUsage.map(item => ({
    id: item.department,
    label: item.department,
    value: item.totalTransactions,
  }));

  return (
    <div className="h-[300px]">
      <ResponsivePie
        data={chartData}
        margin={{ top: 10, right: 20, bottom: 50, left: 20 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 50,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: "#999",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000"
                }
              }
            ]
          }
        ]}
      />
    </div>
  );
};

// Inventory Status Chart Component
const InventoryStatusChart: React.FC = () => {
  const { toast } = useToast();
  const [status, setStatus] = React.useState("all");
  
  const { data: inventory = [], isLoading, error } = useQuery<InventoryItemWithCategory[]>({
    queryKey: ["/api/inventory"],
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching inventory data",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
        <Package className="h-12 w-12 text-neutral-300 mb-3" />
        <h3 className="text-lg font-medium mb-1">No Inventory Data</h3>
        <p className="text-neutral-500 max-w-md">
          There is no inventory data to display at this time.
        </p>
      </div>
    );
  }

  // Calculate total available and checked out quantities
  const totalQuantity = inventory.reduce((sum, item) => sum + item.totalQuantity, 0);
  const availableQuantity = inventory.reduce((sum, item) => sum + item.availableQuantity, 0);
  const checkedOutQuantity = totalQuantity - availableQuantity;
  
  // Count items that are below their minimum stock level
  const lowStockItems = inventory.filter(item => item.availableQuantity <= item.minStockLevel).length;
  
  const chartData = [
    {
      id: "available",
      label: "Available",
      value: availableQuantity,
      color: "#10b981" // Green
    },
    {
      id: "checkedOut",
      label: "Checked Out",
      value: checkedOutQuantity,
      color: "#4f46e5" // Indigo
    },
    {
      id: "lowStock",
      label: "Low Stock",
      value: lowStockItems,
      color: "#f43f5e" // Red
    }
  ];

  return (
    <div className="h-[300px]">
      <ResponsivePie
        data={chartData}
        margin={{ top: 10, right: 20, bottom: 60, left: 20 }}
        innerRadius={0.6}
        padAngle={0.7}
        cornerRadius={3}
        colors={{ datum: 'data.color' }}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 50,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: "#999",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000"
                }
              }
            ]
          }
        ]}
      />
    </div>
  );
};

// Category Distribution Chart
const CategoryDistributionChart: React.FC = () => {
  const { toast } = useToast();
  const [viewBy, setViewBy] = React.useState("quantity");
  
  const { data: inventory = [], isLoading: isLoadingInventory, error: inventoryError } = useQuery<InventoryItemWithCategory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: categories = [], isLoading: isLoadingCategories, error: categoriesError } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  React.useEffect(() => {
    if (inventoryError) {
      toast({
        title: "Error fetching inventory data",
        description: inventoryError.message,
        variant: "destructive",
      });
    }
    if (categoriesError) {
      toast({
        title: "Error fetching categories data",
        description: categoriesError.message,
        variant: "destructive",
      });
    }
  }, [inventoryError, categoriesError, toast]);

  const isLoading = isLoadingInventory || isLoadingCategories;

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!inventory || inventory.length === 0 || !categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
        <Package className="h-12 w-12 text-neutral-300 mb-3" />
        <h3 className="text-lg font-medium mb-1">No Category Data</h3>
        <p className="text-neutral-500 max-w-md">
          There is no category data to display at this time.
        </p>
      </div>
    );
  }

  // Group inventory by category
  const categoryMap = new Map();
  
  inventory.forEach(item => {
    const categoryId = item.category.id;
    const categoryName = item.category.name;
    
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        id: categoryName,
        label: categoryName,
        totalQuantity: 0,
        availableQuantity: 0,
        itemCount: 0
      });
    }
    
    const category = categoryMap.get(categoryId);
    category.totalQuantity += item.totalQuantity;
    category.availableQuantity += item.availableQuantity;
    category.itemCount += 1;
  });
  
  // Convert map to array for chart
  let chartData = Array.from(categoryMap.values()).map(category => {
    let value = category.totalQuantity;
    
    if (viewBy === "items") {
      value = category.itemCount;
    }
    
    return {
      id: category.id,
      label: category.label,
      value: value
    };
  });

  return (
    <div className="h-[300px]">
      <ResponsivePie
        data={chartData}
        margin={{ top: 10, right: 20, bottom: 60, left: 20 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 50,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: "#999",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000"
                }
              }
            ]
          }
        ]}
      />
    </div>
  );
};

// Top Items by Usage Chart
const TopItemsUsageChart: React.FC = () => {
  const { toast } = useToast();
  const [timePeriod, setTimePeriod] = React.useState("30days");
  
  const { data: transactions = [], isLoading, error } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/transactions/details"],
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching transaction data",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
        <BarChart3 className="h-12 w-12 text-neutral-300 mb-3" />
        <h3 className="text-lg font-medium mb-1">No Usage Data</h3>
        <p className="text-neutral-500 max-w-md">
          There is no usage data to display for the selected period.
        </p>
      </div>
    );
  }

  // Filter transactions based on the selected time period
  const now = new Date();
  let cutoffDate = new Date();
  
  switch (timePeriod) {
    case "7days":
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case "30days":
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case "90days":
      cutoffDate.setDate(now.getDate() - 90);
      break;
    case "year":
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      cutoffDate.setDate(now.getDate() - 30);
  }
  
  const filteredTransactions = transactions.filter(trx => {
    if (!trx.timestamp) return false;
    return new Date(trx.timestamp) >= cutoffDate;
  });
  
  // Group transactions by item
  const itemUsageMap = new Map();
  
  filteredTransactions.forEach(trx => {
    const itemId = trx.item.id;
    const itemName = trx.item.name;
    
    if (!itemUsageMap.has(itemId)) {
      itemUsageMap.set(itemId, {
        item: itemName,
        checkouts: 0,
        returns: 0
      });
    }
    
    const itemUsage = itemUsageMap.get(itemId);
    if (trx.type === "checkout") {
      itemUsage.checkouts += 1;
    } else if (trx.type === "checkin") {
      itemUsage.returns += 1;
    }
  });
  
  // Convert to array and sort by total usage
  let itemUsage = Array.from(itemUsageMap.values())
    .map(item => ({
      ...item,
      totalUsage: item.checkouts + item.returns
    }))
    .sort((a, b) => b.totalUsage - a.totalUsage)
    .slice(0, 5); // Get top 5 items
  
  // Format for the bar chart - shorten names even more to prevent overlap
  const chartData = itemUsage.map(item => ({
    item: item.item.length > 10 ? item.item.substring(0, 10) + '...' : item.item,
    checkouts: item.checkouts,
    returns: item.returns
  }));

  return (
    <div className="h-[300px]">
      {chartData.length > 0 ? (
        <ResponsiveBar
          data={chartData}
          keys={["checkouts", "returns"]}
          indexBy="item"
          margin={{ top: 10, right: 20, bottom: 70, left: 60 }}
          padding={0.2}
          groupMode="grouped"
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={["#4f46e5", "#10b981"]}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 10,
            tickRotation: -45,
            legendPosition: "middle",
            legendOffset: 45,
            truncateTickAt: 0
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Count",
            legendPosition: "middle",
            legendOffset: -40,
            truncateTickAt: 0
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 50,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: "hover",
                  style: {
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
          role="application"
          ariaLabel="Top Items by Usage"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-neutral-500">No usage data available for this period</p>
        </div>
      )}
    </div>
  );
};

// Inventory Trend Chart
const InventoryTrendChart: React.FC = () => {
  const { toast } = useToast();
  const [timePeriod, setTimePeriod] = React.useState("90days");
  
  const { data: transactions = [], isLoading, error } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/transactions/details"],
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching transaction data",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
        <BarChart3 className="h-12 w-12 text-neutral-300 mb-3" />
        <h3 className="text-lg font-medium mb-1">No Trend Data</h3>
        <p className="text-neutral-500 max-w-md">
          There is no transaction data to display inventory trends for the selected period.
        </p>
      </div>
    );
  }

  // Filter transactions based on the selected time period
  const now = new Date();
  let cutoffDate = new Date();
  
  switch (timePeriod) {
    case "30days":
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case "90days":
      cutoffDate.setDate(now.getDate() - 90);
      break;
    case "year":
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    case "alltime":
      cutoffDate = new Date(0); // Beginning of time
      break;
    default:
      cutoffDate.setDate(now.getDate() - 90);
  }
  
  const filteredTransactions = transactions.filter(trx => {
    if (!trx.timestamp) return false;
    return new Date(trx.timestamp) >= cutoffDate;
  });
  
  // Group transactions by month and type (checkout or checkin)
  const monthlyDataMap = new Map();
  
  filteredTransactions.forEach(trx => {
    if (!trx.timestamp) return;
    
    const date = new Date(trx.timestamp);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    
    if (!monthlyDataMap.has(monthKey)) {
      monthlyDataMap.set(monthKey, {
        month: monthLabel,
        checkouts: 0,
        checkins: 0
      });
    }
    
    const monthData = monthlyDataMap.get(monthKey);
    if (trx.type === "checkout") {
      monthData.checkouts += 1;
    } else if (trx.type === "checkin") {
      monthData.checkins += 1;
    }
  });
  
  // Convert to array and sort by date
  let monthlyData = Array.from(monthlyDataMap.values());
  
  // Sort by date (assuming month format is MMM YYYY)
  monthlyData.sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Format for chart
  const chartData = monthlyData.map(data => ({
    month: data.month,
    "Items Checked Out": data.checkouts,
    "Items Returned": data.checkins
  }));

  return (
    <div className="h-[300px]">
      {chartData.length > 0 ? (
        <ResponsiveBar
          data={chartData}
          keys={["Items Checked Out", "Items Returned"]}
          indexBy="month"
          margin={{ top: 10, right: 20, bottom: 70, left: 60 }}
          padding={0.2}
          groupMode="grouped"
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={["#4f46e5", "#10b981"]}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 10,
            tickRotation: -45,
            legendPosition: "middle",
            legendOffset: 45,
            truncateTickAt: 0
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Items",
            legendPosition: "middle",
            legendOffset: -40,
            truncateTickAt: 0
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 50,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: "hover",
                  style: {
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
          role="application"
          ariaLabel="Inventory Trend Chart"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-neutral-500">No trend data available for this period</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;