import { 
  users, categories, inventoryItems, transactions, personnel, privacyAgreements, eulaAgreements,
  type User, type InsertUser, 
  type Personnel, type InsertPersonnel,
  type Category, type InsertCategory, 
  type InventoryItem, type InsertInventoryItem,
  type Transaction, type InsertTransaction, 
  type DashboardStats, type InventoryItemWithCategory,
  type TransactionWithDetails,
  type PrivacyAgreement, type InsertPrivacyAgreement,
  type EulaAgreement, type InsertEulaAgreement
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
  
  // Personnel methods
  getPersonnel(id: number): Promise<Personnel | undefined>;
  getAllPersonnel(): Promise<Personnel[]>;
  createPersonnel(person: InsertPersonnel): Promise<Personnel>;
  updatePersonnel(id: number, person: Partial<InsertPersonnel>): Promise<Personnel | undefined>;
  deletePersonnel(id: number): Promise<boolean>;
  searchPersonnel(query: string): Promise<Personnel[]>;
  
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
  getAllTransactionsWithDetails(): Promise<TransactionWithDetails[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<DashboardStats>;
  
  // Privacy Agreement methods
  createPrivacyAgreement(agreement: InsertPrivacyAgreement): Promise<PrivacyAgreement>;
  getPrivacyAgreementByPersonnel(personnelId: number): Promise<PrivacyAgreement | undefined>;
  getPrivacyAgreementsByVersion(version: string): Promise<PrivacyAgreement[]>;
  checkPersonnelHasAgreed(personnelId: number): Promise<boolean>;
  
  // EULA Agreement methods
  createEulaAgreement(agreement: InsertEulaAgreement): Promise<EulaAgreement>;
  getEulaAgreementByPersonnel(personnelId: number): Promise<EulaAgreement | undefined>;
  getEulaAgreementsByVersion(version: string): Promise<EulaAgreement[]>;
  checkPersonnelHasAcceptedEula(personnelId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private usersDB: Map<number, User>;
  private personnelDB: Map<number, Personnel>;
  private categoriesDB: Map<number, Category>;
  private itemsDB: Map<number, InventoryItem>;
  private transactionsDB: Map<number, Transaction>;
  sessionStore: session.Store;
  private userIdCounter: number;
  private personnelIdCounter: number;
  private categoryIdCounter: number;
  private itemIdCounter: number;
  private transactionIdCounter: number;

  constructor() {
    this.usersDB = new Map();
    this.personnelDB = new Map();
    this.categoriesDB = new Map();
    this.itemsDB = new Map();
    this.transactionsDB = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.userIdCounter = 1;
    this.personnelIdCounter = 1;
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

    // Create sample personnel
    await this.createPersonnel({
      firstName: "John",
      lastName: "Smith",
      division: "Operations",
      department: "Deck",
      rank: "PO1",
      jDial: "555-1234",
      lcpoName: "CPO Johnson",
      isActive: true
    });
    
    await this.createPersonnel({
      firstName: "Sarah",
      lastName: "Rodriguez",
      division: "Engineering",
      department: "Mechanical",
      rank: "PO2",
      jDial: "555-2345",
      lcpoName: "CPO Thompson",
      isActive: true
    });
    
    await this.createPersonnel({
      firstName: "Michael",
      lastName: "Chen",
      division: "Logistics",
      department: "Supply",
      rank: "PO3",
      jDial: "555-3456",
      lcpoName: "CPO Williams",
      isActive: true
    });
    
    await this.createPersonnel({
      firstName: "Jessica",
      lastName: "Wilson",
      division: "Medical",
      department: "Administration",
      rank: "HM2",
      jDial: "555-4567",
      lcpoName: "CPO Martinez",
      isActive: true
    });
    
    await this.createPersonnel({
      firstName: "Robert",
      lastName: "Davis",
      division: "Operations",
      department: "Communications",
      rank: "IT1",
      jDial: "555-5678",
      lcpoName: "CPO Johnson",
      isActive: false
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
  
  // Personnel methods
  async getPersonnel(id: number): Promise<Personnel | undefined> {
    return this.personnelDB.get(id);
  }
  
  async getAllPersonnel(): Promise<Personnel[]> {
    return Array.from(this.personnelDB.values());
  }
  
  async createPersonnel(insertPersonnel: InsertPersonnel): Promise<Personnel> {
    const id = this.personnelIdCounter++;
    const now = new Date();
    const person: Personnel = { 
      ...insertPersonnel, 
      id,
      dateAdded: now,
      isActive: insertPersonnel.isActive !== undefined ? insertPersonnel.isActive : true
    };
    this.personnelDB.set(id, person);
    return person;
  }
  
  async updatePersonnel(id: number, personnelData: Partial<InsertPersonnel>): Promise<Personnel | undefined> {
    const existingPerson = this.personnelDB.get(id);
    if (!existingPerson) {
      return undefined;
    }
    
    const updatedPerson = { ...existingPerson, ...personnelData };
    this.personnelDB.set(id, updatedPerson);
    return updatedPerson;
  }
  
  async deletePersonnel(id: number): Promise<boolean> {
    if (!this.personnelDB.has(id)) {
      return false;
    }
    
    // Instead of deleting, mark as inactive
    const existingPerson = this.personnelDB.get(id)!;
    this.personnelDB.set(id, { ...existingPerson, isActive: false });
    return true;
  }
  
  async searchPersonnel(query: string): Promise<Personnel[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.personnelDB.values()).filter(person => {
      // Only include active personnel in search results
      if (!person.isActive) return false;
      
      // Search across multiple fields
      return (
        person.firstName.toLowerCase().includes(searchTerm) ||
        person.lastName.toLowerCase().includes(searchTerm) ||
        person.division.toLowerCase().includes(searchTerm) ||
        person.department.toLowerCase().includes(searchTerm) ||
        (person.rank && person.rank.toLowerCase().includes(searchTerm)) ||
        (person.jDial && person.jDial.toLowerCase().includes(searchTerm)) ||
        (person.lcpoName && person.lcpoName.toLowerCase().includes(searchTerm))
      );
    });
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
      
      // Find the most recent checkout that hasn't been returned
      const lastCheckout = transactions.find(t => t.type === 'check-out' && !t.returnDate);
      
      if (lastCheckout) {
        console.log(`[DEBUG] Item ${item.name} (ID: ${item.id}) is checked out in transaction ${lastCheckout.id}`);
        
        // Use personnel instead of users for checkout association
        const personnel = this.personnelDB.get(lastCheckout.userId);
        if (personnel) {
          checkedOutBy = {
            id: personnel.id,
            fullName: `${personnel.firstName} ${personnel.lastName}`,
            division: personnel.division,
            department: personnel.department,
            jDial: personnel.jDial
          };
          console.log(`[DEBUG] Item checked out by: ${checkedOutBy.fullName} (ID: ${checkedOutBy.id})`);
        } else {
          console.log(`[DEBUG] WARNING: Personnel with ID ${lastCheckout.userId} not found for checkout transaction`);
        }
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
    
    // Debug logging
    console.log(`[DEBUG] Creating transaction - type: ${insertTransaction.type}, itemId: ${insertTransaction.itemId}, userId: ${insertTransaction.userId}`);
    
    // Ensure quantity is defined
    const transactionData = {
      ...insertTransaction,
      quantity: insertTransaction.quantity || 1  // Default to 1 if quantity is undefined
    };
    
    // Set a default due date of 24 hours from now for check-outs if not provided
    let dueDate = transactionData.dueDate;
    if (transactionData.type === 'check-out' && !dueDate) {
      dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
    
    const transaction: Transaction = { 
      ...transactionData, 
      id, 
      timestamp: now, 
      dueDate,
      returnDate: null,
      isOverdue: false
    };
    
    this.transactionsDB.set(id, transaction);
    console.log(`[DEBUG] Transaction created and stored in DB with ID: ${id}`);
    
    // Update inventory item availability
    const item = this.itemsDB.get(transactionData.itemId);
    if (item) {
      console.log(`[DEBUG] Found item: ${item.name} (ID: ${item.id}), current available: ${item.availableQuantity}, total: ${item.totalQuantity}`);
      
      if (transactionData.type === 'check-out') {
        // Decrease available quantity
        const newAvailable = Math.max(0, item.availableQuantity - transactionData.quantity);
        console.log(`[DEBUG] Check-out: Decreasing available quantity from ${item.availableQuantity} to ${newAvailable}`);
        
        this.itemsDB.set(item.id, {
          ...item,
          availableQuantity: newAvailable,
          status: newAvailable === 0 ? 'out-of-stock' : 'available'
        });
      } else if (transactionData.type === 'check-in') {
        // Increase available quantity
        const newAvailable = Math.min(item.totalQuantity, item.availableQuantity + transactionData.quantity);
        console.log(`[DEBUG] Check-in: Increasing available quantity from ${item.availableQuantity} to ${newAvailable}`);
        
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
          console.log(`[DEBUG] Found matching checkout transaction ID: ${checkoutTransaction.id}, marking as returned`);
          this.transactionsDB.set(checkoutTransaction.id, {
            ...checkoutTransaction,
            returnDate: now
          });
        } else {
          console.log(`[DEBUG] No matching checkout transaction found for item ID: ${item.id}`);
        }
      }
    } else {
      console.log(`[DEBUG] WARNING: Item with ID ${transactionData.itemId} not found`);
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
  
  // Check for overdue items
  async checkOverdueItems(): Promise<Transaction[]> {
    const now = new Date();
    const overdueTransactions: Transaction[] = [];
    
    // Find all checked out items that are overdue
    const checkoutTransactions = Array.from(this.transactionsDB.values())
      .filter(t => t.type === 'check-out' && !t.returnDate && t.dueDate);
    
    for (const transaction of checkoutTransactions) {
      if (transaction.dueDate && new Date(transaction.dueDate) < now && !transaction.isOverdue) {
        // Mark as overdue
        const updatedTransaction = { 
          ...transaction, 
          isOverdue: true 
        };
        this.transactionsDB.set(transaction.id, updatedTransaction);
        overdueTransactions.push(updatedTransaction);
      }
    }
    
    return overdueTransactions;
  }
  
  // Get all transactions with details
  async getAllTransactionsWithDetails(): Promise<TransactionWithDetails[]> {
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
        
        // Get personnel data for the transaction
        const personnel = await this.getPersonnel(transaction.userId);
        
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
          // Add personnel data if available
          person: personnel || undefined
        });

        // Log for debugging
        console.log(`[TRANSACTION DEBUG] Added transaction detail for ID ${transaction.id}`);
        console.log(`[TRANSACTION DEBUG] Item: ${item.name}, User: ${user.firstName} ${user.lastName}`);
        if (personnel) {
          console.log(`[TRANSACTION DEBUG] Personnel: ${personnel.firstName} ${personnel.lastName}, Division: ${personnel.division || 'N/A'}`);
        }
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
  
  // Helper method to get category by ID
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categoriesDB.get(id);
  }
  
  // Get all overdue items
  async getOverdueItems(): Promise<TransactionWithDetails[]> {
    // First check and update overdue status
    await this.checkOverdueItems();
    
    // Get all overdue transactions
    const overdueTransactions = Array.from(this.transactionsDB.values())
      .filter(t => t.isOverdue && !t.returnDate);
    
    // Add item and user details
    const result: TransactionWithDetails[] = [];
    for (const transaction of overdueTransactions) {
      const item = await this.getInventoryItemWithCategory(transaction.itemId);
      const user = this.personnelDB.get(transaction.userId);
      
      if (item && user) {
        // Add in category information
        const itemWithCategory = {
          ...item,
          category: {
            id: item.categoryId,
            name: (await this.getCategoryById(item.categoryId))?.name || "Unknown"
          }
        };
        
        // Get personnel data for the transaction
        const personnel = await this.getPersonnel(transaction.userId);
        
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
          // Add personnel data if available
          person: personnel || undefined
        });
      }
    }
    
    return result;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    const items = await this.getAllInventoryItems();
    const personnel = await this.getAllPersonnel();
    
    // Check for overdue items first
    await this.checkOverdueItems();
    
    // Calculate stats - count unique items, not quantities
    const totalItems = items.length;
    
    // Count items that are available to be checked out (have at least one available)
    const availableItems = items.filter(item => item.availableQuantity > 0).length;
    
    // Only count items that have been assigned to a user (have checkedOutBy property)
    // This gets the actual checked out items, not just ones with quantity differences
    const checkedOutItems = (await this.getAllInventoryItemsWithCategory())
      .filter(item => !!item.checkedOutBy)
      .length;
    
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
      const item = await this.getInventoryItemWithCategory(transaction.itemId);
      const user = this.personnelDB.get(transaction.userId);
      
      if (item && user) {
        // Add in category information
        const itemWithCategory = {
          ...item,
          category: {
            id: item.categoryId,
            name: (await this.getCategoryById(item.categoryId))?.name || "Unknown"
          }
        };
        
        // Get personnel data for the transaction
        const personnel = await this.getPersonnel(transaction.userId);
        
        recentActivity.push({
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
          // Add personnel data if available
          person: personnel || undefined
        });
      }
    }
    
    // Get overdue items
    const overdueItems = await this.getOverdueItems();
    
    return {
      totalItems,
      checkedOutItems,
      availableItems,
      totalUsers: personnel.length,
      lowStockItems,
      recentActivity,
      overdueItems
    };
  }
  
  // Privacy Agreement methods
  private privacyAgreementsDB: Map<number, PrivacyAgreement> = new Map();
  private privacyAgreementIdCounter: number = 1;
  
  async createPrivacyAgreement(agreement: InsertPrivacyAgreement): Promise<PrivacyAgreement> {
    const id = this.privacyAgreementIdCounter++;
    const now = new Date();
    
    const privacyAgreement: PrivacyAgreement = {
      ...agreement,
      id,
      agreedAt: now,
      version: agreement.version || "1.0"
    };
    
    this.privacyAgreementsDB.set(id, privacyAgreement);
    return privacyAgreement;
  }
  
  async getPrivacyAgreementByPersonnel(personnelId: number): Promise<PrivacyAgreement | undefined> {
    return Array.from(this.privacyAgreementsDB.values())
      .filter(agreement => agreement.personnelId === personnelId)
      .sort((a, b) => {
        if (!a.agreedAt || !b.agreedAt) return 0;
        return new Date(b.agreedAt).getTime() - new Date(a.agreedAt).getTime();
      })[0];
  }
  
  async getPrivacyAgreementsByVersion(version: string): Promise<PrivacyAgreement[]> {
    return Array.from(this.privacyAgreementsDB.values())
      .filter(agreement => agreement.version === version);
  }
  
  async checkPersonnelHasAgreed(personnelId: number): Promise<boolean> {
    const agreement = await this.getPrivacyAgreementByPersonnel(personnelId);
    return !!agreement;
  }
  
  // EULA Agreement methods
  private eulaAgreementsDB: Map<number, EulaAgreement> = new Map();
  private eulaAgreementIdCounter: number = 1;
  
  async createEulaAgreement(agreement: InsertEulaAgreement): Promise<EulaAgreement> {
    const id = this.eulaAgreementIdCounter++;
    const now = new Date();
    
    const eulaAgreement: EulaAgreement = {
      ...agreement,
      id,
      agreedAt: now,
      version: agreement.version || "1.0"
    };
    
    this.eulaAgreementsDB.set(id, eulaAgreement);
    return eulaAgreement;
  }
  
  async getEulaAgreementByPersonnel(personnelId: number): Promise<EulaAgreement | undefined> {
    return Array.from(this.eulaAgreementsDB.values())
      .filter(agreement => agreement.personnelId === personnelId)
      .sort((a, b) => {
        if (!a.agreedAt || !b.agreedAt) return 0;
        return new Date(b.agreedAt).getTime() - new Date(a.agreedAt).getTime();
      })[0];
  }
  
  async getEulaAgreementsByVersion(version: string): Promise<EulaAgreement[]> {
    return Array.from(this.eulaAgreementsDB.values())
      .filter(agreement => agreement.version === version);
  }
  
  async checkPersonnelHasAcceptedEula(personnelId: number): Promise<boolean> {
    const agreement = await this.getEulaAgreementByPersonnel(personnelId);
    return !!agreement;
  }
}

export const storage = new MemStorage();
