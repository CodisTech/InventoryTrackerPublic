import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth, comparePasswords, hashPassword } from "./auth";
import { storage } from "./storage";
import { 
  insertInventoryItemSchema, 
  insertUserSchema, 
  insertCategorySchema, 
  insertTransactionSchema, 
  insertPersonnelSchema,
  insertPrivacyAgreementSchema,
  insertEulaAgreementSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import { parse } from "csv-parse";
import { Readable } from "stream";
import { promisify } from "util";
import { scrypt, randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  const { ensureAuthenticated, csrfProtection } = setupAuth(app);
  
  // Add password change endpoint for superadmins
  app.post("/api/change-password", ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Verify req.user is correctly typed and available
      const authenticatedUser = req.user as any; // Cast to any to avoid typescript issues
      if (!authenticatedUser || !authenticatedUser.id) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      
      const { currentPassword, newPassword } = req.body;
      const userId = authenticatedUser.id;
      
      console.log("Attempting to change password for user ID:", userId);
      
      // Get user from storage
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isCorrectPassword = await comparePasswords(currentPassword, user.password);
      if (!isCorrectPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user with new password
      const updatedUser = await storage.updateUser(userId, {
        password: hashedPassword
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      console.log("Password successfully updated for user ID:", userId);
      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      console.error("Error changing password:", err);
      next(err);
    }
  });
  
  // Health check endpoint for Docker (no authentication required)
  app.get("/api/health", async (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  // CSRF token endpoint for authenticated users
  app.get("/api/csrf-token", ensureAuthenticated, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  // Dashboard
  app.get("/api/dashboard/stats", ensureAuthenticated, async (req, res, next) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // Overdue items endpoint
  app.get("/api/overdue-items", ensureAuthenticated, async (req, res, next) => {
    try {
      // Check and update overdue status first
      await storage.checkOverdueItems();
      
      // Get all overdue items
      const overdueItems = await storage.getOverdueItems();
      res.json(overdueItems);
    } catch (error) {
      next(error);
    }
  });

  // Categories
  app.get("/api/categories", ensureAuthenticated, async (req, res, next) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/categories", ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const existingCategory = await storage.getCategoryByName(validatedData.name);
      
      if (existingCategory) {
        return res.status(400).json({ message: "Category already exists" });
      }
      
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      next(error);
    }
  });

  // Inventory Items
  app.get("/api/inventory", ensureAuthenticated, async (req, res, next) => {
    try {
      const items = await storage.getAllInventoryItemsWithCategory();
      res.json(items);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/inventory/:id", ensureAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const item = await storage.getInventoryItemWithCategory(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/inventory", ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
      const validatedData = insertInventoryItemSchema.parse(req.body);
      
      // Check if item code already exists
      const existingItem = await storage.getInventoryItemByCode(validatedData.itemCode);
      if (existingItem) {
        return res.status(400).json({ message: "Item code already exists" });
      }
      
      // Check if category exists
      const category = await storage.getUser(validatedData.categoryId);
      if (!category) {
        return res.status(400).json({ message: "Category not found" });
      }
      
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      next(error);
    }
  });

  app.patch("/api/inventory/:id", ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const existingItem = await storage.getInventoryItem(id);
      if (!existingItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      // Allow partial updates
      const updatedItem = await storage.updateInventoryItem(id, req.body);
      res.json(updatedItem);
    } catch (error) {
      next(error);
    }
  });

  // Transactions
  app.get("/api/transactions", ensureAuthenticated, async (req, res, next) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/transactions/details", ensureAuthenticated, async (req, res, next) => {
    try {
      const transactions = await storage.getAllTransactionsWithDetails();
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/transactions", ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
      // Ensure quantity is always set with a default value if not provided
      const dataWithDefaults = {
        ...req.body,
        quantity: req.body.quantity || 1,
        // If administratorId is not provided, default to the authenticated user
        administratorId: req.body.administratorId || req.user?.id
      };
      
      // Transaction dates:
      // 1. timestamp - automatically set to current time on both check-in and check-out
      // 2. dueDate - for check-out, set to 24 hours from now (overriding any provided value)
      // 3. returnDate - automatically set on check-in transactions
      
      const now = new Date();
      
      if (dataWithDefaults.type === 'check-in') {
        // For check-in, set returnDate to now
        dataWithDefaults.returnDate = now;
      } else if (dataWithDefaults.type === 'check-out') {
        // For check-out, set dueDate to 24 hours from now
        const dueDate = new Date(now);
        dueDate.setHours(dueDate.getHours() + 24);
        dataWithDefaults.dueDate = dueDate.toISOString();
      }
      
      const validatedData = insertTransactionSchema.parse(dataWithDefaults);
      
      // Check if item exists
      const item = await storage.getInventoryItem(validatedData.itemId);
      if (!item) {
        return res.status(400).json({ message: "Item not found" });
      }
      
      // Check if personnel exists instead of user
      const personnel = await storage.getPersonnel(validatedData.userId);
      if (!personnel) {
        return res.status(400).json({ message: "Personnel not found" });
      }
      
      // For check-out, verify that enough quantity is available
      const quantity = validatedData.quantity || 1; // Ensure quantity is defined
      if (validatedData.type === 'check-out' && item.availableQuantity < quantity) {
        return res.status(400).json({ 
          message: "Not enough quantity available",
          available: item.availableQuantity
        });
      }
      
      // Log the administrator info for debugging
      console.log(`Transaction created by administrator: ${req.user?.username} (ID: ${req.user?.id})`);
      
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      next(error);
    }
  });

  // Users
  app.get("/api/users", ensureAuthenticated, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      // Don't return password hashes
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users", ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password
      const scryptAsync = promisify(scrypt);
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(validatedData.password, salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;
      
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      
      // Don't return the password hash
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      next(error);
    }
  });

  app.patch("/api/users/:id", ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If updating password, hash it
      let updatedData = { ...req.body };
      if (req.body.password) {
        const scryptAsync = promisify(scrypt);
        const salt = randomBytes(16).toString("hex");
        const buf = (await scryptAsync(req.body.password, salt, 64)) as Buffer;
        updatedData.password = `${buf.toString("hex")}.${salt}`;
      }
      
      const updatedUser = await storage.updateUser(id, updatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password hash
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  // Personnel
  app.get("/api/personnel", ensureAuthenticated, async (req, res, next) => {
    try {
      const searchQuery = req.query.q as string | undefined;
      
      if (searchQuery && searchQuery.trim().length > 0) {
        const results = await storage.searchPersonnel(searchQuery.trim());
        res.json(results);
      } else {
        const personnel = await storage.getAllPersonnel();
        res.json(personnel);
      }
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/personnel/:id", ensureAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const person = await storage.getPersonnel(id);
      if (!person) {
        return res.status(404).json({ message: "Personnel not found" });
      }
      
      res.json(person);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/personnel", ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
      const validatedData = insertPersonnelSchema.parse(req.body);
      const person = await storage.createPersonnel(validatedData);
      res.status(201).json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      next(error);
    }
  });

  app.patch("/api/personnel/:id", ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const existingPerson = await storage.getPersonnel(id);
      if (!existingPerson) {
        return res.status(404).json({ message: "Personnel not found" });
      }
      
      const updatedPerson = await storage.updatePersonnel(id, req.body);
      res.json(updatedPerson);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/personnel/:id", ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deletePersonnel(id);
      if (!success) {
        return res.status(404).json({ message: "Personnel not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Privacy Agreement endpoints
  app.post("/api/privacy-agreements", ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
      const validatedData = insertPrivacyAgreementSchema.parse(req.body);
      
      // Check if personnel exists
      const personnel = await storage.getPersonnel(validatedData.personnelId);
      if (!personnel) {
        return res.status(400).json({ message: "Personnel not found" });
      }
      
      // Include IP address if available
      const ipAddress = req.ip || req.socket.remoteAddress || null;
      const privacyAgreement = await storage.createPrivacyAgreement({
        ...validatedData,
        ipAddress
      });
      
      res.status(201).json(privacyAgreement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      next(error);
    }
  });

  app.get("/api/privacy-agreements/personnel/:personnelId", ensureAuthenticated, async (req, res, next) => {
    try {
      const personnelId = parseInt(req.params.personnelId);
      if (isNaN(personnelId)) {
        return res.status(400).json({ message: "Invalid personnel ID format" });
      }
      
      const agreement = await storage.getPrivacyAgreementByPersonnel(personnelId);
      if (!agreement) {
        return res.status(404).json({ message: "No privacy agreement found for this personnel" });
      }
      
      res.json(agreement);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/privacy-agreements/check/:personnelId", ensureAuthenticated, async (req, res, next) => {
    try {
      const personnelId = parseInt(req.params.personnelId);
      if (isNaN(personnelId)) {
        return res.status(400).json({ message: "Invalid personnel ID format" });
      }
      
      const hasAgreed = await storage.checkPersonnelHasAgreed(personnelId);
      res.json({ hasAgreed });
    } catch (error) {
      next(error);
    }
  });

  // EULA Agreement endpoints
  app.post("/api/eula-agreements", ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
      const validatedData = insertEulaAgreementSchema.parse(req.body);
      
      // Check if personnel exists
      const personnel = await storage.getPersonnel(validatedData.personnelId);
      if (!personnel) {
        return res.status(400).json({ message: "Personnel not found" });
      }
      
      // Include IP address if available
      const ipAddress = req.ip || req.socket.remoteAddress || null;
      const eulaAgreement = await storage.createEulaAgreement({
        ...validatedData,
        ipAddress
      });
      
      res.status(201).json(eulaAgreement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      next(error);
    }
  });

  app.get("/api/eula-agreements/personnel/:personnelId", ensureAuthenticated, async (req, res, next) => {
    try {
      const personnelId = parseInt(req.params.personnelId);
      if (isNaN(personnelId)) {
        return res.status(400).json({ message: "Invalid personnel ID format" });
      }
      
      const agreement = await storage.getEulaAgreementByPersonnel(personnelId);
      if (!agreement) {
        return res.status(404).json({ message: "No EULA agreement found for this personnel" });
      }
      
      res.json(agreement);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/eula-agreements/check/:personnelId", ensureAuthenticated, async (req, res, next) => {
    try {
      const personnelId = parseInt(req.params.personnelId);
      if (isNaN(personnelId)) {
        return res.status(400).json({ message: "Invalid personnel ID format" });
      }
      
      const hasAccepted = await storage.checkPersonnelHasAcceptedEula(personnelId);
      res.json({ hasAccepted });
    } catch (error) {
      next(error);
    }
  });

  // Reports endpoints
  app.get("/api/reports/personnel-activity", ensureAuthenticated, async (req, res, next) => {
    try {
      const personnelActivity = await storage.getPersonnelActivity();
      res.json(personnelActivity);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/reports/department-usage", ensureAuthenticated, async (req, res, next) => {
    try {
      const departmentUsage = await storage.getDepartmentUsage();
      res.json(departmentUsage);
    } catch (error) {
      next(error);
    }
  });

  // Setup multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });

  // Bulk upload routes
  // CSV Upload for Personnel
  app.post("/api/personnel/bulk-upload", ensureAuthenticated, csrfProtection, upload.single('file'), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvBuffer = req.file.buffer;
      const results: any[] = [];
      const errors: any[] = [];
      let successCount = 0;

      // Stream the CSV file
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      // Process the CSV data
      const records: any[] = [];
      parser.on('readable', function() {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      // Handle parsing errors
      parser.on('error', function(err) {
        return res.status(400).json({
          message: "Error parsing CSV file",
          error: err.message
        });
      });

      // When parsing is complete, create records
      parser.on('end', async function() {
        for (const record of records) {
          try {
            // Map CSV columns to personnel schema
            const personnelData = {
              firstName: record.firstName || record['First Name'],
              lastName: record.lastName || record['Last Name'],
              division: record.division || record['Division'],
              department: record.department || record['Department'],
              jDial: record.jDial || record['J-Dial'] || null,
              rank: record.rank || record['Rank'] || null,
              lcpoName: record.lcpoName || record['LCPO Name'] || null,
              isActive: true
            };

            // Validate the data
            const validatedData = insertPersonnelSchema.parse(personnelData);
            
            // Create the personnel record
            const person = await storage.createPersonnel(validatedData);
            results.push(person);
            successCount++;
          } catch (error) {
            if (error instanceof z.ZodError) {
              errors.push({
                record,
                error: fromZodError(error).message
              });
            } else {
              errors.push({
                record,
                error: error instanceof Error ? error.message : "Unknown error"
              });
            }
          }
        }

        // Return the results
        res.status(200).json({
          message: `Processed ${records.length} records. Successfully added ${successCount} personnel.`,
          successCount,
          errorCount: errors.length,
          results,
          errors
        });
      });

      // Feed the parser with data
      Readable.from(csvBuffer).pipe(parser);

    } catch (error) {
      next(error);
    }
  });

  // CSV Upload for Inventory Items
  app.post("/api/inventory/bulk-upload", ensureAuthenticated, csrfProtection, upload.single('file'), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvBuffer = req.file.buffer;
      const results: any[] = [];
      const errors: any[] = [];
      let successCount = 0;

      // Get all categories for reference
      const categories = await storage.getAllCategories();
      const categoryMap = new Map();
      categories.forEach(cat => {
        categoryMap.set(cat.name.toLowerCase(), cat.id);
      });

      // Stream the CSV file
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      // Process the CSV data
      const records: any[] = [];
      parser.on('readable', function() {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      // Handle parsing errors
      parser.on('error', function(err) {
        return res.status(400).json({
          message: "Error parsing CSV file",
          error: err.message
        });
      });

      // When parsing is complete, create records
      parser.on('end', async function() {
        for (const record of records) {
          try {
            // Get category ID from name
            const categoryName = record.category || record['Category'];
            const categoryId = categoryMap.get(categoryName?.toLowerCase());
            
            if (!categoryId) {
              errors.push({
                record,
                error: `Category '${categoryName}' not found`
              });
              continue;
            }

            // Map CSV columns to inventory item schema
            const itemData = {
              itemCode: record.itemCode || record['Item Code'],
              name: record.name || record['Name'],
              description: record.description || record['Description'] || null,
              categoryId: categoryId,
              totalQuantity: parseInt(record.totalQuantity || record['Total Quantity'] || 1),
              availableQuantity: parseInt(record.availableQuantity || record['Available Quantity'] || 1),
              minStockLevel: parseInt(record.minStockLevel || record['Min Stock Level'] || 5),
              status: record.status || record['Status'] || 'available',
              checkoutAlertDays: parseInt(record.checkoutAlertDays || record['Checkout Alert Days'] || 7)
            };

            // Check if item code already exists
            const existingItem = await storage.getInventoryItemByCode(itemData.itemCode);
            if (existingItem) {
              errors.push({
                record,
                error: `Item code '${itemData.itemCode}' already exists`
              });
              continue;
            }

            // Validate the data
            const validatedData = insertInventoryItemSchema.parse(itemData);
            
            // Create the inventory item
            const item = await storage.createInventoryItem(validatedData);
            results.push(item);
            successCount++;
          } catch (error) {
            if (error instanceof z.ZodError) {
              errors.push({
                record,
                error: fromZodError(error).message
              });
            } else {
              errors.push({
                record,
                error: error instanceof Error ? error.message : "Unknown error"
              });
            }
          }
        }

        // Return the results
        res.status(200).json({
          message: `Processed ${records.length} records. Successfully added ${successCount} inventory items.`,
          successCount,
          errorCount: errors.length,
          results,
          errors
        });
      });

      // Feed the parser with data
      Readable.from(csvBuffer).pipe(parser);

    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
