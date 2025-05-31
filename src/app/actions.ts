// src/app/actions.ts
'use server';

import { db, type MenuItem, type OrderItem, type Order } from '@/lib/db';
import { nanoid } from 'nanoid'; // For generating unique IDs

// Action to get all menu items (available and unavailable for admin, only available for POS)
export async function getMenuItems(onlyAvailable: boolean = true): Promise<MenuItem[]> {
  db.read(); // Ensure latest data is read
  if (onlyAvailable) {
    return db.data.menuItems.filter(item => item.isAvailable);
  }
  return db.data.menuItems;
}

// Action to add a new menu item (for manager access)
// This function might be called from an admin page later
export async function addMenuItemAction(itemData: Omit<MenuItem, 'id' | 'isAvailable' | 'imageUrl'>): Promise<MenuItem> {
  const newItem: MenuItem = {
    id: nanoid(), // Generate unique ID
    name: itemData.name,
    price: itemData.price,
    category: itemData.category,
    isAvailable: true, // New items are available by default
    // imageUrl: itemData.imageUrl || `https://placehold.co/300x200.png?text=${encodeURIComponent(itemData.name.substring(0,10))}`
  };
  db.read();
  db.data.menuItems.push(newItem);
  db.write();
  return newItem;
}

// Action to update an existing menu item
export async function updateMenuItemAction(updatedItem: MenuItem): Promise<MenuItem | null> {
  db.read();
  const itemIndex = db.data.menuItems.findIndex(item => item.id === updatedItem.id);
  if (itemIndex > -1) {
    db.data.menuItems[itemIndex] = { ...db.data.menuItems[itemIndex], ...updatedItem };
    db.write();
    return db.data.menuItems[itemIndex];
  }
  return null;
}


// Action to update availability of a menu item
export async function toggleMenuItemAvailabilityAction(id: string): Promise<MenuItem | null> {
  db.read();
  const itemIndex = db.data.menuItems.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    db.data.menuItems[itemIndex].isAvailable = !db.data.menuItems[itemIndex].isAvailable;
    db.write();
    return db.data.menuItems[itemIndex];
  }
  return null;
}

// Action to complete an order and save it to the database
export async function completeOrderAndPrint(orderItems: OrderItem[]): Promise<Order | { error: string }> {
  if (!orderItems || orderItems.length === 0) {
    return { error: "Order cannot be empty." };
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const newOrder: Order = {
    id: nanoid(), // Generate unique ID for the order
    timestamp: Date.now(),
    items: orderItems,
    totalAmount: totalAmount,
    status: 'completed',
    paymentMethod: 'cash', // Default for now, can be expanded
  };

  try {
    db.read();
    db.data.orders.push(newOrder);
    db.write();
    console.log('Order completed and saved:', newOrder);
    return newOrder;
  } catch (e: any) {
    console.error("Error saving order to DB:", e);
    return { error: "Failed to save order." };
  }
}
