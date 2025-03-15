import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Search, User as UserIcon, Users as UsersIcon, Building } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InventoryItemWithCategory, User, Personnel } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
// Removed AgreementChecker import as it's no longer needed
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface CheckInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: InventoryItemWithCategory | null;
}

const CheckInOutModal: React.FC<CheckInOutModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [operationType, setOperationType] = useState<"check-in" | "check-out">("check-out");
  const [itemId, setItemId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState<string>("");
  // We removed EULA/Privacy agreement verification from checkout process
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isPersonnelSelectOpen, setIsPersonnelSelectOpen] = useState(false);
  
  // New state to control the workflow using our Person type
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

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
      if (selectedItem) {
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
              fullName: selectedItem.checkedOutBy.fullName,
              isPersonnel: false
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
      
      // Set due date to 7 days from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      setDueDate(defaultDueDate);
      
      setNotes("");
    }
  }, [isOpen, selectedItem]);

  const transactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `Item ${operationType === "check-out" ? "checked out to" : "checked in from"} ${selectedPerson?.fullName}`,
        description: "The inventory has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
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
    if (!itemId) {
      toast({
        title: "Please select an item",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Please select a person",
        variant: "destructive",
      });
      return;
    }

    if (operationType === "check-out" && !dueDate) {
      toast({
        title: "Please select a due date",
        variant: "destructive",
      });
      return;
    }

    const transaction: any = {
      itemId: parseInt(itemId),
      userId: parseInt(userId),
      type: operationType,
      quantity: 1,
      notes,
    };

    // Handle dates based on transaction type
    if (operationType === "check-out" && dueDate) {
      // For check-out, include due date (timestamp is added automatically on server)
      transaction.dueDate = dueDate.toISOString();
    }
    // For check-in, no need to include dates (returnDate is set automatically on server)
    // timestamp is also set automatically on server

    // Process the transaction immediately without checking agreements
    transactionMutation.mutate(transaction);
  };
  
  // Agreement functions removed as they're no longer needed

  // Handle user selection
  const handleUserChange = (userId: string) => {
    setUserId(userId);
    // Find the person in our combined allPeople array
    const person = allPeople.find(p => p.id.toString() === userId);
    if (person) {
      setSelectedPerson(person);
    }
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
  
  // Combined array of users and personnel with a common interface
  type Person = {
    id: number;
    fullName: string;
    division?: string;
    department?: string;
    jDial?: string | null;
    isPersonnel?: boolean;
  };
  
  const allPeople: Person[] = [
    ...users.map(u => ({
      id: u.id,
      fullName: u.fullName,
      isPersonnel: false
    })),
    ...personnel.map(p => ({
      id: p.id,
      fullName: `${p.firstName} ${p.lastName}`,
      division: p.division,
      department: p.department,
      jDial: p.jDial,
      isPersonnel: true
    }))
  ];
  
  // Filter people based on search term
  const filteredPeople = allPeople.filter(person => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      person.fullName.toLowerCase().includes(search) ||
      (person.division && person.division.toLowerCase().includes(search)) ||
      (person.department && person.department.toLowerCase().includes(search)) ||
      (person.jDial && person.jDial.toLowerCase().includes(search))
    );
  });

  // Filter available items for checkout, all items for checkin
  const availableItems = operationType === "check-out"
    ? items.filter(item => item.availableQuantity > 0)
    : items;

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 
                (selectedItem.checkedOutBy ? 
                  `Check In Item from ${selectedItem.checkedOutBy.fullName}` : 
                  "Check Out Item") : 
                "Check In/Out Item"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Operation Type</Label>
              <RadioGroup
                value={operationType}
                onValueChange={(v) => setOperationType(v as "check-in" | "check-out")}
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
            
            <div className="space-y-2">
              <Label htmlFor="user-select">Search Person</Label>
              <Popover open={isPersonnelSelectOpen} onOpenChange={setIsPersonnelSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isPersonnelSelectOpen}
                    className="w-full justify-between"
                    disabled={!!selectedItem?.checkedOutBy}
                  >
                    {selectedPerson ? selectedPerson.fullName : "Select person..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search personnel or users..." 
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>No person found.</CommandEmpty>
                      <CommandGroup heading="Personnel">
                        {filteredPeople.filter(p => p.isPersonnel).map((person) => (
                          <CommandItem
                            key={`personnel-${person.id}`}
                            value={person.id.toString()}
                            onSelect={handlePersonnelSelect}
                            className="flex items-center"
                          >
                            <div className="mr-2 flex items-center justify-center rounded-full bg-primary/10 p-1">
                              <UsersIcon className="h-3 w-3" />
                            </div>
                            <span>{person.fullName}</span>
                            {person.division && (
                              <span className="ml-auto text-xs text-muted-foreground">
                                {person.division}
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandGroup heading="System Users">
                        {filteredPeople.filter(p => !p.isPersonnel).map((person) => (
                          <CommandItem
                            key={`user-${person.id}`}
                            value={person.id.toString()}
                            onSelect={handlePersonnelSelect}
                          >
                            <div className="mr-2 flex items-center justify-center rounded-full bg-secondary/10 p-1">
                              <UserIcon className="h-3 w-3" />
                            </div>
                            <span>{person.fullName}</span>
                          </CommandItem>
                        ))}
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
              {operationType === "check-out" && availableItems.length === 0 && (
                <p className="text-xs text-destructive">No items available for checkout</p>
              )}
            </div>
            
            {operationType === "check-out" && (
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
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
                : operationType === "check-out" 
                  ? `Check Out to ${selectedPerson?.fullName || "..."}` 
                  : `Check In from ${selectedPerson?.fullName || "..."}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckInOutModal;
