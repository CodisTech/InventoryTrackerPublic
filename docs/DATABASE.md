# Inventory Management System Database Schema

This document provides a detailed overview of the database schema used in the Inventory Management System.

## Overview

The system uses a relational database structure powered by PostgreSQL (in production) with an in-memory storage option available for development and testing. The schema is designed to efficiently track inventory items, personnel, transactions, and user accounts.

## Tables

### Users

Stores system user accounts and authentication information.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| username | Text | Unique username |
| password | Text | Hashed password |
| fullName | Text | User's full name |
| role | Enum | Role: 'superadmin', 'admin', 'user' |
| isAuthorized | Boolean | Whether user is authorized to use the system |

### Personnel

Stores information about personnel who can check out inventory items.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| firstName | Text | First name |
| lastName | Text | Last name |
| division | Text | Division/unit |
| department | Text | Department |
| jDial | Text | J-Dial contact number (if applicable) |
| lcpoName | Text | LCPO name (if applicable) |

### Categories

Stores inventory item categories.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | Text | Category name |

### Inventory Items

Stores information about inventory items.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| itemCode | Text | Unique item identifier/barcode |
| name | Text | Item name |
| categoryId | Integer | Foreign key to categories table |
| description | Text | Item description |
| totalQuantity | Integer | Total quantity of this item |
| availableQuantity | Integer | Available quantity (not checked out) |
| createdAt | Timestamp | When item was added to inventory |

### Transactions

Records check-ins and check-outs of inventory items.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| userId | Integer | Foreign key to users table (who processed transaction) |
| itemId | Integer | Foreign key to inventory_items table |
| personnelId | Integer | Foreign key to personnel table (who has the item) |
| quantity | Integer | Quantity of items in this transaction |
| type | Enum | Transaction type: 'checkout', 'checkin' |
| status | Enum | Status: 'active', 'completed', 'overdue' |
| dueDate | Timestamp | When item is due to be returned |
| checkoutDate | Timestamp | When item was checked out |
| checkinDate | Timestamp | When item was checked in (null if not checked in) |
| notes | Text | Transaction notes |

### Privacy Agreements

Tracks personnel agreement to privacy policies.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| personnelId | Integer | Foreign key to personnel table |
| version | Text | Privacy policy version |
| agreedAt | Timestamp | When agreement was accepted |

### EULA Agreements

Tracks personnel agreement to End User License Agreement.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| personnelId | Integer | Foreign key to personnel table |
| version | Text | EULA version |
| agreedAt | Timestamp | When agreement was accepted |

## Relationships

The database schema includes the following relationships:

- **Users to Transactions**: One-to-many (one user can process many transactions)
- **Personnel to Transactions**: One-to-many (one person can have many transactions)
- **Inventory Items to Transactions**: One-to-many (one item can be in many transactions)
- **Categories to Inventory Items**: One-to-many (one category can have many items)
- **Personnel to Privacy Agreements**: One-to-many (one person can accept multiple versions)
- **Personnel to EULA Agreements**: One-to-many (one person can accept multiple versions)

## Indices

The database uses the following indices to optimize performance:

- `users_username_idx`: Index on users.username
- `inventory_items_itemCode_idx`: Index on inventory_items.itemCode
- `transactions_status_idx`: Index on transactions.status
- `transactions_dueDate_idx`: Index on transactions.dueDate
- `personnel_lastName_firstName_idx`: Composite index on personnel.(lastName, firstName)

## Constraints

The database enforces the following constraints to maintain data integrity:

- **Foreign Key Constraints**: Ensure referential integrity between related tables
- **Unique Constraints**: Prevent duplicate usernames and item codes
- **Check Constraints**: Ensure valid values for enums and quantity fields
- **Not Null Constraints**: Ensure required fields are always populated

## Views

The system uses the following database views for simplified querying:

- `inventory_items_with_category`: Joins inventory items with their categories
- `transactions_with_details`: Joins transactions with related users, items, and personnel
- `overdue_transactions`: Filters transactions that are past their due dates

## Extensions

The database requires the following PostgreSQL extensions:

- `uuid-ossp`: For generating UUIDs
- `pg_trgm`: For trigram-based text search functions

## Schema Migrations

Database schema migrations are managed through Drizzle ORM. All migration files are stored in the `migrations` directory and automatically applied when the application starts. Each migration is versioned and can be rolled back if needed.

## Backup and Recovery

The database should be regularly backed up using PostgreSQL's native backup tools. The recommended backup frequency is daily, with backups stored securely for at least 30 days.

## Development vs Production

In development mode, an in-memory database with the same schema can be used instead of PostgreSQL. This is configured through environment variables and does not require any schema changes.

## Contact Information

For questions regarding the database schema, please open an issue in the GitHub repository.