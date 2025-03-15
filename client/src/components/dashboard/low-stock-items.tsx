import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryItemWithCategory } from "@shared/schema";

interface LowStockItemsProps {
  items: InventoryItemWithCategory[];
}

const LowStockItems: React.FC<LowStockItemsProps> = ({ items }) => {
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
                <TableHead className="w-[40%] text-xs font-medium text-neutral-500 uppercase tracking-wider">Item</TableHead>
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
                  
                  return (
                    <TableRow key={item.id}>
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
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
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
