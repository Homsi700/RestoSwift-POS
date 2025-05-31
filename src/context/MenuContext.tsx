
'use client';

import type { MenuItem } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getMenuItems as getMenuItemsAction, 
  addMenuItemAction, 
  toggleMenuItemAvailabilityAction, 
  updateMenuItemAction 
} from '@/app/actions';

interface MenuContextType {
  menuItems: MenuItem[];
  addMenuItem: (itemData: Omit<MenuItem, 'id' | 'isAvailable' | 'imageUrl'>) => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<void>;
  updateMenuItem: (updatedItem: MenuItem) => Promise<void>;
  getAvailableItems: () => MenuItem[];
  isLoading: boolean;
  isMutating: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, startLoadingTransition] = useTransition(); // For initial loading
  const [isMutating, startMutationTransition] = useTransition(); // For add, update, toggle
  const { toast } = useToast();

  const fetchAllMenuItems = useCallback(() => {
    startLoadingTransition(async () => {
      try {
        const items = await getMenuItemsAction(false); // Fetch all items for admin
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to fetch menu items for admin:", error);
        toast({ title: "خطأ", description: "فشل تحميل قائمة الطعام للإدارة.", variant: "destructive" });
        setMenuItems([]); // Set to empty or handle with fallback
      }
    });
  }, [toast]);

  useEffect(() => {
    fetchAllMenuItems();
  }, [fetchAllMenuItems]);

  const addMenuItem = useCallback(async (itemData: Omit<MenuItem, 'id' | 'isAvailable' | 'imageUrl'>) => {
    startMutationTransition(async () => {
      try {
        const newItem = await addMenuItemAction(itemData);
        if (newItem) {
          setMenuItems((prevItems) => [...prevItems, newItem]);
          toast({ title: "نجاح", description: `تمت إضافة "${newItem.name}" بنجاح.` });
        } else {
          throw new Error("Failed to add item, no item returned");
        }
      } catch (error) {
        console.error("Failed to add menu item:", error);
        toast({ title: "خطأ", description: "فشل إضافة العنصر الجديد.", variant: "destructive" });
      }
    });
  }, [toast]);

  const toggleItemAvailability = useCallback(async (id: string) => {
    startMutationTransition(async () => {
      try {
        const updatedItem = await toggleMenuItemAvailabilityAction(id);
        if (updatedItem) {
          setMenuItems((prevItems) =>
            prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
          );
          toast({ title: "نجاح", description: `تم تحديث حالة توفر "${updatedItem.name}".` });
        } else {
          throw new Error("Failed to toggle availability, no item returned");
        }
      } catch (error) {
        console.error("Failed to toggle item availability:", error);
        toast({ title: "خطأ", description: "فشل تحديث حالة توفر العنصر.", variant: "destructive" });
      }
    });
  }, [toast]);

  const updateMenuItem = useCallback(async (updatedItemData: MenuItem) => {
    startMutationTransition(async () => {
      try {
        const resultItem = await updateMenuItemAction(updatedItemData);
        if (resultItem) {
          setMenuItems((prevItems) =>
            prevItems.map((item) => (item.id === resultItem.id ? resultItem : item))
          );
          toast({ title: "نجاح", description: `تم تحديث "${resultItem.name}" بنجاح.` });
        } else {
          throw new Error("Failed to update item, no item returned");
        }
      } catch (error) {
        console.error("Failed to update menu item:", error);
        toast({ title: "خطأ", description: "فشل تحديث بيانات العنصر.", variant: "destructive" });
      }
    });
  }, [toast]);
  
  const getAvailableItems = useCallback(() => {
    // This function is mainly for the POS page, admin page uses all items.
    return menuItems.filter(item => item.isAvailable);
  }, [menuItems]);

  return (
    <MenuContext.Provider value={{ 
      menuItems, 
      addMenuItem, 
      toggleItemAvailability, 
      updateMenuItem, 
      getAvailableItems,
      isLoading: isLoading, // For initial fetch
      isMutating: isMutating // For CUD operations
    }}>
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
