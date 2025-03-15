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
import { CalendarIcon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InventoryItemWithCategory, User, Personnel } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { AgreementChecker } from "@/components/users/agreement-checker";

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
  const [showAgreementChecker, setShowAgreementChecker] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  
  // New state to control the workflow
  const [selectedPerson, setSelectedPerson] = useState<User | null>(null);

  const { data: items = [] } = useQuery<InventoryItemWithCategory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
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
            const personWithItem = users.find(u => u.id === selectedItem.checkedOutBy?.id);
            if (personWithItem) {
              setSelectedPerson(personWithItem);
            }
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
  }, [isOpen, selectedItem, users]);

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

    const transaction = {
      itemId: parseInt(itemId),
      userId: parseInt(userId),
      type: operationType,
      quantity: 1,
      dueDate: operationType === "check-out" ? dueDate?.toISOString() : undefined,
      notes,
    };

    // For check-in operations, we don't need to verify agreements
    if (operationType === "check-in") {
      transactionMutation.mutate(transaction);
      return;
    }

    // For check-out operations, we need to verify EULA and Privacy Agreement acceptance
    // Store the transaction for later use after agreements are confirmed
    setPendingTransaction(transaction);
    setShowAgreementChecker(true);
  };
  
  // Handle completion of agreement checks
  const handleAgreementsComplete = () => {
    // User has accepted all agreements, proceed with the transaction
    if (pendingTransaction) {
      transactionMutation.mutate(pendingTransaction);
      setShowAgreementChecker(false);
    }
  };
  
  // Handle cancellation of agreement checks
  const handleAgreementsCancel = () => {
    toast({
      title: "Agreements Required",
      description: "EULA and Privacy Agreement must be accepted before checking out equipment.",
      variant: "destructive",
    });
    setShowAgreementChecker(false);
    setPendingTransaction(null);
  };

  // Handle user selection
  const handleUserChange = (userId: string) => {
    setUserId(userId);
    const selectedUser = users.find(u => u.id.toString() === userId);
    if (selectedUser) {
      setSelectedPerson(selectedUser);
    }
  };

  // Filter available items for checkout, all items for checkin
  const availableItems = operationType === "check-out"
    ? items.filter(item => item.availableQuantity > 0)
    : items;

  return (
    <>
      {/* Agreement Checker Modal */}
      {showAgreementChecker && selectedPerson && (
        <AgreementChecker 
          personnelId={parseInt(userId)}
          onComplete={handleAgreementsComplete}
          onCancel={handleAgreementsCancel}
        />
      )}

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
              <Label htmlFor="user-select">Select Person</Label>
              <Select
                value={userId}
                onValueChange={handleUserChange}
                disabled={!!selectedItem?.checkedOutBy}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a person..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPerson && (
                <p className="text-xs text-muted-foreground">
                  {operationType === "check-out" ? "Checking out to: " : "Checking in from: "}
                  <span className="font-medium">{selectedPerson.fullName}</span>
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
            
            {operationType === "check-out" && (
              <div className="space-y-2 rounded-md border p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> By checking out equipment, the user must agree to the EULA and Privacy Agreement.
                  These agreements will be presented for review and acceptance during the checkout process.
                </p>
              </div>
            )}
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
