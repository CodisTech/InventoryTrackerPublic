import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertInventoryItemSchema, 
  insertUserSchema, 
  insertCategorySchema, 
  insertTransactionSchema, 
  insertPersonnelSchema 
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  const { ensureAuthenticated } = setupAuth(app);

  // Dashboard
  app.get("/api/dashboard/stats", ensureAuthenticated, async (req, res, next) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
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

  app.post("/api/categories", ensureAuthenticated, async (req, res, next) => {
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

  app.post("/api/inventory", ensureAuthenticated, async (req, res, next) => {
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

  app.patch("/api/inventory/:id", ensureAuthenticated, async (req, res, next) => {
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

  app.post("/api/transactions", ensureAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Check if item exists
      const item = await storage.getInventoryItem(validatedData.itemId);
      if (!item) {
        return res.status(400).json({ message: "Item not found" });
      }
      
      // Check if user exists
      const user = await storage.getUser(validatedData.userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      
      // For check-out, verify that enough quantity is available
      if (validatedData.type === 'check-out' && item.availableQuantity < validatedData.quantity) {
        return res.status(400).json({ 
          message: "Not enough quantity available",
          available: item.availableQuantity
        });
      }
      
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

  app.post("/api/users", ensureAuthenticated, async (req, res, next) => {
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

  app.patch("/api/users/:id", ensureAuthenticated, async (req, res, next) => {
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

  app.post("/api/personnel", ensureAuthenticated, async (req, res, next) => {
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

  app.patch("/api/personnel/:id", ensureAuthenticated, async (req, res, next) => {
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

  app.delete("/api/personnel/:id", ensureAuthenticated, async (req, res, next) => {
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

  const httpServer = createServer(app);
  return httpServer;
}

import { promisify } from "util";
import { scrypt, randomBytes } from "crypto";
