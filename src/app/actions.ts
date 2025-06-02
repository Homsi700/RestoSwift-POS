
// src/app/actions.ts
'use server';

import { db, type MenuItem, type OrderItem, type Order, type Expense, type AppSettings, type DBUser } from '@/lib/db';
import type { User as AuthUser } from '@/types'; // User for AuthContext (no password)
import { nanoid } from 'nanoid';
import { LoginCredentialsSchema, type LoginCredentials, AddUserSchema, type AddUserFormValues } from '@/lib/schemas';

// --- Auth Types and Actions ---

export async function loginAction(credentials: LoginCredentials): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    LoginCredentialsSchema.parse(credentials);
  } catch (e) {
    return { success: false, error: "بيانات الإدخال غير صالحة." };
  }

  db.read();
  const userFromDb = db.data.users.find(
    (u) => u.username === credentials.username && u.password === credentials.password // Plain text comparison for now
  );

  if (userFromDb) {
    // Return user object without password
    const authUser: AuthUser = {
      id: userFromDb.id,
      username: userFromDb.username,
      role: userFromDb.role,
    };
    return { success: true, user: authUser };
  }
  return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة." };
}

// --- User Management Actions ---
export async function getUsersAction(): Promise<AuthUser[]> {
  db.read();
  // Return users without passwords
  return db.data.users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
}

export async function addUserAction(userData: AddUserFormValues): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    AddUserSchema.parse(userData);
  } catch (e: any) {
    return { success: false, error: "بيانات إدخال المستخدم غير صالحة: " + e.errors.map((err:any) => err.message).join(', ') };
  }

  db.read();
  if (db.data.users.find(u => u.username === userData.username)) {
    return { success: false, error: "اسم المستخدم موجود بالفعل." };
  }

  const newUser: DBUser = {
    id: nanoid(),
    username: userData.username,
    password: userData.password, // Storing plain text for now
    role: userData.role,
  };

  db.data.users.push(newUser);
  db.write();

  const { password, ...authUser } = newUser; // Exclude password for return
  return { success: true, user: authUser };
}

export async function deleteUserAction(id: string): Promise<{ success: boolean; error?: string }> {
  db.read();
  const userToDelete = db.data.users.find(u => u.id === id);

  if (!userToDelete) {
    return { success: false, error: "المستخدم غير موجود." };
  }
  // Basic check: do not delete the last admin user
  if (userToDelete.role === 'admin') {
    const adminUsers = db.data.users.filter(u => u.role === 'admin');
    if (adminUsers.length <= 1) {
      return { success: false, error: "لا يمكن حذف آخر مستخدم بصلاحية مدير." };
    }
  }

  db.data.users = db.data.users.filter(u => u.id !== id);
  db.write();
  return { success: true };
}


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
  await db.write();
  return newItem;
}

export async function updateMenuItemAction(updatedItem: MenuItem): Promise<MenuItem | null> {
  db.read();
  const itemIndex = db.data.menuItems.findIndex(item => item.id === updatedItem.id);
  if (itemIndex > -1) {
    db.data.menuItems[itemIndex] = { ...db.data.menuItems[itemIndex], ...updatedItem };
    await db.write();
    return db.data.menuItems[itemIndex];
  }
  return null;
}

export async function toggleMenuItemAvailabilityAction(id: string): Promise<MenuItem | null> {
  db.read();
  const itemIndex = db.data.menuItems.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    db.data.menuItems[itemIndex].isAvailable = !db.data.menuItems[itemIndex].isAvailable;
    await db.write();
    return db.data.menuItems[itemIndex];
  }
  return null;
}

export async function deleteMenuItemAction(id: string): Promise<{ success: boolean; message?: string }> {
  db.read();
  const initialLength = db.data.menuItems.length;
  db.data.menuItems = db.data.menuItems.filter(item => item.id !== id);
  if (db.data.menuItems.length < initialLength) {
    await db.write();
    return { success: true };
  }
  return { success: false, message: "لم يتم العثور على العنصر." };
}

// --- Order Actions ---
export async function completeOrderAndPrint(orderItems: OrderItem[]): Promise<Order | { error: string }> {
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
  };

  try {
    db.data.orders.push(newOrder);
    db.data.lastOrderId = newOrderId;
    await db.write();
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

// --- Expense Actions ---
export async function addExpenseAction(expenseData: Omit<Expense, 'id' | 'date'>): Promise<Expense> {
  const newExpense: Expense = {
    id: nanoid(),
    date: Date.now(),
    description: expenseData.description,
    amount: expenseData.amount,
    category: expenseData.category,
  };
  db.read();
  db.data.expenses.push(newExpense);
  await db.write();
  return newExpense;
}

export async function getExpensesAction(startDate?: number, endDate?: number): Promise<Expense[]> {
  db.read();
  let expensesToProcess = db.data.expenses || [];

  if (startDate && endDate) {
    expensesToProcess = expensesToProcess.filter(expense =>
      expense.date >= startDate && expense.date <= endDate
    );
  } else if (startDate) {
    expensesToProcess = expensesToProcess.filter(expense => expense.date >= startDate);
  } else if (endDate) {
    expensesToProcess = expensesToProcess.filter(expense => expense.date <= endDate);
  }
  expensesToProcess.sort((a, b) => b.date - a.date);
  return expensesToProcess;
}

export async function deleteExpenseAction(id: string): Promise<{ success: boolean; message?: string }> {
  db.read();
  const initialLength = db.data.expenses.length;
  db.data.expenses = db.data.expenses.filter(expense => expense.id !== id);
  if (db.data.expenses.length < initialLength) {
    await db.write();
    return { success: true };
  }
  return { success: false, message: "لم يتم العثور على المصروف." };
}

// --- AppSettings Actions ---
export async function getRestaurantNameAction(): Promise<string> {
  db.read();
  return db.data.appSettings?.restaurantName || "ريستو سويفت POS";
}

export async function updateRestaurantNameAction(newName: string): Promise<AppSettings | { error: string }> {
  if (!newName || newName.trim().length < 2) {
    return { error: "اسم المطعم يجب أن يتكون من حرفين على الأقل." };
  }
  db.read();
  if (!db.data.appSettings) {
    db.data.appSettings = { restaurantName: newName };
  } else {
    db.data.appSettings.restaurantName = newName.trim();
  }
  await db.write();
  return db.data.appSettings;
}
