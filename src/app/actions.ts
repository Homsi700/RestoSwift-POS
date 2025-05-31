
// src/app/actions.ts
'use server';

import { db, type MenuItem, type OrderItem, type Order } from '@/lib/db';
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

// Action to delete a menu item
export async function deleteMenuItemAction(id: string): Promise<{ success: boolean; message?: string }> {
  db.read();
  const initialLength = db.data.menuItems.length;
  db.data.menuItems = db.data.menuItems.filter(item => item.id !== id);
  if (db.data.menuItems.length < initialLength) {
    db.write();
    return { success: true };
  }
  return { success: false, message: "لم يتم العثور على العنصر." };
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

// Types for Reports
export interface DailySalesReportData {
  totalSales: number;
  numberOfInvoices: number;
  date: string; // YYYY-MM-DD
}

export interface ItemSalesReportItem {
  itemName: string;
  quantitySold: number;
}

// Action to get daily sales report
export async function getDailySalesReport(): Promise<DailySalesReportData> {
  db.read();
  const orders = db.data.orders || [];

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  // End of today is start of next day minus 1 millisecond
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime() -1;

  const dailyOrders = orders.filter(order =>
    order.timestamp >= todayStart && order.timestamp <= todayEnd
  );

  const totalSales = dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const numberOfInvoices = dailyOrders.length;
  
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = today.getDate().toString().padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  return {
    totalSales,
    numberOfInvoices,
    date: formattedDate,
  };
}

// Action to get item sales count report
export async function getItemSalesCountReport(startDate?: number, endDate?: number): Promise<ItemSalesReportItem[]> {
  db.read();
  let ordersToProcess = db.data.orders || [];

  if (startDate && endDate) {
    ordersToProcess = ordersToProcess.filter(order => 
      order.timestamp >= startDate && order.timestamp <= endDate
    );
  } else if (startDate) { // If only start date is provided
    ordersToProcess = ordersToProcess.filter(order => order.timestamp >= startDate);
  } else if (endDate) { // If only end date is provided
    ordersToProcess = ordersToProcess.filter(order => order.timestamp <= endDate);
  }
  // If neither is provided, all orders are processed (initial behavior)

  const itemSalesMap: { [itemName: string]: number } = {};

  ordersToProcess.forEach(order => {
    order.items.forEach(item => {
      if (itemSalesMap[item.name]) {
        itemSalesMap[item.name] += item.quantity;
      } else {
        itemSalesMap[item.name] = item.quantity;
      }
    });
  });

  const report = Object.entries(itemSalesMap).map(([itemName, quantitySold]) => ({
    itemName,
    quantitySold,
  }));

  report.sort((a, b) => b.quantitySold - a.quantitySold);

  return report;
}
