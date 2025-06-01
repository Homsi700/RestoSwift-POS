
// src/app/actions.ts
'use server';

import { db, type MenuItem, type OrderItem, type Order } from '@/lib/db'; // Removed User, AppSettings, Expense
import { nanoid } from 'nanoid'; 

// --- Menu Item Actions ---
export async function getMenuItems(onlyAvailable: boolean = true): Promise<MenuItem[]> {
  db.read(); 
  if (onlyAvailable) {
    return db.data.menuItems.filter(item => item.isAvailable);
  }
  return db.data.menuItems;
}

export async function addMenuItemAction(itemData: Omit<MenuItem, 'id' | 'isAvailable' | 'imageUrl'>): Promise<MenuItem> {
  const newItem: MenuItem = {
    id: nanoid(), 
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

// --- Order Actions ---
export async function completeOrderAndPrint(orderItems: OrderItem[] /*, userId?: string Removed userId */): Promise<Order | { error: string }> {
  if (!orderItems || orderItems.length === 0) {
    return { error: "لا يمكن أن يكون الطلب فارغًا." };
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  db.read(); 

  const newOrderId = (db.data.lastOrderId || 0) + 1;

  const newOrder: Order = {
    id: newOrderId, 
    timestamp: Date.now(),
    items: orderItems,
    totalAmount: totalAmount,
    status: 'completed',
    paymentMethod: 'cash', 
    // userId: userId // Removed userId
  };

  try {
    db.data.orders.push(newOrder);
    db.data.lastOrderId = newOrderId; 
    db.write();
    return newOrder;
  } catch (e: any) {
    console.error("Error saving order to DB:", e);
    return { error: "فشل حفظ الطلب." };
  }
}

// --- Report Types ---
export interface DailySalesReportData {
  totalSales: number;
  numberOfInvoices: number;
  date: string; 
}

export interface ItemSalesReportItem {
  itemName: string;
  quantitySold: number;
}

// --- Report Actions ---
export async function getDailySalesReport(): Promise<DailySalesReportData> {
  db.read();
  const orders = db.data.orders || [];

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime() -1;

  const dailyOrders = orders.filter(order =>
    order.timestamp >= todayStart && order.timestamp <= todayEnd
  );

  const totalSales = dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const numberOfInvoices = dailyOrders.length;
  
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  return {
    totalSales,
    numberOfInvoices,
    date: formattedDate,
  };
}

export async function getItemSalesCountReport(startDate?: number, endDate?: number): Promise<ItemSalesReportItem[]> {
  db.read();
  let ordersToProcess = db.data.orders || [];

  if (startDate && endDate) {
    ordersToProcess = ordersToProcess.filter(order => 
      order.timestamp >= startDate && order.timestamp <= endDate
    );
  } else if (startDate) { 
    ordersToProcess = ordersToProcess.filter(order => order.timestamp >= startDate);
  } else if (endDate) { 
    ordersToProcess = ordersToProcess.filter(order => order.timestamp <= endDate);
  }

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

// --- Auth Actions Removed ---
// export async function loginAction(username: string, passwordAttempt: string): Promise<User | { error: string }> { ... }
// export async function getRestaurantNameAction(): Promise<string> { ... }
// export async function updateRestaurantNameAction(newName: string): Promise<AppSettings | { error: string }> { ... }

// --- Expense Actions Removed ---
// export async function addExpenseAction(expenseData: Omit<Expense, 'id' | 'date'>): Promise<Expense> { ... }
// export async function getExpensesAction(startDate?: number, endDate?: number): Promise<Expense[]> { ... }
// export async function deleteExpenseAction(id: string): Promise<{ success: boolean; message?: string }> { ... }

