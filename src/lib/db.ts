
// src/lib/db.ts
import { join, dirname } from 'path';
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node'; // Corrected import path
import { fileURLToPath } from 'url';

// Define the data structure for our database
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
  price: number; // Price at the time of adding to order
  quantity: number;
}

export interface Order {
  id: number; // Changed to number for sequential IDs
  timestamp: number; // Unix timestamp (Date.now())
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'online' | 'other';
}

interface DBData {
  menuItems: MenuItem[];
  orders: Order[];
  lastOrderId: number; // Added to track the last order ID
}

let db: LowSync<DBData>;

try {
  const projectRoot = process.cwd();
  const dbPath = join(projectRoot, 'db.json');

  const adapter = new JSONFileSync<DBData>(dbPath);
  db = new LowSync<DBData>(adapter, {
    menuItems: [],
    orders: [],
    lastOrderId: 0, // Default initial value
  });

  db.read();

  // Initialize with default data if the file is empty or doesn't have menuItems/lastOrderId
  if (!db.data) {
    db.data = { menuItems: [], orders: [], lastOrderId: 0 };
  }
  if (!db.data.menuItems || db.data.menuItems.length === 0) {
    console.log("Initializing db.json with default menu items...");
    db.data.menuItems = [
        { id: "item_1", name: "بيتزا مارغريتا", category: "بيتزا", price: 25000, isAvailable: true, imageUrl: "https://placehold.co/300x200.png?text=بيتزا+مارغريتا" },
        { id: "item_2", name: "برجر لحم", category: "سندويشات", price: 35000, isAvailable: true, imageUrl: "https://placehold.co/300x200.png?text=برجر+لحم" },
        { id: "item_3", name: "سلطة دجاج", category: "سلطات", price: 22000, isAvailable: true, imageUrl: "https://placehold.co/300x200.png?text=سلطة+دجاج" },
        { id: "item_4", name: "عصير برتقال", category: "مشروبات", price: 10000, isAvailable: true, imageUrl: "https://placehold.co/300x200.png?text=عصير+برتقال" },
        { id: "item_5", name: "كولا", category: "مشروبات", price: 8000, isAvailable: true, imageUrl: "https://placehold.co/300x200.png?text=كولا" },
        { id: "item_6", name: "كيك الشوكولاتة", category: "حلويات", price: 18000, isAvailable: false, imageUrl: "https://placehold.co/300x200.png?text=كيك+شوكولاتة" },
        { id: "item_7", name: "فروج مشوي", category: "أطباق رئيسية", price: 75000, isAvailable: true, imageUrl: "https://placehold.co/300x200.png?text=فروج+مشوي" },
        { id: "item_8", name: "شاورما دجاج", category: "سندويشات", price: 20000, isAvailable: true, imageUrl: "https://placehold.co/300x200.png?text=شاورما+دجاج" },
        { id: "item_9", name: "فتوش", category: "سلطات", price: 15000, isAvailable: true, imageUrl: "https://placehold.co/300x200.png?text=فتوش" },
        { id: "item_10", name: "ماء معدني", category: "مشروبات", price: 3000, isAvailable: true, imageUrl: "https://placehold.co/300x200.png?text=ماء" }
      ];
  }
  if (db.data.orders === undefined) {
    db.data.orders = [];
  }
  if (db.data.lastOrderId === undefined) {
    // If there are existing orders but no lastOrderId, try to infer it.
    // This is a simple inference, might need adjustment for complex scenarios.
    db.data.lastOrderId = db.data.orders.reduce((maxId, order) => Math.max(maxId, typeof order.id === 'number' ? order.id : 0), 0);
  }
  db.write();

} catch (error) {
  console.error("Failed to initialize LowDB:", error);
  db = {
    // @ts-ignore
    data: {
      menuItems: [
        { id: 'fallback_1', name: 'Fallback Item 1 (Error in DB init)', category: 'Fallback', price: 10000, isAvailable: true },
      ],
      orders: [],
      lastOrderId: 0,
    },
    read: () => {},
    write: () => { console.error("DB write operation failed due to initialization error.")},
  };
}

export { db };
