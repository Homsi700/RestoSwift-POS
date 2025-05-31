'use client';

import { useState, useCallback } from 'react';
import type { MenuItem as MenuItemType, OrderItem } from '@/types';
import { useMenu } from '@/context/MenuContext';
import MenuItemCard from '@/components/MenuItemCard';
import OrderSummary from '@/components/OrderSummary';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function POSPage() {
  const { getAvailableItems } = useMenu();
  const menuItems = getAvailableItems();
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const { toast } = useToast();

  const handleAddToCart = useCallback((item: MenuItemType) => {
    setCurrentOrderItems((prevOrderItems) => {
      const existingItem = prevOrderItems.find(oi => oi.menuItemId === item.id);
      if (existingItem) {
        return prevOrderItems.map(oi =>
          oi.menuItemId === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi
        );
      }
      return [...prevOrderItems, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    toast({
      title: `${item.name} added to order`,
      description: `Price: $${item.price.toFixed(2)}`,
      variant: "default",
      duration: 3000,
    });
  }, [toast]);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    setCurrentOrderItems((prevOrderItems) =>
      prevOrderItems.filter(oi => oi.menuItemId !== itemId)
    );
  }, []);

  const handleUpdateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
    } else {
      setCurrentOrderItems((prevOrderItems) =>
        prevOrderItems.map(oi =>
          oi.menuItemId === itemId ? { ...oi, quantity: newQuantity } : oi
        )
      );
    }
  }, [handleRemoveFromCart]);

  const handleCheckout = useCallback(() => {
    if (currentOrderItems.length === 0) {
      toast({
        title: "Empty Order",
        description: "Please add items to your order before checkout.",
        variant: "destructive",
      });
      return;
    }
    // Mock payment processing and order saving
    const orderTotal = currentOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    console.log("Order Placed:", {
      items: currentOrderItems,
      total: orderTotal.toFixed(2),
      timestamp: new Date().toISOString(),
    });

    toast({
      title: "Order Placed Successfully!",
      description: `Total: $${orderTotal.toFixed(2)}. Receipt is being "printed".`,
      variant: "default",
    });

    // Mock receipt printing
    console.log("--- RECEIPT ---");
    currentOrderItems.forEach(item => {
      console.log(`${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`);
    });
    console.log(`TOTAL: $${orderTotal.toFixed(2)}`);
    console.log("-----------------");

    setCurrentOrderItems([]); // Clear the cart
  }, [currentOrderItems, toast]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-var(--header-height,100px)-4rem)]"> {/* Adjust header height assumption */}
      <div className="lg:w-3/5 xl:w-2/3 h-full">
        <h2 className="font-headline text-3xl mb-6 text-primary">Menu</h2>
        <ScrollArea className="h-[calc(100%-4rem)] pr-4"> {/* Adjust for h2 height */}
          {menuItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
             <p className="text-muted-foreground text-center py-10">No menu items available at the moment.</p>
          )}
        </ScrollArea>
      </div>
      <div className="lg:w-2/5 xl:w-1/3 h-full">
         <OrderSummary
            orderItems={currentOrderItems}
            onRemoveItem={handleRemoveFromCart}
            onUpdateQuantity={handleUpdateQuantity}
            onCheckout={handleCheckout}
          />
      </div>
    </div>
  );
}
