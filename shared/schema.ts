import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Role definitions
export const USER_ROLES = {
  STANDARD_USER: "standard",    // Can only check-in/out and view inventory/transactions
  ADMIN: "admin",               // Can manage inventory, personnel, and view reports
  SUPER_ADMIN: "super_admin"    // Full system access, can manage other admins
} as const;

export const userRoleSchema = z.enum([
  USER_ROLES.STANDARD_USER,
  USER_ROLES.ADMIN,
  USER_ROLES.SUPER_ADMIN
]);

export type UserRole = z.infer<typeof userRoleSchema>;

// User Schema (for accounts with system access)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default(USER_ROLES.STANDARD_USER),
  isAuthorized: boolean("is_authorized").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
  isAuthorized: true,
});

// Personnel Schema (for staff who can check out items)
export const personnel = pgTable("personnel", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  division: text("division").notNull(),
  department: text("department").notNull(),
  jDial: text("j_dial"),
  rank: text("rank"),
  lcpoName: text("lcpo_name"),
  dateAdded: date("date_added").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertPersonnelSchema = createInsertSchema(personnel).pick({
  firstName: true,
  lastName: true,
  division: true,
  department: true,
  jDial: true,
  rank: true,
  lcpoName: true,
  isActive: true,
});

// Category Schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
});

// Inventory Item Schema
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  itemCode: text("item_code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull(),
  totalQuantity: integer("total_quantity").notNull().default(1),
  availableQuantity: integer("available_quantity").notNull().default(1),
  minStockLevel: integer("min_stock_level").default(5),
  status: text("status").notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow(),
  checkoutAlertDays: integer("checkout_alert_days").default(7),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).pick({
  itemCode: true,
  name: true,
  description: true,
  categoryId: true,
  totalQuantity: true,
  availableQuantity: true,
  minStockLevel: true,
  status: true,
  checkoutAlertDays: true,
});

// Transaction Schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  userId: integer("user_id").notNull(),
  administratorId: integer("administrator_id"), // ID of the admin processing the transaction
  type: text("type").notNull(), // check-in, check-out
  quantity: integer("quantity").notNull().default(1),
  timestamp: timestamp("timestamp").defaultNow(),
  dueDate: timestamp("due_date"),
  returnDate: timestamp("return_date"),
  notes: text("notes"),
  isOverdue: boolean("is_overdue").default(false),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  itemId: true,
  userId: true,
  administratorId: true,
  type: true,
  quantity: true,
  notes: true,
}).extend({
  // Make dueDate optional to avoid validation errors during check-in
  dueDate: z.string().datetime().optional(),
  // Allow returnDate for check-in operations
  returnDate: z.string().datetime().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Personnel = typeof personnel.$inferSelect;
export type InsertPersonnel = z.infer<typeof insertPersonnelSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Extended schemas with related data
export const inventoryItemWithCategorySchema = z.object({
  id: z.number(),
  itemCode: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  categoryId: z.number(),
  totalQuantity: z.number().default(1),
  availableQuantity: z.number().default(1),
  minStockLevel: z.number().default(5).optional(),
  status: z.string().default("available"),
  createdAt: z.date().or(z.string()).optional(),
  checkoutAlertDays: z.number().default(7).optional(),
  category: z.object({
    id: z.number().optional(),
    name: z.string()
  }),
  checkedOutBy: z.object({
    id: z.number().optional(),
    username: z.string(),
    password: z.string(),
    fullName: z.string(),
    role: z.string().optional(),
    isAuthorized: z.boolean().optional()
  }).nullable(),
});

export type InventoryItemWithCategory = z.infer<typeof inventoryItemWithCategorySchema>;

export const transactionWithDetailsSchema = z.object({
  id: z.number().optional(),
  itemId: z.number(),
  userId: z.number(),
  administratorId: z.number().optional(),
  type: z.string(),
  quantity: z.number().default(1),
  timestamp: z.date().or(z.string()).optional(),
  dueDate: z.date().or(z.string()).optional(),
  returnDate: z.date().or(z.string()).optional(),
  notes: z.string().optional(),
  isOverdue: z.boolean().default(false).optional(),
  item: z.object({
    id: z.number().optional(),
    itemCode: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    categoryId: z.number(),
    totalQuantity: z.number().optional(),
    availableQuantity: z.number().optional(),
    minStockLevel: z.number().optional(),
    status: z.string().optional(),
    createdAt: z.date().or(z.string()).optional(),
    checkoutAlertDays: z.number().optional()
  }),
  user: z.object({
    id: z.number().optional(),
    username: z.string(),
    password: z.string(),
    fullName: z.string(),
    role: z.string().optional(),
    isAuthorized: z.boolean().optional()
  }),
  person: z.object({
    id: z.number().optional(),
    firstName: z.string(),
    lastName: z.string(),
    division: z.string(),
    department: z.string(),
    jDial: z.string().nullable().optional(),
    rank: z.string().nullable().optional(),
    lcpoName: z.string().nullable().optional(),
    dateAdded: z.date().or(z.string()).optional(),
    isActive: z.boolean().optional()
  }).optional(),
  administrator: z.object({
    id: z.number().optional(),
    username: z.string(),
    password: z.string(),
    fullName: z.string(),
    role: z.string().optional(),
    isAuthorized: z.boolean().optional()
  }).optional(),
});

export type TransactionWithDetails = z.infer<typeof transactionWithDetailsSchema>;

// Dashboard statistics schema
export const dashboardStatsSchema = z.object({
  totalItems: z.number(),
  checkedOutItems: z.number(),
  availableItems: z.number(),
  totalUsers: z.number(),
  lowStockItems: z.array(inventoryItemWithCategorySchema),
  recentActivity: z.array(transactionWithDetailsSchema),
  overdueItems: z.array(transactionWithDetailsSchema),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// Personnel Activity Report Schema
export const personnelActivitySchema = z.object({
  personnelId: z.number(),
  personnelName: z.string(),
  division: z.string().optional(),
  department: z.string().optional(),
  totalTransactions: z.number(),
  checkouts: z.number(),
  checkins: z.number(),
  overdueItems: z.number(),
  lastActivity: z.string().optional(),
});

export type PersonnelActivity = z.infer<typeof personnelActivitySchema>;

// Department Usage Report Schema
export const departmentUsageSchema = z.object({
  department: z.string(),
  totalTransactions: z.number(),
  uniquePersonnel: z.number(),
  mostFrequentItems: z.array(z.object({
    itemName: z.string(),
    count: z.number(),
  })),
  checkoutFrequency: z.number(),
});

export type DepartmentUsage = z.infer<typeof departmentUsageSchema>;

// Privacy Agreement Schema
export const privacyAgreements = pgTable("privacy_agreements", {
  id: serial("id").primaryKey(),
  personnelId: integer("personnel_id").notNull(),
  agreedAt: timestamp("agreed_at").defaultNow(),
  version: text("version").notNull().default("1.0"),
  ipAddress: text("ip_address"),
});

export const insertPrivacyAgreementSchema = createInsertSchema(privacyAgreements).pick({
  personnelId: true,
  version: true,
  ipAddress: true,
});

export type PrivacyAgreement = typeof privacyAgreements.$inferSelect;
export type InsertPrivacyAgreement = z.infer<typeof insertPrivacyAgreementSchema>;

// EULA License Agreement Schema
export const eulaAgreements = pgTable("eula_agreements", {
  id: serial("id").primaryKey(),
  personnelId: integer("personnel_id").notNull(),
  agreedAt: timestamp("agreed_at").defaultNow(),
  version: text("version").notNull().default("1.0"),
  ipAddress: text("ip_address"),
});

export const insertEulaAgreementSchema = createInsertSchema(eulaAgreements).pick({
  personnelId: true,
  version: true,
  ipAddress: true,
});

export type EulaAgreement = typeof eulaAgreements.$inferSelect;
export type InsertEulaAgreement = z.infer<typeof insertEulaAgreementSchema>;
