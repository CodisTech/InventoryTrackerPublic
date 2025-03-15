import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Search, User as UserIcon, Users as UsersIcon, Minus as MinusIcon, Plus as PlusIcon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InventoryItemWithCategory, User, Personnel } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface CheckInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: InventoryItemWithCategory | null;
  // Added support for multiple items
  selectedItems?: InventoryItemWithCategory[];
}

// Interface for personnel that can check out items
type Person = {
  id: number;
  fullName: string;
  division?: string;
  department?: string;
  jDial?: string | null;
};

// Interface for selected items with quantities
interface SelectedItemWithQuantity {
  item: InventoryItemWithCategory;
  quantity: number;
}

const CheckInOutModal: React.FC<CheckInOutModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  selectedItems = [],
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [operationType, setOperationType] = useState<"check-in" | "check-out">("check-out");
  const [itemId, setItemId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isPersonnelSelectOpen, setIsPersonnelSelectOpen] = useState(false);
  
  // Person state to control the workflow
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  
  // State for tracking selected items and their quantities in multi-item mode
  const [selectedItemsWithQuantities, setSelectedItemsWithQuantities] = useState<SelectedItemWithQuantity[]>([]);
  
  // Flag to determine if we're in multi-item mode
  const isMultiItemMode = selectedItems && selectedItems.length > 0;

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
      // Check if we have multiple selected items
      if (selectedItems && selectedItems.length > 0) {
        setOperationType("check-out"); // Multi-item mode only supports check-out for now
        
        // Initialize the selected items with quantities
        const itemsWithQty = selectedItems.map(item => ({
          item,
          quantity: 1
        }));
        setSelectedItemsWithQuantities(itemsWithQty);
        
        // No need to set itemId in multi-item mode
        setItemId("");
      } 
      // Single item mode
      else if (selectedItem) {
        setItemId(selectedItem.id.toString());
        
        // If item is checked out, default to check-in, otherwise default to check-out
        if (selectedItem.checkedOutBy) {
          setOperationType("check-in");
          // If we're checking in, find the user who has this item checked out
          if (selectedItem.checkedOutBy) {
            setUserId(selectedItem.checkedOutBy.id.toString());
            // Create a Person object for the user who has the item
            const personWithItem = {
              id: selectedItem.checkedOutBy.id,
              fullName: selectedItem.checkedOutBy.fullName
            };
            setSelectedPerson(personWithItem);
          }
        } else {
          setOperationType("check-out");
        }
      } else {
        setOperationType("check-out");
        setSelectedPerson(null);
      }
      
      setQuantity(1);
      setNotes("");
    }
  }, [isOpen, selectedItem, selectedItems]);

  const transactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return await res.json();
    },
    onSuccess: () => {
      const selectedItemName = items.find(i => i.id.toString() === itemId)?.name || "Item";
      const quantityText = quantity > 1 ? `${quantity} units of ` : "";
      
      toast({
        title: `${quantityText}${selectedItemName} ${operationType === "check-out" ? "checked out to" : "checked in from"} ${selectedPerson?.fullName}`,
        description: "The inventory has been updated.",
      });
      // Invalidate all necessary queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/overdue-items"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Transaction failed",
        description: error.message,
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

    // Multi-item mode
    if (isMultiItemMode) {
      if (selectedItemsWithQuantities.length === 0) {
        toast({
          title: "No items selected",
          variant: "destructive",
        });
        return;
      }

      // Process each item as a separate transaction
      const transactions = selectedItemsWithQuantities.map(itemWithQty => ({
        itemId: itemWithQty.item.id,
        userId: parseInt(userId),
        type: operationType,
        quantity: itemWithQty.quantity,
        notes,
      }));

      // For now, process transactions sequentially with a simple loop
      // In production, consider using Promise.all or a proper batch API endpoint
      let processed = 0;
      const processNext = () => {
        if (processed < transactions.length) {
          const transaction = transactions[processed];
          transactionMutation.mutate(transaction, {
            onSuccess: () => {
              processed++;
              processNext(); // Process the next transaction
            }
          });
        } else {
          // All transactions processed
          toast({
            title: `${processed} items ${operationType === "check-out" ? "checked out to" : "checked in from"} ${selectedPerson?.fullName}`,
            description: "The inventory has been updated.",
          });
          
          // Invalidate all necessary queries to ensure data consistency
          queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
          queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
          queryClient.invalidateQueries({ queryKey: ["/api/overdue-items"] });
          onClose();
        }
      };

      // Start processing the transactions
      processNext();
      return;
    }

    // Single item mode
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
      if (item && (!item.checkedOutBy || item.checkedOutBy.id.toString() !== userId)) {
        toast({
          title: "Invalid check-in",
          description: `${selectedPerson?.fullName || "This person"} does not have this item checked out.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Create the transaction object
    const transaction: any = {
      itemId: parseInt(itemId),
      userId: parseInt(userId),
      type: operationType,
      quantity: quantity,
      notes,
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
              {isMultiItemMode
                ? "Check Out Multiple Items"
                : selectedItem
                  ? (selectedItem.checkedOutBy 
                    ? `Check In Item from ${selectedItem.checkedOutBy.fullName}` 
                    : "Check Out Item")
                  : "Check In/Out Item"
              }
            </DialogTitle>
            {selectedItem && !isMultiItemMode && (
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
            {/* Operation selection - hide in multi-item mode */}
            {!isMultiItemMode && (
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
            )}
            
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
                    disabled={!!selectedItem?.checkedOutBy}
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
            
            {/* Item Selection - show different UI based on mode */}
            {isMultiItemMode ? (
              <div className="space-y-2">
                <Label>Selected Items ({selectedItemsWithQuantities.length})</Label>
                <div className="border rounded-md max-h-[200px] overflow-y-auto divide-y">
                  {selectedItemsWithQuantities.map((itemWithQty, index) => (
                    <div key={itemWithQty.item.id} className="p-2 flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{itemWithQty.item.name}</p>
                        <p className="text-xs text-muted-foreground">{itemWithQty.item.itemCode}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            // Create a new array with updated quantity
                            const updatedItems = [...selectedItemsWithQuantities];
                            const newQty = Math.max(1, itemWithQty.quantity - 1);
                            updatedItems[index] = {
                              ...itemWithQty,
                              quantity: newQty
                            };
                            setSelectedItemsWithQuantities(updatedItems);
                          }}
                          disabled={itemWithQty.quantity <= 1}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                        <span className="text-sm w-8 text-center">
                          {itemWithQty.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            // Create a new array with updated quantity
                            const updatedItems = [...selectedItemsWithQuantities];
                            const newQty = Math.min(
                              itemWithQty.item.availableQuantity || 1,
                              itemWithQty.quantity + 1
                            );
                            updatedItems[index] = {
                              ...itemWithQty,
                              quantity: newQty
                            };
                            setSelectedItemsWithQuantities(updatedItems);
                          }}
                          disabled={itemWithQty.quantity >= (itemWithQty.item.availableQuantity || 1)}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
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
            )}
            
            {/* Quantity selector - only show in single item mode */}
            {!isMultiItemMode && operationType === "check-out" && itemId && (
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setQuantity(Math.max(1, quantity - 1));
                    }}
                    disabled={quantity <= 1}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    className="w-20 text-center"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1) {
                        // Get the selected item and check available quantity for checkout
                        const selectedItem = items.find(i => i.id.toString() === itemId);
                        if (selectedItem && operationType === "check-out") {
                          const maxAvailable = selectedItem.availableQuantity || 0;
                          setQuantity(Math.min(val, maxAvailable));
                        } else {
                          setQuantity(val);
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      // Get the selected item and check available quantity for checkout
                      const selectedItem = items.find(i => i.id.toString() === itemId);
                      if (selectedItem && operationType === "check-out") {
                        const maxAvailable = selectedItem.availableQuantity || 0;
                        setQuantity(Math.min(quantity + 1, maxAvailable));
                      } else {
                        setQuantity(quantity + 1);
                      }
                    }}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                  
                  {/* Show available quantity for checkout */}
                  <span className="text-sm text-muted-foreground ml-2">
                    {(() => {
                      const selectedItem = items.find(i => i.id.toString() === itemId);
                      if (selectedItem) {
                        const maxAvailable = selectedItem.availableQuantity || 0;
                        return `${maxAvailable} available`;
                      }
                      return "";
                    })()}
                  </span>
                </div>
              </div>
            )}
            
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
                : isMultiItemMode
                  ? `Check Out ${selectedItemsWithQuantities.length} Items to ${selectedPerson?.fullName || "..."}`
                  : operationType === "check-out" 
                    ? (quantity > 1 
                      ? `Check Out ${quantity} Units to ${selectedPerson?.fullName || "..."}` 
                      : `Check Out to ${selectedPerson?.fullName || "..."}`)
                    : (quantity > 1
                      ? `Check In ${quantity} Units from ${selectedPerson?.fullName || "..."}`
                      : `Check In from ${selectedPerson?.fullName || "..."}`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckInOutModal;