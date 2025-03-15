import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Users as UsersIcon, Trash2, MinusCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InventoryItemWithCategory, Personnel } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface MultiItemCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems?: InventoryItemWithCategory[];
}

// Person interface for personnel that can check out items
type Person = {
  id: number;
  fullName: string;
  division?: string;
  department?: string;
  jDial?: string | null;
};

// SelectedItemWithQuantity interface to track selected items and their quantities
interface SelectedItemWithQuantity {
  item: InventoryItemWithCategory;
  quantity: number;
}

const MultiItemCheckoutModal: React.FC<MultiItemCheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedItems = [],
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isPersonnelSelectOpen, setIsPersonnelSelectOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedItemsWithQuantity, setSelectedItemsWithQuantity] = useState<SelectedItemWithQuantity[]>([]);

  // Fetch personnel data
  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
  });

  // Reset state when modal is opened/closed or when selected items change
  useEffect(() => {
    if (isOpen) {
      setNotes("");
      setSelectedPerson(null);
      
      // Initialize selected items with quantity 1
      setSelectedItemsWithQuantity(
        selectedItems.map(item => ({
          item,
          quantity: 1
        }))
      );
    }
  }, [isOpen, selectedItems]);

  // Map personnel to Person type
  const allPeople: Person[] = personnel.map(p => ({
    id: p.id,
    fullName: `${p.firstName} ${p.lastName}`,
    division: p.division,
    department: p.department,
    jDial: p.jDial
  }));

  // Filter people based on search term
  const filteredPeople = allPeople.filter(person => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      person.fullName.toLowerCase().includes(search) ||
      (person.division && person.division.toLowerCase().includes(search)) ||
      (person.department && person.department.toLowerCase().includes(search)) ||
      (person.jDial && person.jDial && person.jDial.toLowerCase().includes(search))
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

  // Handle quantity change for an item
  const handleQuantityChange = (itemId: number, quantity: number) => {
    setSelectedItemsWithQuantity(prev => 
      prev.map(entry => 
        entry.item.id === itemId 
          ? { ...entry, quantity } 
          : entry
      )
    );
  };

  // Remove an item from the selection
  const handleRemoveItem = (itemId: number) => {
    setSelectedItemsWithQuantity(prev => 
      prev.filter(entry => entry.item.id !== itemId)
    );
  };

  // Transaction mutation for checkout
  const transactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `Items checked out to ${selectedPerson?.fullName}`,
        description: "The inventory has been updated.",
      });
      // Invalidate all necessary queries
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

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedPerson) {
      toast({
        title: "Please select a person",
        variant: "destructive",
      });
      return;
    }

    if (selectedItemsWithQuantity.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to check out.",
        variant: "destructive",
      });
      return;
    }

    // Process each item as a separate transaction
    for (const { item, quantity } of selectedItemsWithQuantity) {
      if (quantity > item.availableQuantity) {
        toast({
          title: "Invalid quantity",
          description: `Cannot check out ${quantity} units of ${item.name}. Only ${item.availableQuantity} available.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Create an array of transaction objects
    const transactions = selectedItemsWithQuantity.map(({ item, quantity }) => ({
      itemId: item.id,
      userId: selectedPerson.id,
      type: "check-out",
      quantity,
      notes
    }));

    // Process transactions sequentially
    try {
      for (const transaction of transactions) {
        await transactionMutation.mutateAsync(transaction);
      }
    } catch (error) {
      console.error("Error during batch checkout:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Check Out Multiple Items</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Personnel selector */}
          <div className="space-y-2">
            <Label>Select Person to Check Out To</Label>
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
                    value={searchTerm}
                    onValueChange={setSearchTerm}
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
                          </div>
                          {(person.division || person.department) && (
                            <div className="ml-7 mt-1 text-xs text-muted-foreground">
                              {person.division}
                              {person.division && person.department ? " • " : ""}
                              {person.department}
                            </div>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected items display */}
          <div className="space-y-2">
            <Label>Selected Items ({selectedItemsWithQuantity.length})</Label>
            <div className="border rounded-md">
              {selectedItemsWithQuantity.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No items selected
                </div>
              ) : (
                <div className="divide-y">
                  {selectedItemsWithQuantity.map(({ item, quantity }) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.itemCode} • {item.category.name}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-r-none"
                            onClick={() => handleQuantityChange(item.id, Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            max={item.availableQuantity}
                            className="h-7 rounded-none text-center w-12 p-1"
                            value={quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 1) {
                                handleQuantityChange(item.id, Math.min(val, item.availableQuantity));
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-l-none"
                            onClick={() => handleQuantityChange(
                              item.id, 
                              Math.min(quantity + 1, item.availableQuantity)
                            )}
                            disabled={quantity >= item.availableQuantity}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes field */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes about this checkout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="flex space-x-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={!selectedPerson || selectedItemsWithQuantity.length === 0 || transactionMutation.isPending}
          >
            {transactionMutation.isPending ? "Processing..." : "Check Out Items"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MultiItemCheckoutModal;