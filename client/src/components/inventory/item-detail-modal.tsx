import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Info, 
  Calendar, 
  Tag, 
  Settings,
  User,
  ArrowDown,
  ArrowUp,
  RotateCw
} from "lucide-react";
import { format } from "date-fns";
import { InventoryItemWithCategory } from "@shared/schema";

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItemWithCategory;
  onCheckInOut?: () => void;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onCheckInOut
}) => {
  // Format the created date
  const formattedDate = item.createdAt 
    ? format(new Date(item.createdAt), 'PPP')
    : 'Unknown';

  // Get the appropriate status badge
  const getStatusBadge = () => {
    if (item.availableQuantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (item.availableQuantity < (item.minStockLevel || 3)) {
      return <Badge variant="warning" className="bg-amber-500">Low Stock</Badge>;
    }
    return <Badge variant="success" className="bg-emerald-500">In Stock</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Package className="h-5 w-5 mr-2 text-primary" />
            Item Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{item.name}</h2>
              <p className="text-sm text-muted-foreground">{item.itemCode}</p>
            </div>
            <div>{getStatusBadge()}</div>
          </div>

          {/* Item Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Category:</span>
                  <span className="ml-2">{item.category.name}</span>
                </div>
                
                <div className="flex items-center">
                  <ArrowDown className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Total Quantity:</span>
                  <span className="ml-2">{item.totalQuantity}</span>
                </div>
                
                <div className="flex items-center">
                  <ArrowUp className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Available:</span>
                  <span className="ml-2">{item.availableQuantity}</span>
                </div>
                
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Min Stock Level:</span>
                  <span className="ml-2">{item.minStockLevel || "Not set"}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Added On:</span>
                  <span className="ml-2">{formattedDate}</span>
                </div>
                
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Checked Out By:</span>
                  <span className="ml-2">{item.checkedOutBy ? item.checkedOutBy.fullName : "N/A"}</span>
                </div>
                
                {item.checkedOutBy && (
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm font-medium">Division:</span>
                    <span className="ml-2">{item.checkedOutBy.division || "N/A"}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start mb-1">
                <Info className="h-4 w-4 mr-2 text-primary mt-1" />
                <span className="text-sm font-medium">Description:</span>
              </div>
              <p className="text-sm pl-6">{item.description || "No description provided."}</p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-between items-center">
          {onCheckInOut && (
            <Button 
              onClick={onCheckInOut}
              className="mr-2"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Check In/Out
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailModal;