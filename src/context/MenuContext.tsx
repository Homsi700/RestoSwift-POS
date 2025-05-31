'use client';

import type { MenuItem } from '@/types';
import { initialMenuItems } from '@/data/mock-data';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface MenuContextType {
  menuItems: MenuItem[];
  addMenuItem: (itemData: Omit<MenuItem, 'id' | 'isAvailable' | 'imageUrl'>) => void;
  toggleItemAvailability: (id: string) => void;
  updateMenuItem: (updatedItem: MenuItem) => void; // Added for potential future editing
  getAvailableItems: () => MenuItem[];
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);

  const addMenuItem = useCallback((itemData: Omit<MenuItem, 'id' | 'isAvailable' | 'imageUrl'>) => {
    setMenuItems((prevItems) => [
      ...prevItems,
      {
        ...itemData,
        id: String(Date.now()), // Simple ID generation
        isAvailable: true,
        imageUrl: `https://placehold.co/300x200.png?text=${encodeURIComponent(itemData.name.substring(0,10))}`,
      },
    ]);
  }, []);

  const toggleItemAvailability = useCallback((id: string) => {
    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  }, []);

  const updateMenuItem = useCallback((updatedItem: MenuItem) => {
    setMenuItems((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  }, []);
  
  const getAvailableItems = useCallback(() => {
    return menuItems.filter(item => item.isAvailable);
  }, [menuItems]);

  return (
    <MenuContext.Provider value={{ menuItems, addMenuItem, toggleItemAvailability, updateMenuItem, getAvailableItems }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
