export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string; // Optional for now
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number; // Price at the time of order
}

export interface Order {
  id: string;
  timestamp: Date;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'other'; // Example payment methods
}
