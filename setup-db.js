#!/usr/bin/env node

/**
 * This script creates database tables for the Inventory Management System
 * It should be run when deploying the application to a new environment
 */

import { Client } from 'pg';
import fs from 'fs';

async function main() {
  // Connect to the database
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Connecting to database...');
    await client.connect();

    console.log('Creating database schema...');
    
    // Create the users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fullName VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        isAuthorized BOOLEAN DEFAULT true
      );
    `);
    
    // Create the personnel table
    await client.query(`
      CREATE TABLE IF NOT EXISTS personnel (
        id SERIAL PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        division VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        rank VARCHAR(50),
        jDial VARCHAR(50),
        lcpoName VARCHAR(100),
        dateAdded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        isActive BOOLEAN DEFAULT true
      );
    `);
    
    // Create the categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
    `);
    
    // Create the inventory_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        itemCode VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        categoryId INTEGER REFERENCES categories(id),
        totalQuantity INTEGER DEFAULT 0,
        availableQuantity INTEGER DEFAULT 0,
        minStockLevel INTEGER,
        status VARCHAR(50) DEFAULT 'available',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checkoutAlertDays INTEGER DEFAULT 1
      );
    `);
    
    // Create the transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        userId INTEGER REFERENCES personnel(id),
        itemId INTEGER REFERENCES inventory_items(id),
        quantity INTEGER DEFAULT 1,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dueDate TIMESTAMP,
        returnDate TIMESTAMP,
        notes TEXT
      );
    `);
    
    // Create the privacy_agreements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS privacy_agreements (
        id SERIAL PRIMARY KEY,
        personnelId INTEGER REFERENCES personnel(id),
        version VARCHAR(50) NOT NULL,
        agreedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ipAddress VARCHAR(50)
      );
    `);
    
    // Create the eula_agreements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS eula_agreements (
        id SERIAL PRIMARY KEY,
        personnelId INTEGER REFERENCES personnel(id),
        version VARCHAR(50) NOT NULL,
        agreedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ipAddress VARCHAR(50)
      );
    `);
    
    console.log('Database schema created successfully!');

    // Check if we need to seed the database with sample data
    const userCount = await client.query(`SELECT COUNT(*) FROM users`);
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('Seeding database with initial data...');
      
      // Create admin user with password 'admin123'
      // Note: In a real implementation, we would properly hash the password
      await client.query(`
        INSERT INTO users (username, password, fullName, role, isAuthorized)
        VALUES ('admin', 'admin123', 'Administrator', 'admin', true);
      `);
      
      // Add sample categories
      const categoryNames = ['Laptops', 'Desktops', 'Mobile Devices', 'Storage', 'A/V Equipment', 'Accessories'];
      for (const name of categoryNames) {
        await client.query(`
          INSERT INTO categories (name)
          VALUES ($1);
        `, [name]);
      }
      
      console.log('Database seeded successfully!');
    } else {
      console.log('Database already contains data, skipping seed process.');
    }
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();