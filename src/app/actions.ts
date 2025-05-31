
// src/app/actions.ts
'use server';

import { db, type MenuItem, type OrderItem, type Order } from '@/lib/db';
// nanoid is no longer needed for order IDs but might be for menu item IDs if not user-provided.
// For now, addMenuItemAction generates nanoid for menu items.
import { nanoid } from 'nanoid'; 

// Action to get all menu items (available and unavailable for admin, only available for POS)
export async function getMenuItems(onlyAvailable: boolean = true): Promise<MenuItem[]> {
  db.read(); // Ensure latest data is read
  if (onlyAvailable) {
    return db.data.menuItems.filter(item => item.isAvailable);
  }
  return db.data.menuItems;
}

// Action to add a new menu item (for manager access)
export async function addMenuItemAction(itemData: Omit<MenuItem, 'id' | 'isAvailable' | 'imageUrl'>): Promise<MenuItem> {
  const newItem: MenuItem = {
    id: nanoid(), // Generate unique ID for menu item
    name: itemData.name,
    price: itemData.price,
    category: itemData.category,
    isAvailable: true,
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

  db.read(); // Read the latest data, including lastOrderId

  const newOrderId = (db.data.lastOrderId || 0) + 1;

  const newOrder: Order = {
    id: newOrderId, // Use sequential numeric ID
    timestamp: Date.now(),
    items: orderItems,
    totalAmount: totalAmount,
    status: 'completed',
    paymentMethod: 'cash', 
  };

  try {
    db.data.orders.push(newOrder);
    db.data.lastOrderId = newOrderId; // Update the lastOrderId
    db.write();
    console.log('Order completed and saved:', newOrder);
    return newOrder;
  } catch (e: any) {
    console.error("Error saving order to DB:", e);
    return { error: "Failed to save order." };
  }
}
