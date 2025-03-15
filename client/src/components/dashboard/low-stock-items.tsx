import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { InventoryItemWithCategory } from "@shared/schema";

interface LowStockItemsProps {
  items: InventoryItemWithCategory[];
  selectMode?: boolean;
  selectedItems?: InventoryItemWithCategory[];
  onItemSelect?: (item: InventoryItemWithCategory, isSelected: boolean) => void;
}

const LowStockItems: React.FC<LowStockItemsProps> = ({ 
  items, 
  selectMode = false, 
  selectedItems = [], 
  onItemSelect 
}) => {
  // Check if an item is in the selected items array
  const isItemSelected = (item: InventoryItemWithCategory) => {
    return selectedItems.some(selectedItem => selectedItem.id === item.id);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-900">Low Stock Items</h3>
          <a href="/inventory" className="text-primary text-sm">View All</a>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {selectMode && (
                  <TableHead className="w-[5%]"></TableHead>
                )}
                <TableHead className={`${selectMode ? 'w-[35%]' : 'w-[40%]'} text-xs font-medium text-neutral-500 uppercase tracking-wider`}>Item</TableHead>
                <TableHead className="w-[30%] text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</TableHead>
                <TableHead className="w-[15%] text-xs font-medium text-neutral-500 uppercase tracking-wider">Available</TableHead>
                <TableHead className="w-[15%] text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => {
                  const isOutOfStock = item.availableQuantity === 0;
                  const isLowStock = item.availableQuantity <= item.minStockLevel;
                  const selected = isItemSelected(item);
                  
                  return (
                    <TableRow 
                      key={item.id} 
                      className={selectMode && !isOutOfStock ? "cursor-pointer hover:bg-gray-50" : ""}
                      onClick={() => {
                        if (selectMode && onItemSelect && item.availableQuantity > 0) {
                          onItemSelect(item, !selected);
                        }
                      }}
                    >
                      {selectMode && (
                        <TableCell className="py-3 pl-4">
                          <Checkbox 
                            checked={selected}
                            disabled={isOutOfStock}
                            onCheckedChange={(checked) => {
                              if (onItemSelect && item.availableQuantity > 0) {
                                onItemSelect(item, checked as boolean);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      <TableCell className="py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`material-icons mr-2 ${isOutOfStock ? 'text-error' : 'text-warning'}`}>
                            {isOutOfStock ? 'error' : 'warning'}
                          </span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 whitespace-nowrap text-sm text-neutral-500">
                        {item.category.name}
                      </TableCell>
                      <TableCell className="py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isOutOfStock 
                            ? 'bg-error bg-opacity-10 text-error' 
                            : 'bg-warning bg-opacity-10 text-warning'
                        }`}>
                          {item.availableQuantity}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 whitespace-nowrap text-sm text-neutral-500">
                        {item.totalQuantity}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={selectMode ? 5 : 4} className="text-center py-6 text-muted-foreground">
                    No low stock items to display
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockItems;
