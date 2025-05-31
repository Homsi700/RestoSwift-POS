import type { MenuItem } from '@/types';

export const initialMenuItems: MenuItem[] = [
  { id: '1', name: 'Margherita Pizza', category: 'Pizza', price: 12.99, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=Pizza' },
  { id: '2', name: 'Pepperoni Pizza', category: 'Pizza', price: 14.99, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=Pizza' },
  { id: '3', name: 'Vegetable Stir-Fry', category: 'Main Course', price: 10.50, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=Stir-Fry' },
  { id: '4', name: 'Caesar Salad', category: 'Salads', price: 8.00, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=Salad' },
  { id: '5', name: 'Orange Juice', category: 'Drinks', price: 3.50, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=Juice' },
  { id: '6', name: 'Coca-Cola', category: 'Drinks', price: 2.50, isAvailable: false, imageUrl: 'https://placehold.co/300x200.png?text=Soda' },
  { id: '7', name: 'Espresso', category: 'Coffee', price: 3.00, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=Coffee' },
  { id: '8', name: 'Cheesecake', category: 'Desserts', price: 6.50, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=Dessert' },
];
