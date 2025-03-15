import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X, Plus, Minus, User as UserIcon, Users as UsersIcon, Loader2, Printer, UserCheck } from "lucide-react";
import { InventoryItemWithCategory, Personnel, Transaction } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MultiItemCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Person = {
  id: number;
  fullName: string;
  division?: string;
  department?: string;
  jDial?: string | null;
};

type SelectedItem = {
  id: number;
  quantity: number;
};

const MultiItemCheckoutModal: React.FC<MultiItemCheckoutModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedAdministrator, setSelectedAdministrator] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [personnelSearchTerm, setPersonnelSearchTerm] = useState<string>("");
  const [itemSearchTerm, setItemSearchTerm] = useState<string>("");
  const [isPersonnelSelectOpen, setIsPersonnelSelectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [completedTransactions, setCompletedTransactions] = useState<Transaction[]>([]);

  // Get inventory items and personnel
  const { data: items = [] } = useQuery<InventoryItemWithCategory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
  });
  
  // Fetch admin users
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });
  
  // Filter only admin and superadmin users
  const adminUsers = users.filter(user => 
    user.role === "admin" || user.role === "superadmin"
  );

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setSelectedPerson(null);
      setSelectedItems([]);
      setNotes("");
      setPersonnelSearchTerm("");
      setItemSearchTerm("");
    }
  }, [isOpen]);

  // Generate Person objects from personnel data
  const allPeople: Person[] = personnel.map(p => ({
    id: p.id,
    fullName: `${p.firstName} ${p.lastName}`,
    division: p.division,
    department: p.department,
    jDial: p.jDial
  }));

  // Filter people based on search term
  const filteredPeople = allPeople.filter(person => {
    if (!personnelSearchTerm) return true;
    
    const search = personnelSearchTerm.toLowerCase();
    return (
      person.fullName.toLowerCase().includes(search) ||
      (person.division && person.division.toLowerCase().includes(search)) ||
      (person.department && person.department.toLowerCase().includes(search)) ||
      (person.jDial && person.jDial.toLowerCase().includes(search))
    );
  });

  // Handle personnel selection
  const handlePersonnelSelect = (personnelId: string) => {
    const person = allPeople.find(p => p.id.toString() === personnelId);
    if (person) {
      setSelectedPerson(person);
      setIsPersonnelSelectOpen(false);
    }
  };

  // Handle item selection
  const handleItemSelect = (itemId: number, isSelected: boolean) => {
    if (isSelected) {
      // Add item if not already in the list
      if (!selectedItems.some(item => item.id === itemId)) {
        setSelectedItems([...selectedItems, { id: itemId, quantity: 1 }]);
      }
    } else {
      // Remove item
      setSelectedItems(selectedItems.filter(item => item.id !== itemId));
    }
  };

  // Handle quantity change
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const maxQuantity = item.availableQuantity;
    const validQuantity = Math.min(Math.max(1, newQuantity), maxQuantity);
    
    setSelectedItems(selectedItems.map(item => 
      item.id === itemId ? { ...item, quantity: validQuantity } : item
    ));
  };

  // Handle printing of transaction documents
  const printTransactions = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print failed",
        description: "Unable to open print window. Please check your browser settings.",
        variant: "destructive",
      });
      return;
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
          <title>Checkout Receipt</title>
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
            <h1>Inventory Checkout Receipt</h1>
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
            <div class="section-title">Items Checked Out</div>
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
                ${selectedItems.map(selectedItem => {
                  const item = items.find(i => i.id === selectedItem.id);
                  if (!item) return '';
                  return `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.itemCode}</td>
                      <td>${item.category.name}</td>
                      <td>${selectedItem.quantity}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            ${notes ? `
              <div class="section">
                <div class="section-title">Notes</div>
                <p>${notes}</p>
              </div>
            ` : ''}
          </div>
          
          <div class="signatures">
            <div class="signature-line">
              Checked Out By (Inventory Manager)
            </div>
            <div class="signature-line">
              Received By (${selectedPerson?.fullName || "User"})
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

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedPerson) {
      toast({
        title: "Please select a person",
        variant: "destructive",
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: "Please select at least one item",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const transactions: Transaction[] = [];
      
      // Create a transaction for each selected item
      for (const selectedItem of selectedItems) {
        const item = items.find(i => i.id === selectedItem.id);
        if (!item) continue;
        
        const transaction = {
          itemId: selectedItem.id,
          userId: selectedPerson.id,
          type: "check-out" as const,
          quantity: selectedItem.quantity,
          notes,
        };
        
        const response = await apiRequest("POST", "/api/transactions", transaction);
        const savedTransaction = await response.json();
        transactions.push(savedTransaction);
      }
      
      // Success message
      toast({
        title: `${selectedItems.length} items checked out to ${selectedPerson.fullName}`,
        description: "The inventory has been updated.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/overdue-items"] });
      
      // Store completed transactions and show print modal
      setCompletedTransactions(transactions);
      setIsPrintModalOpen(true);
      
      // Close the checkout modal
      onClose();
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  // Filter only available items and apply search term
  const filteredItems = items
    .filter(item => item.availableQuantity > 0)
    .filter(item => {
      if (!itemSearchTerm) return true;
      
      const search = itemSearchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(search) ||
        item.itemCode.toLowerCase().includes(search) ||
        item.category.name.toLowerCase().includes(search) ||
        item.notes?.toLowerCase().includes(search)
      );
    });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Check Out Multiple Items</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Personnel selection */}
            <div className="space-y-2">
              <Label htmlFor="user-select">Select Person to Check Out To</Label>
              <Popover open={isPersonnelSelectOpen} onOpenChange={setIsPersonnelSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isPersonnelSelectOpen}
                    className="w-full justify-between"
                  >
                    {selectedPerson ? selectedPerson.fullName : "Select person..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search personnel by name, division, or department..." 
                      value={personnelSearchTerm}
                      onValueChange={setPersonnelSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>No person found.</CommandEmpty>
                      <CommandGroup heading="Personnel">
                        {filteredPeople.map((person) => (
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
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedPerson && (
                <p className="text-xs text-muted-foreground">
                  Checking out to: <span className="font-medium">{selectedPerson.fullName}</span>
                  {selectedPerson.division && (
                    <span className="ml-1">({selectedPerson.division})</span>
                  )}
                </p>
              )}
            </div>
            
            {/* Item Selection */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="items-select">Select Items</Label>
                <div className="text-xs text-muted-foreground">
                  {filteredItems.length} of {items.filter(item => item.availableQuantity > 0).length} available items
                </div>
              </div>
              
              <div className="relative mb-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items by name, code, or category..."
                  className="pl-8"
                  value={itemSearchTerm}
                  onChange={(e) => setItemSearchTerm(e.target.value)}
                />
                {itemSearchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7"
                    onClick={() => setItemSearchTerm("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {filteredItems.length === 0 ? (
                <p className="text-xs text-destructive">
                  {itemSearchTerm ? "No items match your search" : "No items available for checkout"}
                </p>
              ) : (
                <ScrollArea className="h-[250px] border rounded-md p-2">
                  <div className="space-y-2">
                    {filteredItems.map((item) => {
                      const isSelected = selectedItems.some(selectedItem => selectedItem.id === item.id);
                      const selectedItem = selectedItems.find(selectedItem => selectedItem.id === item.id);
                      
                      return (
                        <div key={item.id} className="flex items-center p-2 border rounded-md hover:bg-accent">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={(checked) => handleItemSelect(item.id, !!checked)}
                            id={`item-${item.id}`}
                            className="mr-2 h-5 w-5"
                          />
                          
                          <div className="flex-grow">
                            <Label htmlFor={`item-${item.id}`} className="cursor-pointer">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground flex gap-2">
                                <span className="bg-primary/10 px-1 rounded">
                                  {item.itemCode}
                                </span>
                                <span>Category: {item.category.name}</span>
                                <span>{item.availableQuantity} available</span>
                              </div>
                            </Label>
                          </div>
                          
                          {isSelected && (
                            <div className="flex items-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  const current = selectedItem?.quantity || 1;
                                  handleQuantityChange(item.id, current - 1);
                                }}
                                disabled={(selectedItem?.quantity || 1) <= 1}
                              >
                                <Minus className="h-2 w-2" />
                              </Button>
                              <Input
                                type="number"
                                min={1}
                                max={item.availableQuantity}
                                value={selectedItem?.quantity || 1}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) {
                                    handleQuantityChange(item.id, val);
                                  }
                                }}
                                className="w-12 h-7 text-center mx-1 p-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  const current = selectedItem?.quantity || 1;
                                  handleQuantityChange(item.id, current + 1);
                                }}
                                disabled={(selectedItem?.quantity || 1) >= item.availableQuantity}
                              >
                                <Plus className="h-2 w-2" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
              
              {selectedItems.length > 0 && (
                <div className="text-sm">
                  Selected: <span className="font-medium">{selectedItems.length} items</span>
                  <span className="text-xs ml-2 text-muted-foreground">
                    (Total quantity: {selectedItems.reduce((total, item) => total + item.quantity, 0)})
                  </span>
                </div>
              )}
            </div>
            
            {/* Notes */}
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
              disabled={isSubmitting || selectedItems.length === 0 || !selectedPerson}
              className="bg-primary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Check Out {selectedItems.length} Items</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Confirmation Modal */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Print Checkout Receipt</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Would you like to print the checkout receipt?</p>
            <p className="text-sm text-muted-foreground mt-2">
              This will open a printable version in a new window.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
              Skip
            </Button>
            <Button 
              onClick={() => {
                printTransactions();
                setIsPrintModalOpen(false);
              }}
              className="bg-primary"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MultiItemCheckoutModal;