import { 
  users, categories, inventoryItems, transactions,
  type User, type InsertUser, 
  type Category, type InsertCategory, 
  type InventoryItem, type InsertInventoryItem,
  type Transaction, type InsertTransaction, 
  type DashboardStats, type InventoryItemWithCategory,
  type TransactionWithDetails
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Category methods
  createCategory(category: InsertCategory): Promise<Category>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  
  // Inventory methods
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  getInventoryItemByCode(code: string): Promise<InventoryItem | undefined>;
  getAllInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItemWithCategory(id: number): Promise<InventoryItemWithCategory | undefined>;
  getAllInventoryItemsWithCategory(): Promise<InventoryItemWithCategory[]>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  getTransactionsByItem(itemId: number): Promise<Transaction[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private usersDB: Map<number, User>;
  private categoriesDB: Map<number, Category>;
  private itemsDB: Map<number, InventoryItem>;
  private transactionsDB: Map<number, Transaction>;
  sessionStore: session.Store;
  private userIdCounter: number;
  private categoryIdCounter: number;
  private itemIdCounter: number;
  private transactionIdCounter: number;

  constructor() {
    this.usersDB = new Map();
    this.categoriesDB = new Map();
    this.itemsDB = new Map();
    this.transactionsDB = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.itemIdCounter = 1;
    this.transactionIdCounter = 1;

    // Initialize with some sample data
    this.initSampleData();
  }

  // Sample data initialization
  private async initSampleData() {
    // Create admin user
    const admin = await this.createUser({
      username: "admin",
      password: "admin123", // Plain password - will be hashed by the auth.ts createUser function
      fullName: "Administrator",
      role: "admin",
      isAuthorized: true
    });

    // Create some sample categories
    const laptops = await this.createCategory({ name: "Laptops" });
    const desktops = await this.createCategory({ name: "Desktops" });
    const mobile = await this.createCategory({ name: "Mobile Devices" });
    const storage = await this.createCategory({ name: "Storage" });
    const av = await this.createCategory({ name: "A/V Equipment" });
    const accessories = await this.createCategory({ name: "Accessories" });
    
    // Create some sample inventory items
    await this.createInventoryItem({
      itemCode: "INV-1001",
      name: "MacBook Pro 16\"",
      description: "16-inch MacBook Pro with M1 Pro chip",
      categoryId: laptops.id,
      totalQuantity: 5,
      availableQuantity: 4,
      minStockLevel: 2,
      status: "available"
    });
    
    await this.createInventoryItem({
      itemCode: "INV-1002",
      name: "Dell XPS Desktop",
      description: "Dell XPS Desktop with Intel i7 processor",
      categoryId: desktops.id,
      totalQuantity: 3,
      availableQuantity: 3,
      minStockLevel: 1,
      status: "available"
    });
    
    await this.createInventoryItem({
      itemCode: "INV-1003",
      name: "iPhone 13 Pro",
      description: "iPhone 13 Pro with 256GB storage",
      categoryId: mobile.id,
      totalQuantity: 10,
      availableQuantity: 10,
      minStockLevel: 3,
      status: "available"
    });
    
    await this.createInventoryItem({
      itemCode: "INV-1004",
      name: "External Hard Drive",
      description: "2TB External Hard Drive",
      categoryId: storage.id,
      totalQuantity: 8,
      availableQuantity: 7,
      minStockLevel: 2,
      status: "available"
    });
    
    await this.createInventoryItem({
      itemCode: "INV-1005",
      name: "Digital Projector",
      description: "HD Digital Projector",
      categoryId: av.id,
      totalQuantity: 4,
      availableQuantity: 2,
      minStockLevel: 1,
      status: "available"
    });
    
    await this.createInventoryItem({
      itemCode: "INV-1006",
      name: "HDMI Cables",
      description: "6ft HDMI Cables",
      categoryId: accessories.id,
      totalQuantity: 15,
      availableQuantity: 2,
      minStockLevel: 5,
      status: "available"
    });
    
    await this.createInventoryItem({
      itemCode: "INV-1007",
      name: "USB Drives",
      description: "32GB USB Flash Drives",
      categoryId: storage.id,
      totalQuantity: 20,
      availableQuantity: 5,
      minStockLevel: 5,
      status: "available"
    });
    
    await this.createInventoryItem({
      itemCode: "INV-1008",
      name: "Wireless Mice",
      description: "Logitech Wireless Mice",
      categoryId: accessories.id,
      totalQuantity: 12,
      availableQuantity: 4,
      minStockLevel: 3,
      status: "available"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersDB.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersDB.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // We're using plaintext password in the sample data initialization 
    // The password will be properly hashed when using the register API route
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "staff",
      isAuthorized: insertUser.isAuthorized !== undefined ? insertUser.isAuthorized : true
    };
    this.usersDB.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersDB.values());
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.usersDB.get(id);
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser = { ...existingUser, ...userData };
    this.usersDB.set(id, updatedUser);
    return updatedUser;
  }

  // Category methods
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this.categoriesDB.set(id, category);
    return category;
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categoriesDB.values()).find(
      (category) => category.name === name,
    );
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categoriesDB.values());
  }

  // Inventory methods
  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.itemIdCounter++;
    const now = new Date();
    const item: InventoryItem = { ...insertItem, id, createdAt: now };
    this.itemsDB.set(id, item);
    return item;
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.itemsDB.get(id);
  }

  async getInventoryItemByCode(code: string): Promise<InventoryItem | undefined> {
    return Array.from(this.itemsDB.values()).find(
      (item) => item.itemCode === code,
    );
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.itemsDB.values());
  }

  async getInventoryItemWithCategory(id: number): Promise<InventoryItemWithCategory | undefined> {
    const item = this.itemsDB.get(id);
    if (!item) {
      return undefined;
    }
    
    const category = this.categoriesDB.get(item.categoryId);
    if (!category) {
      return undefined;
    }
    
    let checkedOutBy = null;
    // Find the most recent checkout transaction without a corresponding check-in
    const transactions = Array.from(this.transactionsDB.values())
      .filter(t => t.itemId === id)
      .sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    
    const lastCheckout = transactions.find(t => t.type === 'check-out' && !t.returnDate);
    if (lastCheckout) {
      checkedOutBy = this.usersDB.get(lastCheckout.userId) || null;
    }
    
    return {
      ...item,
      category,
      checkedOutBy
    };
  }

  async getAllInventoryItemsWithCategory(): Promise<InventoryItemWithCategory[]> {
    const items = Array.from(this.itemsDB.values());
    const result: InventoryItemWithCategory[] = [];
    
    for (const item of items) {
      const category = this.categoriesDB.get(item.categoryId);
      if (!category) continue;
      
      let checkedOutBy = null;
      const transactions = Array.from(this.transactionsDB.values())
        .filter(t => t.itemId === item.id)
        .sort((a, b) => {
          if (!a.timestamp || !b.timestamp) return 0;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
      
      const lastCheckout = transactions.find(t => t.type === 'check-out' && !t.returnDate);
      if (lastCheckout) {
        checkedOutBy = this.usersDB.get(lastCheckout.userId) || null;
      }
      
      result.push({
        ...item,
        category,
        checkedOutBy
      });
    }
    
    return result;
  }

  async updateInventoryItem(id: number, itemData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const existingItem = this.itemsDB.get(id);
    if (!existingItem) {
      return undefined;
    }
    
    const updatedItem = { ...existingItem, ...itemData };
    this.itemsDB.set(id, updatedItem);
    return updatedItem;
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const transaction: Transaction = { ...insertTransaction, id, timestamp: now, returnDate: undefined };
    this.transactionsDB.set(id, transaction);
    
    // Update inventory item availability
    const item = this.itemsDB.get(insertTransaction.itemId);
    if (item) {
      if (insertTransaction.type === 'check-out') {
        // Decrease available quantity
        const newAvailable = Math.max(0, item.availableQuantity - insertTransaction.quantity);
        this.itemsDB.set(item.id, {
          ...item,
          availableQuantity: newAvailable,
          status: newAvailable === 0 ? 'out-of-stock' : 'available'
        });
      } else if (insertTransaction.type === 'check-in') {
        // Increase available quantity
        const newAvailable = Math.min(item.totalQuantity, item.availableQuantity + insertTransaction.quantity);
        this.itemsDB.set(item.id, {
          ...item,
          availableQuantity: newAvailable,
          status: 'available'
        });
        
        // Mark corresponding check-out transaction as returned
        const checkoutTransaction = Array.from(this.transactionsDB.values())
          .filter(t => t.itemId === item.id && t.type === 'check-out' && !t.returnDate)
          .sort((a, b) => {
            if (!a.timestamp || !b.timestamp) return 0;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          })[0];
        
        if (checkoutTransaction) {
          this.transactionsDB.set(checkoutTransaction.id, {
            ...checkoutTransaction,
            returnDate: now
          });
        }
      }
    }
    
    return transaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactionsDB.get(id);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactionsDB.values());
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactionsDB.values()).filter(
      (transaction) => transaction.userId === userId,
    );
  }

  async getTransactionsByItem(itemId: number): Promise<Transaction[]> {
    return Array.from(this.transactionsDB.values()).filter(
      (transaction) => transaction.itemId === itemId,
    );
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    const items = await this.getAllInventoryItems();
    const users = await this.getAllUsers();
    
    // Calculate stats
    const totalItems = items.reduce((sum, item) => sum + item.totalQuantity, 0);
    const availableItems = items.reduce((sum, item) => sum + item.availableQuantity, 0);
    const checkedOutItems = totalItems - availableItems;
    
    // Get low stock items
    const lowStockItems = await Promise.all(
      items
        .filter(item => item.availableQuantity <= item.minStockLevel)
        .map(async item => await this.getInventoryItemWithCategory(item.id))
        .filter((item): item is InventoryItemWithCategory => item !== undefined)
    );
    
    // Get recent activity
    const allTransactions = await this.getAllTransactions();
    const sortedTransactions = allTransactions
      .sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, 5);
    
    const recentActivity: TransactionWithDetails[] = [];
    for (const transaction of sortedTransactions) {
      const item = this.itemsDB.get(transaction.itemId);
      const user = this.usersDB.get(transaction.userId);
      
      if (item && user) {
        recentActivity.push({
          ...transaction,
          item,
          user
        });
      }
    }
    
    return {
      totalItems,
      checkedOutItems,
      availableItems,
      totalUsers: users.length,
      lowStockItems,
      recentActivity
    };
  }
}

export const storage = new MemStorage();
