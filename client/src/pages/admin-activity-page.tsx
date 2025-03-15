import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { TransactionWithDetails, User } from "@shared/schema";
import { CalendarRange } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Download, 
  Filter, 
  Eye, 
  RefreshCw,
  Clock,
  FileText
} from "lucide-react";
import { format as formatDate } from "date-fns";

const AdminActivityPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedAdmin, setSelectedAdmin] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activityType, setActivityType] = useState<string>("all");

  const { data: transactions = [], isLoading, error, refetch } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/transactions/details"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading activities",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filter transactions by admin, date range, and activity type
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by admin
    if (selectedAdmin !== "all" && transaction.administratorId !== parseInt(selectedAdmin)) {
      return false;
    }
    
    // Filter by date range
    if (dateRange?.from && dateRange?.to && transaction.timestamp) {
      const transactionDate = new Date(transaction.timestamp);
      if (transactionDate < dateRange.from || transactionDate > dateRange.to) {
        return false;
      }
    }
    
    // Filter by activity type
    if (activityType !== "all" && transaction.type !== activityType) {
      return false;
    }
    
    return true;
  });

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = [
      "Transaction ID", 
      "Type", 
      "Item", 
      "Personnel", 
      "Administrator", 
      "Quantity", 
      "Date", 
      "Due Date", 
      "Return Date", 
      "Notes"
    ];
    
    const rows = filteredTransactions.map(trx => [
      `TRX-${trx.id.toString().padStart(4, "0")}`,
      trx.type,
      trx.item ? trx.item.name : `Item #${trx.itemId}`,
      trx.person ? `${trx.person.firstName} ${trx.person.lastName}` : 
        (trx.user ? trx.user.fullName : `Personnel #${trx.userId}`),
      trx.administrator ? trx.administrator.fullName : "N/A",
      trx.quantity.toString(),
      trx.timestamp ? format(new Date(trx.timestamp), "MMM dd, yyyy h:mm a") : "N/A",
      trx.dueDate ? format(new Date(trx.dueDate), "MMM dd, yyyy h:mm a") : "N/A",
      trx.returnDate ? format(new Date(trx.returnDate), "MMM dd, yyyy h:mm a") : "Not returned",
      trx.notes || "N/A"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set link attributes
    link.setAttribute('href', url);
    link.setAttribute('download', `admin-activity-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.display = 'none';
    
    // Append to body, click, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "The activity report has been downloaded as a CSV file.",
    });
  };

  const resetFilters = () => {
    setSelectedAdmin("all");
    setDateRange(undefined);
    setActivityType("all");
    setIsFilterOpen(false);
  };

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
      header: "Administrator",
      accessorKey: "administratorId",
      cell: (transaction: TransactionWithDetails) => {
        return transaction.administrator ? (
          <div className="font-medium">{transaction.administrator.fullName}</div>
        ) : "-";
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
        <Button
          variant="ghost"
          size="icon"
          title="View Transaction Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const adminOptions = users
    .filter(user => user.role === "admin" || user.role === "superadmin")
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-5">
          <CardTitle className="text-2xl font-medium text-neutral-900">Administrator Activity Logs</CardTitle>
          <div className="flex space-x-2">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Options</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Administrator</label>
                    <Select
                      value={selectedAdmin}
                      onValueChange={setSelectedAdmin}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select administrator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Administrators</SelectItem>
                        {adminOptions.map(admin => (
                          <SelectItem key={admin.id} value={admin.id.toString()}>
                            {admin.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="flex flex-col space-y-2">
                      <div className="grid gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="date"
                              variant={"outline"}
                              className="w-full justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {dateRange?.from ? (
                                dateRange.to ? (
                                  <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(dateRange.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarRange
                              mode="range"
                              selected={dateRange}
                              onSelect={setDateRange as any}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Activity Type</label>
                    <Select
                      value={activityType}
                      onValueChange={setActivityType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Activities</SelectItem>
                        <SelectItem value="check-out">Check Out</SelectItem>
                        <SelectItem value="check-in">Check In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Reset
                    </Button>
                    <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            
            <Button onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedAdmin !== "all" && (
              <Badge className="flex items-center" variant="outline">
                <span className="mr-1">Admin:</span>
                {users.find(u => u.id.toString() === selectedAdmin)?.fullName || "Unknown"}
                <button
                  className="ml-1 rounded-full p-1 hover:bg-accent"
                  onClick={() => setSelectedAdmin("all")}
                >
                  ×
                </button>
              </Badge>
            )}
            
            {dateRange?.from && dateRange?.to && (
              <Badge className="flex items-center" variant="outline">
                <Calendar className="mr-1 h-3 w-3" />
                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                <button
                  className="ml-1 rounded-full p-1 hover:bg-accent"
                  onClick={() => setDateRange(undefined)}
                >
                  ×
                </button>
              </Badge>
            )}
            
            {activityType !== "all" && (
              <Badge className="flex items-center" variant="outline">
                {activityType === "check-out" ? (
                  <Clock className="mr-1 h-3 w-3" />
                ) : (
                  <RefreshCw className="mr-1 h-3 w-3" />
                )}
                {activityType === "check-out" ? "Check Out" : "Check In"}
                <button
                  className="ml-1 rounded-full p-1 hover:bg-accent"
                  onClick={() => setActivityType("all")}
                >
                  ×
                </button>
              </Badge>
            )}
            
            {(selectedAdmin !== "all" || dateRange || activityType !== "all") && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6">
                Clear All
              </Button>
            )}
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <div className="text-xl font-medium">No activity records found</div>
              <div className="text-sm text-muted-foreground">
                {transactions.length > 0 
                  ? "Try adjusting your filters to see more results" 
                  : "No administrator activity has been recorded yet"}
              </div>
              {transactions.length === 0 && (
                <div className="text-sm text-muted-foreground mt-4">
                  Administrator activity is tracked when inventory items are checked in or out.
                </div>
              )}
            </div>
          ) : (
            <DataTable
              data={filteredTransactions}
              columns={columns}
              searchable
              searchPlaceholder="Search activity logs..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivityPage;