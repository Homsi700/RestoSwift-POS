
import type { MenuItem } from '@/types';

export const initialMenuItems: MenuItem[] = [
  { id: '1', name: 'بيتزا مارغريتا', category: 'بيتزا', price: 25000, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=بيتزا' },
  { id: '2', name: 'بيتزا بيبروني', category: 'بيتزا', price: 30000, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=بيتزا' },
  { id: '3', name: 'مقلي خضروات', category: 'طبق رئيسي', price: 22000, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=مقلي' },
  { id: '4', name: 'سلطة سيزر', category: 'سلطات', price: 18000, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=سلطة' },
  { id: '5', name: 'عصير برتقال', category: 'مشروبات', price: 7000, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=عصير' },
  { id: '6', name: 'كوكا كولا', category: 'مشروبات', price: 5000, isAvailable: false, imageUrl: 'https://placehold.co/300x200.png?text=صودا' },
  { id: '7', name: 'اسبريسو', category: 'قهوة', price: 6000, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=قهوة' },
  { id: '8', name: 'تشيز كيك', category: 'حلويات', price: 15000, isAvailable: true, imageUrl: 'https://placehold.co/300x200.png?text=حلوى' },
];
