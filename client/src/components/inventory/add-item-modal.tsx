import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@shared/schema";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [itemCode, setItemCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("1");
  const [minStockLevel, setMinStockLevel] = useState("5");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/inventory", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Item added successfully",
        description: "The new item has been added to inventory.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      resetForm();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setItemCode("");
    setName("");
    setDescription("");
    setCategoryId("");
    setTotalQuantity("1");
    setMinStockLevel("5");
  };

  const handleSubmit = () => {
    // Basic validation
    if (!itemCode.trim()) {
      toast({
        title: "Item code is required",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Item name is required",
        variant: "destructive",
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: "Category is required",
        variant: "destructive",
      });
      return;
    }

    const qty = parseInt(totalQuantity);
    const minStock = parseInt(minStockLevel);

    if (isNaN(qty) || qty < 1) {
      toast({
        title: "Total quantity must be a positive number",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(minStock) || minStock < 0) {
      toast({
        title: "Minimum stock level must be a non-negative number",
        variant: "destructive",
      });
      return;
    }

    const newItem = {
      itemCode,
      name,
      description,
      categoryId: parseInt(categoryId),
      totalQuantity: qty,
      availableQuantity: qty,
      minStockLevel: minStock,
      status: "available",
    };

    addItemMutation.mutate(newItem);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-code">Item Code</Label>
              <Input
                id="item-code"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                placeholder="e.g., INV-1009"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter item description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Total Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="min-stock">Minimum Stock Level</Label>
              <Input
                id="min-stock"
                type="number"
                min="0"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={addItemMutation.isPending}
          >
            {addItemMutation.isPending ? "Adding..." : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
