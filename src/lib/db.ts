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
  id: string;
  timestamp: number; // Unix timestamp (Date.now())
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'online' | 'other';
}

interface DBData {
  menuItems: MenuItem[];
  orders: Order[];
}

let db: LowSync<DBData>;

try {
  // This approach for __dirname is suitable for ES modules
  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = dirname(__filename);
  
  // For Next.js, process.cwd() usually points to the project root.
  // We want db.json to be in the project root.
  const projectRoot = process.cwd();
  const dbPath = join(projectRoot, 'db.json');

  const adapter = new JSONFileSync<DBData>(dbPath);
  db = new LowSync<DBData>(adapter, {
    menuItems: [],
    orders: [],
  });

  db.read();

  // Initialize with default data if the file is empty or doesn't have menuItems
  if (!db.data || !db.data.menuItems || db.data.menuItems.length === 0) {
    console.log("Initializing db.json with default menu items...");
    db.data = {
      menuItems: [
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
      ],
      orders: [],
    };
    db.write();
  }
} catch (error) {
  console.error("Failed to initialize LowDB:", error);
  // Fallback or error handling in case db initialization fails
  // This ensures `db` is always defined, though it might not persist data if initialization failed.
  // @ts-ignore
  db = { 
    // @ts-ignore
    data: { 
      menuItems: [
        { id: 'fallback_1', name: 'Fallback Item 1 (Error in DB init)', category: 'Fallback', price: 10000, isAvailable: true },
      ], 
      orders: [] 
    },
    read: () => {},
    write: () => { console.error("DB write operation failed due to initialization error.")},
  };
}

export { db };
