import { 
  users, categories, inventoryItems, transactions, personnel, privacyAgreements, eulaAgreements,
  type User, type InsertUser, 
  type Personnel, type InsertPersonnel,
  type Category, type InsertCategory, 
  type InventoryItem, type InsertInventoryItem,
  type Transaction, type InsertTransaction, 
  type DashboardStats, type InventoryItemWithCategory,
  type TransactionWithDetails,
  type PersonnelActivity,
  type DepartmentUsage,
  type PrivacyAgreement, type InsertPrivacyAgreement,
  type EulaAgreement, type InsertEulaAgreement
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, or, ilike } from 'drizzle-orm';
import connectPg from 'connect-pg-simple';

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

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
  checkOverdueItems(): Promise<Transaction[]>;
  getOverdueItems(): Promise<TransactionWithDetails[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<DashboardStats>;
  
  // Report methods
  getPersonnelActivity(): Promise<PersonnelActivity[]>;
  getDepartmentUsage(): Promise<DepartmentUsage[]>;
  
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
    // Create super admin user
    const superAdmin = await this.createUser({
      username: "superadmin",
      password: "superadmin123", // This will NOT be hashed by auth.ts since we're calling createUser directly
      fullName: "Super Administrator",
      role: "super_admin",
      isAuthorized: true
    });
    
    // Create admin user
    const admin = await this.createUser({
      username: "admin",
      password: "admin123", // This will NOT be hashed by auth.ts since we're calling createUser directly
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
    
    console.log(`[TRANSACTION DEBUG] Found ${allTransactions.length} transactions to process`);
    
    for (const transaction of allTransactions) {
      console.log(`[TRANSACTION DEBUG] Processing transaction ID ${transaction.id}, itemId: ${transaction.itemId}, userId: ${transaction.userId}`);
      
      // Retrieve the item with its category
      const item = await this.getInventoryItem(transaction.itemId);
      
      // For users, we need to look in the personnel database since we use personnel as users
      const user = await this.getPersonnel(transaction.userId);
      
      // Get the administrator info if available
      let admin = null;
      if (transaction.administratorId) {
        admin = await this.getUser(transaction.administratorId);
      }
      
      if (item && user) {
        // Get the category for this item
        const category = await this.getCategoryById(item.categoryId);
        
        // Add in category information to make it a complete item with category
        const itemWithCategory = {
          ...item,
          category: {
            id: item.categoryId,
            name: category?.name || "Unknown"
          }
        };
        
        const transactionWithDetails: TransactionWithDetails = {
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
          // Add personnel data (which is the same as user in our case)
          person: user
        };
        
        // Add administrator if available
        if (admin) {
          transactionWithDetails.administrator = {
            id: admin.id,
            username: admin.username,
            fullName: admin.fullName,
            role: admin.role,
            isAuthorized: admin.isAuthorized,
            password: '' // Don't include password
          };
        }
        
        result.push(transactionWithDetails);

        // Log for debugging
        console.log(`[TRANSACTION DEBUG] Added transaction detail for ID ${transaction.id}`);
        console.log(`[TRANSACTION DEBUG] Item: ${item.name}, User: ${user.firstName} ${user.lastName}`);
        if (admin) {
          console.log(`[TRANSACTION DEBUG] Administrator: ${admin.fullName}`);
        }
      } else {
        console.log(`[TRANSACTION DEBUG] Skipped transaction ID ${transaction.id}, item or user not found`);
        console.log(`[TRANSACTION DEBUG] Item ID: ${transaction.itemId}, User ID: ${transaction.userId}`);
        if (!item) console.log(`[TRANSACTION DEBUG] Item not found with ID ${transaction.itemId}`);
        if (!user) console.log(`[TRANSACTION DEBUG] User (Personnel) not found with ID ${transaction.userId}`);
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
    
    console.log(`[TRANSACTION DEBUG] Found ${overdueTransactions.length} overdue transactions to process`);
    
    // Add item and user details
    const result: TransactionWithDetails[] = [];
    for (const transaction of overdueTransactions) {
      console.log(`[TRANSACTION DEBUG] Processing overdue transaction ID ${transaction.id}, itemId: ${transaction.itemId}, userId: ${transaction.userId}`);
      
      // Retrieve the item with its category
      const item = await this.getInventoryItem(transaction.itemId);
      
      // For users, we need to look in the personnel database since we use personnel as users
      const user = await this.getPersonnel(transaction.userId);
      
      // Get the administrator info if available
      let admin = null;
      if (transaction.administratorId) {
        admin = await this.getUser(transaction.administratorId);
      }
      
      if (item && user) {
        // Get the category for this item
        const category = await this.getCategoryById(item.categoryId);
        
        // Add in category information
        const itemWithCategory = {
          ...item,
          category: {
            id: item.categoryId,
            name: category?.name || "Unknown"
          }
        };
        
        const transactionWithDetails: TransactionWithDetails = {
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
          // Add personnel data (which is the same as user in our case)
          person: user
        };
        
        // Add administrator if available
        if (admin) {
          transactionWithDetails.administrator = {
            id: admin.id,
            username: admin.username,
            fullName: admin.fullName,
            role: admin.role,
            isAuthorized: admin.isAuthorized,
            password: '' // Don't include password
          };
        }
        
        result.push(transactionWithDetails);
        
        console.log(`[TRANSACTION DEBUG] Added overdue transaction detail for ID ${transaction.id}`);
        if (admin) {
          console.log(`[TRANSACTION DEBUG] Administrator: ${admin.fullName}`);
        }
      } else {
        console.log(`[TRANSACTION DEBUG] Skipped overdue transaction ID ${transaction.id}, item or user not found`);
        if (!item) console.log(`[TRANSACTION DEBUG] Item not found with ID ${transaction.itemId}`);
        if (!user) console.log(`[TRANSACTION DEBUG] User (Personnel) not found with ID ${transaction.userId}`);
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
    
    console.log(`[DASHBOARD DEBUG] Found ${sortedTransactions.length} recent transactions to process`);
    
    const recentActivity: TransactionWithDetails[] = [];
    for (const transaction of sortedTransactions) {
      console.log(`[DASHBOARD DEBUG] Processing recent transaction ID ${transaction.id}, itemId: ${transaction.itemId}, userId: ${transaction.userId}`);
      
      // Retrieve the item with its category
      const item = await this.getInventoryItem(transaction.itemId);
      
      // For users, we need to look in the personnel database since we use personnel as users
      const user = await this.getPersonnel(transaction.userId);
      
      if (item && user) {
        // Get the category for this item
        const category = await this.getCategoryById(item.categoryId);
        
        // Add in category information
        const itemWithCategory = {
          ...item,
          category: {
            id: item.categoryId,
            name: category?.name || "Unknown"
          }
        };
        
        // Get the administrator info if available
        let admin = null;
        if (transaction.administratorId) {
          admin = await this.getUser(transaction.administratorId);
        }
        
        const transactionWithDetails: TransactionWithDetails = {
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
          // Add personnel data (which is the same as user in our case)
          person: user
        };
        
        // Add administrator if available
        if (admin) {
          transactionWithDetails.administrator = {
            id: admin.id,
            username: admin.username,
            fullName: admin.fullName,
            role: admin.role,
            isAuthorized: admin.isAuthorized,
            password: '' // Don't include password
          };
        }
        
        recentActivity.push(transactionWithDetails);
        
        console.log(`[DASHBOARD DEBUG] Added recent transaction detail for ID ${transaction.id}`);
      } else {
        console.log(`[DASHBOARD DEBUG] Skipped recent transaction ID ${transaction.id}, item or user not found`);
        if (!item) console.log(`[DASHBOARD DEBUG] Item not found with ID ${transaction.itemId}`);
        if (!user) console.log(`[DASHBOARD DEBUG] User (Personnel) not found with ID ${transaction.userId}`);
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
  
  // Report methods
  async getPersonnelActivity(): Promise<PersonnelActivity[]> {
    // Get all transactions with details
    const transactions = await this.getAllTransactionsWithDetails();
    const personnel = await this.getAllPersonnel();
    const result: PersonnelActivity[] = [];
    
    // Create a map to track personnel activity
    const activityMap = new Map<number, {
      totalTransactions: number;
      checkouts: number;
      checkins: number;
      overdueItems: number;
      lastActivity: Date | null;
    }>();
    
    // Initialize counters for each personnel
    personnel.forEach(person => {
      activityMap.set(person.id, {
        totalTransactions: 0,
        checkouts: 0,
        checkins: 0,
        overdueItems: 0,
        lastActivity: null
      });
    });
    
    // Calculate metrics based on transactions
    for (const transaction of transactions) {
      const personnelId = transaction.user.id;
      const activity = activityMap.get(personnelId);
      
      if (activity) {
        // Update total transactions
        activity.totalTransactions++;
        
        // Update checkout or checkin count
        if (transaction.type === 'check-out') {
          activity.checkouts++;
          
          // Check if overdue (no return date and past due date)
          if (!transaction.returnDate && transaction.dueDate && new Date() > new Date(transaction.dueDate)) {
            activity.overdueItems++;
          }
        } else if (transaction.type === 'check-in') {
          activity.checkins++;
        }
        
        // Update last activity timestamp
        const transactionDate = transaction.timestamp ? new Date(transaction.timestamp) : null;
        if (transactionDate && (!activity.lastActivity || transactionDate > activity.lastActivity)) {
          activity.lastActivity = transactionDate;
        }
      }
    }
    
    // Convert map to array of PersonnelActivity objects
    for (const person of personnel) {
      const activity = activityMap.get(person.id);
      if (activity) {
        result.push({
          personnelId: person.id,
          personnelName: `${person.firstName} ${person.lastName}`,
          division: person.division,
          department: person.department,
          totalTransactions: activity.totalTransactions,
          checkouts: activity.checkouts,
          checkins: activity.checkins,
          overdueItems: activity.overdueItems,
          lastActivity: activity.lastActivity ? activity.lastActivity.toISOString() : undefined
        });
      }
    }
    
    // Sort by total transactions (descending)
    result.sort((a, b) => b.totalTransactions - a.totalTransactions);
    
    return result;
  }
  
  async getDepartmentUsage(): Promise<DepartmentUsage[]> {
    // Get all transactions with details
    const transactions = await this.getAllTransactionsWithDetails();
    const personnel = await this.getAllPersonnel();
    
    // Group personnel by department
    const departmentPersonnel = new Map<string, Set<number>>();
    personnel.forEach(person => {
      if (!person.department) return;
      
      if (!departmentPersonnel.has(person.department)) {
        departmentPersonnel.set(person.department, new Set<number>());
      }
      departmentPersonnel.get(person.department)?.add(person.id);
    });
    
    // Track item usage by department
    const departmentItemUsage = new Map<string, Map<string, number>>();
    
    // Track total transactions by department
    const departmentTransactions = new Map<string, number>();
    
    // Process transactions
    for (const transaction of transactions) {
      // Skip if transaction doesn't have user/personnel details
      if (!transaction.user || !transaction.person || !transaction.person.department) continue;
      
      const department = transaction.person.department;
      
      // Update transaction count
      departmentTransactions.set(
        department, 
        (departmentTransactions.get(department) || 0) + 1
      );
      
      // Update item usage count
      if (transaction.item) {
        if (!departmentItemUsage.has(department)) {
          departmentItemUsage.set(department, new Map<string, number>());
        }
        
        const itemName = transaction.item.name;
        const deptItems = departmentItemUsage.get(department)!;
        deptItems.set(itemName, (deptItems.get(itemName) || 0) + 1);
      }
    }
    
    // Build result array
    const result: DepartmentUsage[] = [];
    
    for (const [department, personIds] of departmentPersonnel.entries()) {
      // Skip departments with no transactions
      if (!departmentTransactions.has(department)) continue;
      
      const transactionCount = departmentTransactions.get(department) || 0;
      const uniquePersonnelCount = personIds.size;
      
      // Calculate checkout frequency (transactions per person)
      const checkoutFrequency = uniquePersonnelCount > 0 
        ? transactionCount / uniquePersonnelCount 
        : 0;
      
      // Get most frequently used items
      const itemUsage = departmentItemUsage.get(department) || new Map<string, number>();
      const mostFrequentItems = Array.from(itemUsage.entries())
        .map(([itemName, count]) => ({ itemName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 most used items
      
      result.push({
        department,
        totalTransactions: transactionCount,
        uniquePersonnel: uniquePersonnelCount,
        mostFrequentItems,
        checkoutFrequency
      });
    }
    
    // Sort by total transactions (descending)
    result.sort((a, b) => b.totalTransactions - a.totalTransactions);
    
    return result;
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

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  private db: any;
  sessionStore: session.Store;
  
  constructor() {
    // Initialize database connection
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    // Configure neon for serverless usage
    neonConfig.fetchConnectionCache = true;
    
    // Create SQL client
    const sql = neon(process.env.DATABASE_URL);
    
    // Initialize drizzle instance
    this.db = drizzle(sql);
    
    // Initialize session store
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true
    });
  }
  
  // We'll need to implement all IStorage methods here for PostgreSQL
  // For example:
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }
  
  async getAllUsers(): Promise<User[]> {
    return this.db.select().from(users);
  }
  
  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await this.db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }
  
  // Personnel methods
  async getPersonnel(id: number): Promise<Personnel | undefined> {
    const result = await this.db.select().from(personnel).where(eq(personnel.id, id)).limit(1);
    return result[0];
  }
  
  async getAllPersonnel(): Promise<Personnel[]> {
    return this.db.select().from(personnel);
  }
  
  async createPersonnel(person: InsertPersonnel): Promise<Personnel> {
    const now = new Date();
    const result = await this.db.insert(personnel).values({
      ...person,
      dateAdded: now.toISOString(),
      isActive: person.isActive !== undefined ? person.isActive : true
    }).returning();
    return result[0];
  }
  
  async updatePersonnel(id: number, person: Partial<InsertPersonnel>): Promise<Personnel | undefined> {
    const result = await this.db.update(personnel).set(person).where(eq(personnel.id, id)).returning();
    return result[0];
  }
  
  async deletePersonnel(id: number): Promise<boolean> {
    const result = await this.db.update(personnel)
      .set({ isActive: false })
      .where(eq(personnel.id, id))
      .returning();
    return result.length > 0;
  }
  
  async searchPersonnel(query: string): Promise<Personnel[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    return this.db.select()
      .from(personnel)
      .where(
        and(
          eq(personnel.isActive, true),
          or(
            ilike(personnel.firstName, searchTerm),
            ilike(personnel.lastName, searchTerm),
            ilike(personnel.division, searchTerm),
            ilike(personnel.department, searchTerm),
            ilike(personnel.rank, searchTerm),
            ilike(personnel.jDial, searchTerm),
            ilike(personnel.lcpoName, searchTerm)
          )
        )
      );
  }
  
  // The rest of the required methods would be implemented similarly,
  // translating the in-memory storage operations to SQL queries.
  // This is a partial implementation for illustration purposes.
  
  // For a full implementation, each method in IStorage would need to be
  // implemented with appropriate SQL queries.
}

// Choose storage implementation based on environment
// If DATABASE_URL is provided, use PostgreSQL, otherwise use in-memory storage
let storageInstance: IStorage;

try {
  if (process.env.DATABASE_URL) {
    console.log('Initializing database storage with PostgreSQL');
    storageInstance = new DatabaseStorage();
  } else {
    console.log('DATABASE_URL not provided, using in-memory storage');
    storageInstance = new MemStorage();
  }
} catch (error) {
  console.error('Error initializing database storage:', error);
  console.log('Falling back to in-memory storage');
  storageInstance = new MemStorage();
}

export const storage = storageInstance;
