import * as SQLite from 'expo-sqlite';

// We need to use the newer API for expo-sqlite
const db = SQLite.openDatabaseSync("tarapp.db");

// Interfaces for type safety
export interface Inventory {
  id: number;
  name: string;
  sku: string;
  qty: number;
  available: number;
  committed: number;
  unavailable: number;
  stock: number;
  created_at: number;
  modified_at?: number;
  user_id: string;
  product_id: string;
  sync_timestamp?: string;
}

export const initDatabase = async () => {
  try {
    // Create agents table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS agents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create inventory table (basic version first)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT,
        qty INTEGER DEFAULT 0,
        available INTEGER DEFAULT 0,
        committed INTEGER DEFAULT 0,
        unavailable INTEGER DEFAULT 0,
        stock INTEGER DEFAULT 0,
        created_at INTEGER,
        user_id TEXT,
        product_id TEXT
      );
    `);
    
    // Perform migration for existing tables to add CRDT support
    await migrateDatabase();
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Migration function to add new columns if they don't exist
const migrateDatabase = async () => {
  try {
    // Get table info to check existing columns
    const tableInfo = await db.getAllAsync("PRAGMA table_info(inventory)");
    
    // Extract column names
    const columns = tableInfo.map(col => col.name);
    
    // Check and add modified_at column if it doesn't exist
    if (!columns.includes('modified_at')) {
      console.log('Adding modified_at column to inventory table');
      await db.execAsync(`ALTER TABLE inventory ADD COLUMN modified_at INTEGER;`);
      
      // Initialize with created_at values
      await db.execAsync(`UPDATE inventory SET modified_at = created_at WHERE modified_at IS NULL;`);
    }
    
    // Check and add sync_timestamp column if it doesn't exist
    if (!columns.includes('sync_timestamp')) {
      console.log('Adding sync_timestamp column to inventory table');
      await db.execAsync(`ALTER TABLE inventory ADD COLUMN sync_timestamp TEXT;`);
    }
    
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Error during database migration:', error);
    throw error;
  }
};

// Get all agents
export const getAgents = async () => {
  try {
    const result = await db.getAllAsync('SELECT * FROM agents');
    return result;
  } catch (error) {
    console.error('Error getting agents:', error);
    throw error;
  }
};

// Get all inventory items
export const getInventoryItems = async (): Promise<Inventory[]> => {
  try {
    const result = await db.getAllAsync('SELECT * FROM inventory');
    return result as Inventory[];
  } catch (error) {
    console.error('Error getting inventory items:', error);
    throw error;
  }
};

// Add inventory item
export const addInventoryItem = async (item: Omit<Inventory, 'id'>): Promise<number> => {
  try {
    // Check if modified_at column exists
    const tableInfo = await db.getAllAsync("PRAGMA table_info(inventory)");
    const columns = tableInfo.map(col => col.name);
    
    if (columns.includes('modified_at') && columns.includes('sync_timestamp')) {
      // Use full insert with all columns
      const result = await db.runAsync(
        `INSERT INTO inventory (
          name, sku, qty, available, committed, unavailable, stock, 
          created_at, modified_at, user_id, product_id, sync_timestamp
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

        [
          item.name,
          item.sku || '',
          item.qty || 0,
          item.available || item.qty || 0,
          item.committed || 0,
          item.unavailable || 0,
          item.stock || item.qty || 0,
          item.created_at || Date.now(),
          item.modified_at || Date.now(),
          item.user_id || '',
          item.product_id || '',
          item.sync_timestamp || ''
        ]
      );
      return result.lastInsertRowId;
    } else {
      // Fallback to original insert without new columns
      const result = await db.runAsync(
        `INSERT INTO inventory (name, sku, qty, available, committed, unavailable, stock, created_at, user_id, product_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

        [
          item.name,
          item.sku || '',
          item.qty || 0,
          item.available || item.qty || 0,
          item.committed || 0,
          item.unavailable || 0,
          item.stock || item.qty || 0,
          item.created_at || Date.now(),
          item.user_id || '',
          item.product_id || ''
        ]
      );
      return result.lastInsertRowId;
    }
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

// Update inventory item (for CRDT sync)
export const updateInventoryItem = async (item: Inventory): Promise<boolean> => {
  try {
    // Check if modified_at column exists
    const tableInfo = await db.getAllAsync("PRAGMA table_info(inventory)");
    const columns = tableInfo.map(col => col.name);
    
    if (columns.includes('modified_at') && columns.includes('sync_timestamp')) {
      // Use full update with all columns
      const result = await db.runAsync(
        `UPDATE inventory SET 
          name = ?, 
          sku = ?, 
          qty = ?, 
          available = ?, 
          committed = ?, 
          unavailable = ?, 
          stock = ?, 
          modified_at = ?, 
          user_id = ?, 
          product_id = ?,
          sync_timestamp = ?
        WHERE id = ?`,

        [
          item.name,
          item.sku || '',
          item.qty || 0,
          item.available || 0,
          item.committed || 0,
          item.unavailable || 0,
          item.stock || 0,
          item.modified_at || Date.now(),
          item.user_id || '',
          item.product_id || '',
          item.sync_timestamp || '',
          item.id
        ]
      );
      return result.changes > 0;
    } else {
      // Fallback to update without new columns
      const result = await db.runAsync(
        `UPDATE inventory SET 
          name = ?, 
          sku = ?, 
          qty = ?, 
          available = ?, 
          committed = ?, 
          unavailable = ?, 
          stock = ?, 
          user_id = ?, 
          product_id = ?
        WHERE id = ?`,

        [
          item.name,
          item.sku || '',
          item.qty || 0,
          item.available || 0,
          item.committed || 0,
          item.unavailable || 0,
          item.stock || 0,
          item.user_id || '',
          item.product_id || '',
          item.id
        ]
      );
      return result.changes > 0;
    }
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

// Delete inventory item
export const deleteInventoryItem = async (id: number): Promise<boolean> => {
  try {
    const result = await db.runAsync('DELETE FROM inventory WHERE id = ?', [id]);
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

// Delete all inventory items
export const deleteAllInventoryItems = async (): Promise<boolean> => {
  try {
    const result = await db.runAsync('DELETE FROM inventory');
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting all inventory items:', error);
    throw error;
  }
};

// Default export with all the database functions
const dbUtils = {
  initDatabase,
  getAgents,
  getInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  deleteAllInventoryItems
};

export default dbUtils;
