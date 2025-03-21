import { TransactionWithDetails } from '@shared/schema';

// New implementation of getAllTransactionsWithDetails
export async function getAllTransactionsWithDetails(this: any): Promise<TransactionWithDetails[]> {
  const allTransactions = await this.getAllTransactions();
  const result: TransactionWithDetails[] = [];
  
  for (const transaction of allTransactions) {
    const item = await this.getInventoryItemWithCategory(transaction.itemId);
    const user = this.personnelDB.get(transaction.userId);
    
    if (item && user) {
      // Add in category information to make it a complete item with category
      const itemWithCategory = {
        ...item,
        category: {
          id: item.categoryId,
          name: (await this.getCategoryById(item.categoryId))?.name || "Unknown"
        }
      };
      
      result.push({
        ...transaction,
        item: itemWithCategory,
        user: {
          id: user.id,
          username: `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}`,
          fullName: `${user.firstName} ${user.lastName}`,
          role: 'personnel',
          isAuthorized: true,
          password: '' // We don't actually store passwords for personnel
        },
        person: user // Include the full personnel data for transaction details
      });

      // Log for debugging
      console.log(`[TRANSACTION DEBUG] Added transaction detail for ID ${transaction.id}`);
      console.log(`[TRANSACTION DEBUG] Item: ${item.name}, User: ${user.firstName} ${user.lastName}`);
    } else {
      console.log(`[TRANSACTION DEBUG] Skipped transaction ID ${transaction.id}, item or user not found`);
      console.log(`[TRANSACTION DEBUG] Item ID: ${transaction.itemId}, User ID: ${transaction.userId}`);
      if (!item) console.log(`[TRANSACTION DEBUG] Item not found with ID ${transaction.itemId}`);
      if (!user) console.log(`[TRANSACTION DEBUG] User not found with ID ${transaction.userId}`);
    }
  }
  
  // Sort by timestamp, newest first
  result.sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  
  console.log(`[TRANSACTION DEBUG] Returning ${result.length} transaction details`);
  
  return result;
}