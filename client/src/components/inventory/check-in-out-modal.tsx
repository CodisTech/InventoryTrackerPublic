import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Search, User as UserIcon, Users as UsersIcon, Minus as MinusIcon, Plus as PlusIcon, Printer, UserCheck } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InventoryItemWithCategory, User, Personnel, Transaction } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { format } from "date-fns";

interface CheckInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: InventoryItemWithCategory | null;
}

// Interface for personnel that can check out items
type Person = {
  id: number;
  fullName: string;
  division?: string;
  department?: string;
  jDial?: string | null;
};



const CheckInOutModal: React.FC<CheckInOutModalProps> = ({
  isOpen,
  onClose,
  selectedItem
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [operationType, setOperationType] = useState<"check-in" | "check-out">("check-out");
  const [itemId, setItemId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isPersonnelSelectOpen, setIsPersonnelSelectOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  
  // Person state to control the workflow
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  // Quantity state for multi-item checkout
  const [quantity, setQuantity] = useState<number>(1);
  // Administrator selection for tracking
  const [selectedAdministrator, setSelectedAdministrator] = useState<number | null>(null);
  
  const { data: items = [] } = useQuery<InventoryItemWithCategory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
  });

  // Reset form when modal is opened/closed or when selected item changes
  useEffect(() => {
    if (isOpen) {
      // Always reset user/personnel selection
      setSelectedPerson(null);
      setUserId("");
      
      // Set up for the selected item
      if (selectedItem) {
        setItemId(selectedItem.id.toString());
        
        // If item is checked out, default to check-in, otherwise default to check-out
        if (selectedItem.checkedOutBy) {
          setOperationType("check-in");
          // If we're checking in, find the user who has this item checked out
          if (selectedItem.checkedOutBy && selectedItem.checkedOutBy.id !== undefined) {
            setUserId(selectedItem.checkedOutBy.id.toString());
            // Create a Person object for the user who has the item
            const personWithItem: Person = {
              id: selectedItem.checkedOutBy.id,
              fullName: selectedItem.checkedOutBy.fullName,
              division: selectedItem.checkedOutBy.division || "",
              department: selectedItem.checkedOutBy.department || "",
              jDial: selectedItem.checkedOutBy.jDial || null
            };
            setSelectedPerson(personWithItem);
          }
        } else {
          setOperationType("check-out");
        }
      } else {
        setOperationType("check-out");
      }
      
      setNotes("");
      // Reset quantity to 1
      setQuantity(1);
      // Set current user as default administrator
      setSelectedAdministrator(user?.id || null);
    }
  }, [isOpen, selectedItem]);

  // Handle printing of transaction document
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

    // Find the selected item
    const item = items.find(i => i.id.toString() === itemId);
    if (!item) {
      toast({
        title: "Print failed",
        description: "Could not find item information.",
        variant: "destructive",
      });
      printWindow.close();
      return;
    }
    
    // Find the selected administrator
    const administrator = users.find(u => u.id === selectedAdministrator);
    if (!administrator) {
      toast({
        title: "Print warning",
        description: "Administrator information not available for receipt.",
        variant: "default",
      });
      // Continue printing without admin info
    }

    // Current date and time
    const now = new Date();
    const formattedDate = format(now, "MMMM dd, yyyy");
    const formattedTime = format(now, "h:mm a");

    // Create HTML content for printing
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${operationType === "check-out" ? "Checkout" : "Return"} Receipt</title>
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
              margin-bottom: 5px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .signatures {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
            }
            .signature-line {
              width: 45%;
              margin-top: 80px;
              border-top: 1px solid #333;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Inventory ${operationType === "check-out" ? "Checkout" : "Return"} Receipt</h1>
            <p>Date: ${formattedDate} at ${formattedTime}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Person Information</div>
            <p><strong>Name:</strong> ${selectedPerson?.fullName || "Unknown"}</p>
            ${selectedPerson?.division ? `<p><strong>Division:</strong> ${selectedPerson.division}</p>` : ''}
            ${selectedPerson?.department ? `<p><strong>Department:</strong> ${selectedPerson.department}</p>` : ''}
            ${selectedPerson?.jDial ? `<p><strong>J-Dial:</strong> ${selectedPerson.jDial}</p>` : ''}
          </div>
          
          <div class="section">
            <div class="section-title">Item Information</div>
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Item Code</th>
                  <th>Category</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${item.name}</td>
                  <td>${item.itemCode}</td>
                  <td>${item.category.name}</td>
                  <td>${quantity}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          ${notes ? `
            <div class="section">
              <div class="section-title">Notes</div>
              <p>${notes}</p>
            </div>
          ` : ''}
          
          ${administrator ? `
            <div class="section">
              <div class="section-title">Administrator Information</div>
              <p><strong>Name:</strong> ${administrator.fullName}</p>
              <p><strong>Role:</strong> ${administrator.role}</p>
            </div>
          ` : ''}
          
          <div class="signatures">
            <div class="signature-line">
              ${operationType === "check-out" ? "Issued By" : "Received By"} (${administrator ? administrator.fullName : "Inventory Manager"})
            </div>
            <div class="signature-line">
              ${operationType === "check-out" ? "Received By" : "Returned By"} (${selectedPerson?.fullName || "User"})
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Auto-print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const transactionMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        console.log('Sending transaction data:', data);
        // Pass data directly, not wrapped in an object
        const res = await apiRequest("POST", "/api/transactions", { 
          data: data // This is the correct format for apiRequest
        });
        return await res.json();
      } catch (error) {
        console.error('Transaction mutation error:', error);
        throw error;
      }
    },
    onSuccess: (transaction) => {
      const selectedItemName = items.find(i => i.id.toString() === itemId)?.name || "Item";
      
      toast({
        title: `${selectedItemName} ${operationType === "check-out" ? "checked out to" : "checked in from"} ${selectedPerson?.fullName}`,
        description: "The inventory has been updated.",
      });
      // Invalidate all necessary queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/overdue-items"] });
      
      // For check-out operations, show print dialog
      if (operationType === "check-out") {
        setCompletedTransaction(transaction);
        setIsPrintModalOpen(true);
      } else {
        onClose();
      }
    },
    onError: (error: Error) => {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction failed",
        description: error.message || "There was an error processing the transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    // Check if user is selected
    if (!userId) {
      toast({
        title: "Please select a person",
        variant: "destructive",
      });
      return;
    }

    // Verify item selection
    if (!itemId) {
      toast({
        title: "Please select an item",
        variant: "destructive",
      });
      return;
    }

    // For check-in operations, verify that the selected person actually has this item checked out
    if (operationType === "check-in") {
      const item = items.find(i => i.id.toString() === itemId);
      if (item && (!item.checkedOutBy || !item.checkedOutBy.id || item.checkedOutBy.id.toString() !== userId)) {
        toast({
          title: "Invalid check-in",
          description: `${selectedPerson?.fullName || "This person"} does not have this item checked out.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Check if administrator is selected
    if (!selectedAdministrator) {
      toast({
        title: "Please select an administrator",
        variant: "destructive",
      });
      return;
    }

    // Create the transaction object with the selected quantity and administrator
    const now = new Date();
    const transaction: any = {
      itemId: parseInt(itemId),
      userId: parseInt(userId),
      administratorId: selectedAdministrator, // Use selected administrator
      type: operationType,
      quantity: quantity, // Use the quantity from state
      notes,
      // Include proper date fields as ISO strings based on operation type
      timestamp: now.toISOString(),
      ...(operationType === 'check-out' && {
        dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      }),
      ...(operationType === 'check-in' && {
        returnDate: now.toISOString()
      })
    };

    // Process the transaction
    transactionMutation.mutate(transaction);
  };
  
  // Handle personnel selection
  const handlePersonnelSelect = (personnelId: string) => {
    setUserId(personnelId);
    const person = allPeople.find(p => p.id.toString() === personnelId);
    if (person) {
      setSelectedPerson(person);
      setIsPersonnelSelectOpen(false);
    }
  };
  
  // Only use personnel from the personnel database, not users
  const allPeople: Person[] = personnel.map(p => ({
    id: p.id,
    fullName: `${p.firstName} ${p.lastName}`,
    division: p.division,
    department: p.department,
    jDial: p.jDial
  }));
  
  // For check-in, we need to know which items are checked out and who has them
  const checkedOutItems = items.filter(item => {
    const availableQty = item.availableQuantity || 0;
    const totalQty = item.totalQuantity || 0;
    return availableQty < totalQty;
  });
  
  // Get the list of personnel IDs who have items checked out
  const personnelWithItems = checkedOutItems
    .filter(item => item.checkedOutBy)
    .map(item => item.checkedOutBy!.id)
    .filter((value, index, self) => self.indexOf(value) === index);
  
  // Filter personnel based on operation type
  // For check-in: Only show personnel with items checked out
  // For check-out: Show all personnel
  const eligiblePeople = operationType === "check-in" 
    ? allPeople.filter(person => personnelWithItems.includes(person.id))
    : allPeople;
  
  // Automatic selection for check-in when there's only one person with items
  useEffect(() => {
    if (operationType === "check-in" && !selectedPerson && eligiblePeople.length === 1) {
      const onlyPerson = eligiblePeople[0];
      setUserId(onlyPerson.id.toString());
      setSelectedPerson(onlyPerson);
    }
  }, [operationType, eligiblePeople, selectedPerson]);
  
  // Filter people based on search term
  const filteredPeople = eligiblePeople.filter(person => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      person.fullName.toLowerCase().includes(search) ||
      (person.division && person.division.toLowerCase().includes(search)) ||
      (person.department && person.department.toLowerCase().includes(search)) ||
      (person.jDial && person.jDial.toLowerCase().includes(search))
    );
  });

  // Filter items based on operation type:
  // For check-out: Only show items with available quantity
  // For check-in: Only show items that are checked out by the selected person
  const availableItems = operationType === "check-out"
    ? items.filter(item => item.availableQuantity > 0)
    : selectedPerson
      ? items.filter(item => {
          if (!item.checkedOutBy) return false;
          return item.checkedOutBy.id === selectedPerson.id;
        })
      : [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedItem
                ? (selectedItem.checkedOutBy 
                  ? `Check In Item from ${selectedItem.checkedOutBy.fullName}` 
                  : "Check Out Item")
                : "Check In/Out Item"
              }
            </DialogTitle>
            {selectedItem && (
              <div className="text-sm text-muted-foreground mt-1">
                {selectedItem.checkedOutBy ? (
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span>
                      Currently checked out to <strong>{selectedItem.checkedOutBy.fullName}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span>Available for checkout</span>
                  </div>
                )}
              </div>
            )}
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Operation selection */}
            <div className="space-y-2">
              <Label>Operation Type</Label>
              <RadioGroup
                value={operationType}
                onValueChange={(v) => {
                  const newType = v as "check-in" | "check-out";
                  setOperationType(newType);
                  // Reset selections when switching operation types
                  if (!selectedItem) {
                    setItemId("");
                    setSelectedPerson(null);
                    setUserId("");
                  }
                }}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="check-out" id="checkout" />
                  <Label htmlFor="checkout">Check Out</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="check-in" id="checkin" />
                  <Label htmlFor="checkin">Check In</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Personnel selection */}
            <div className="space-y-2">
              <Label htmlFor="user-select">
                {operationType === "check-in" 
                  ? "Select Person to Check In From" 
                  : "Select Person to Check Out To"}
              </Label>
              <Popover open={isPersonnelSelectOpen} onOpenChange={setIsPersonnelSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={operationType === "check-in" ? "secondary" : "outline"}
                    role="combobox"
                    aria-expanded={isPersonnelSelectOpen}
                    className={cn(
                      "w-full justify-between",
                      operationType === "check-in" && eligiblePeople.length > 0 && "bg-amber-50 border-amber-200 text-amber-900"
                    )}
                    // Don't disable selection based on the existence of checkedOutBy
                  >
                    {selectedPerson 
                      ? selectedPerson.fullName 
                      : operationType === "check-in" 
                        ? `Select from ${eligiblePeople.length} personnel with items...`
                        : "Select person..."
                    }
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search personnel by name, division, or department..." 
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>No person found.</CommandEmpty>
                      <CommandGroup heading="Personnel">
                        {filteredPeople.map((person) => {
                          // For check-in, find items this person has checked out
                          const checkedOutItemsByPerson = operationType === "check-in" 
                            ? items.filter(item => 
                                item.checkedOutBy && item.checkedOutBy.id === person.id
                              ) 
                            : [];
                            
                          return (
                            <CommandItem
                              key={`personnel-${person.id}`}
                              value={person.id.toString()}
                              onSelect={handlePersonnelSelect}
                              className="flex flex-col items-start py-3"
                            >
                              <div className="flex w-full items-center">
                                <div className="mr-2 flex items-center justify-center rounded-full bg-primary/10 p-1">
                                  <UsersIcon className="h-3 w-3" />
                                </div>
                                <span className="font-medium">{person.fullName}</span>
                                {person.division && (
                                  <span className="ml-auto text-xs text-muted-foreground">
                                    {person.division}
                                  </span>
                                )}
                              </div>
                              
                              {/* Show department and j-dial if available */}
                              {(person.department || person.jDial) && (
                                <div className="pl-6 mt-1 text-xs text-muted-foreground">
                                  {person.department && <span>{person.department}</span>}
                                  {person.department && person.jDial && <span> • </span>}
                                  {person.jDial && <span>J-Dial: {person.jDial}</span>}
                                </div>
                              )}
                              
                              {/* For check-in, show which items this person has */}
                              {operationType === "check-in" && checkedOutItemsByPerson.length > 0 && (
                                <div className="pl-6 mt-1 text-xs">
                                  <span className="text-amber-600 font-medium">
                                    Has {checkedOutItemsByPerson.length} item{checkedOutItemsByPerson.length > 1 ? 's' : ''} checked out
                                  </span>
                                </div>
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedPerson && (
                <p className="text-xs text-muted-foreground">
                  {operationType === "check-out" ? "Checking out to: " : "Checking in from: "}
                  <span className="font-medium">{selectedPerson.fullName}</span>
                  {selectedPerson.division && (
                    <span className="ml-1">({selectedPerson.division})</span>
                  )}
                </p>
              )}
            </div>
            
            {/* Item Selection */}
            <div className="space-y-2">
              <Label htmlFor="item-select">Select Item</Label>
              <Select
                value={itemId}
                onValueChange={setItemId}
                disabled={!!selectedItem}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an item..." />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.itemCode}: {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableItems.length === 0 && (
                <p className="text-xs text-destructive">
                  {operationType === "check-out" 
                    ? "No items available for checkout" 
                    : checkedOutItems.length === 0
                      ? "No items are currently checked out"
                      : selectedPerson
                        ? `${selectedPerson.fullName} has no items checked out` 
                        : "Please select a person with checked out items"}
                </p>
              )}
              
              {/* Additional information about the selected item */}
              {itemId && items.find(i => i.id.toString() === itemId) && (
                <div className="mt-2 p-2 bg-muted/50 rounded-md">
                  <div className="text-sm font-medium">
                    {items.find(i => i.id.toString() === itemId)?.name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center space-x-2">
                    <span className="bg-primary/10 px-2 py-1 rounded">
                      {items.find(i => i.id.toString() === itemId)?.itemCode}
                    </span>
                    <span>
                      Category: {items.find(i => i.id.toString() === itemId)?.category.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quantity selector */}
            {operationType === "check-out" && itemId && (
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <MinusIcon className="h-3 w-3" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1) {
                        // Get the selected item to check available quantity
                        const selectedItem = items.find(i => i.id.toString() === itemId);
                        if (selectedItem) {
                          // Ensure we can't check out more than available
                          const maxQuantity = selectedItem.availableQuantity;
                          setQuantity(Math.min(val, maxQuantity));
                        } else {
                          setQuantity(val);
                        }
                      }
                    }}
                    className="w-16 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      // Get the selected item to check available quantity
                      const selectedItem = items.find(i => i.id.toString() === itemId);
                      if (selectedItem) {
                        // Ensure we can't check out more than available
                        const maxQuantity = selectedItem.availableQuantity;
                        setQuantity(Math.min(quantity + 1, maxQuantity));
                      } else {
                        setQuantity(quantity + 1);
                      }
                    }}
                    disabled={
                      // Disable if we've reached max available quantity
                      !!items.find(i => i.id.toString() === itemId) &&
                      quantity >= items.find(i => i.id.toString() === itemId)!.availableQuantity
                    }
                  >
                    <PlusIcon className="h-3 w-3" />
                  </Button>
                  
                  {/* Display max available */}
                  {itemId && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {items.find(i => i.id.toString() === itemId)?.availableQuantity} available
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Administrator selection */}
            <div className="space-y-2">
              <Label htmlFor="admin-select">Administrator</Label>
              <Select
                value={selectedAdministrator?.toString() || ""}
                onValueChange={(value) => setSelectedAdministrator(parseInt(value))}
              >
                <SelectTrigger id="admin-select" className="w-full">
                  <SelectValue placeholder="Select administrator" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === "admin" || u.role === "super_admin").map((admin) => (
                    <SelectItem key={admin.id} value={admin.id.toString()}>
                      {admin.fullName} {admin.id === user?.id && "(You)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The administrator is responsible for this {operationType.replace('-', ' ')} operation
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about condition, purpose, etc."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSubmit}
              disabled={transactionMutation.isPending}
              className={operationType === "check-out" ? "bg-primary" : "bg-secondary"}
            >
              {transactionMutation.isPending 
                ? "Processing..." 
                : operationType === "check-out" 
                  ? `Check Out ${quantity > 1 ? `${quantity} units` : ''} to ${selectedPerson?.fullName || "..."}`
                  : `Check In from ${selectedPerson?.fullName || "..."}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Print Confirmation Dialog */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Print Checkout Receipt</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              Would you like to print a receipt for this checkout?
            </p>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Printer className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <DialogFooter className="flex sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPrintModalOpen(false);
                onClose();
              }}
            >
              Skip
            </Button>
            <Button
              type="button"
              onClick={() => {
                printTransaction();
                setIsPrintModalOpen(false);
                onClose();
              }}
            >
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckInOutModal;