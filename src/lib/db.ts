
// src/lib/db.ts
import { join, dirname } from 'path';
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node'; 
import { fileURLToPath } from 'url';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number; 
  timestamp: number; 
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'online' | 'other';
  // userId?: string; // Removed userId as auth is removed
}

// User interface removed
// export interface User {
//   id: string;
//   username: string;
//   passwordHash: string; 
//   role: 'admin' | 'cashier';
// }

// AppSettings interface removed
// export interface AppSettings {
//   restaurantName: string;
// }

// Expense interface removed
// export interface Expense {
//   id: string;
//   description: string;
//   amount: number;
//   date: number; 
//   category?: string;
// }

interface DBData {
  menuItems: MenuItem[];
  orders: Order[];
  lastOrderId: number;
  // users: User[]; // Removed users
  // appSettings: AppSettings; // Removed appSettings
  // expenses: Expense[]; // Removed expenses
}

let db: LowSync<DBData>;

try {
  const projectRoot = process.cwd();
  const dbPath = join(projectRoot, 'db.json');

  const adapter = new JSONFileSync<DBData>(dbPath);
  db = new LowSync<DBData>(adapter, {
    menuItems: [],
    orders: [],
    lastOrderId: 0,
    // users: [], // Removed default users
    // appSettings: { restaurantName: "RestoSwift POS" }, // Removed default appSettings
    // expenses: [], // Removed default expenses
  });

  db.read();

  if (!db.data) {
    db.data = { 
        menuItems: [], 
        orders: [], 
        lastOrderId: 0,
        // users: [], 
        // appSettings: { restaurantName: "RestoSwift POS Default" },
        // expenses: []
    };
  }
  if (!db.data.menuItems) db.data.menuItems = [];
  if (!db.data.orders) db.data.orders = [];
  if (db.data.lastOrderId === undefined) {
    db.data.lastOrderId = db.data.orders.reduce((maxId, order) => Math.max(maxId, typeof order.id === 'number' ? order.id : 0), 0);
  }
  // if (!db.data.users) db.data.users = [];
  // if (db.data.users.length === 0) {
  //   db.data.users.push({ id: 'admin_user', username: 'admin', passwordHash: 'password', role: 'admin' });
  // }
  // if (!db.data.appSettings) db.data.appSettings = { restaurantName: "ريستو سويفت الافتراضي" };
  // if (!db.data.expenses) db.data.expenses = [];
  
  db.write();

} catch (error) {
  console.error("Failed to initialize LowDB:", error);
  const fallbackData: DBData = {
    menuItems: [
      { id: 'fallback_1', name: 'Fallback Item 1 (Error in DB init)', category: 'Fallback', price: 10000, isAvailable: true },
    ],
    orders: [],
    lastOrderId: 0,
    // users: [{ id: 'admin_user_fallback', username: 'admin', passwordHash: 'password', role: 'admin' }],
    // appSettings: { restaurantName: "Fallback Restaurant Name" },
    // expenses: [],
  };
  db = {
    // @ts-ignore
    data: fallbackData,
    read: () => {},
    write: () => { console.error("DB write operation failed due to initialization error.")},
  };
}

export { db };
