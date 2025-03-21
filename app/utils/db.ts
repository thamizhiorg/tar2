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
  user_id: string;
  product_id: string;
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
    
    // Create inventory table
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
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
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
  } catch (error) {
    console.error('Error adding inventory item:', error);
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

// Default export with all the database functions
const dbUtils = {
  initDatabase,
  getAgents,
  getInventoryItems,
  addInventoryItem,
  deleteInventoryItem
};

export default dbUtils;
