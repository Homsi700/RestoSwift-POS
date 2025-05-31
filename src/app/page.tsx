
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
      title: `تمت إضافة ${item.name} إلى الطلب`,
      description: `السعر: ${item.price.toFixed(0)} ل.س`,
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
        title: "الطلب فارغ",
        description: "الرجاء إضافة عناصر إلى طلبك قبل الدفع.",
        variant: "destructive",
      });
      return;
    }
    const orderTotal = currentOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    console.log("Order Placed:", {
      items: currentOrderItems,
      total: orderTotal.toFixed(0),
      timestamp: new Date().toISOString(),
    });

    toast({
      title: "تم إرسال الطلب بنجاح!",
      description: `الإجمالي: ${orderTotal.toFixed(0)} ل.س. يتم "طباعة" الفاتورة.`,
      variant: "default",
    });

    console.log("--- فاتورة ---");
    currentOrderItems.forEach(item => {
      console.log(`${item.name} x ${item.quantity} - ${(item.price * item.quantity).toFixed(0)} ل.س`);
    });
    console.log(`الإجمالي: ${orderTotal.toFixed(0)} ل.س`);
    console.log("-----------------");

    setCurrentOrderItems([]); 
  }, [currentOrderItems, toast]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 flex-grow">
      <div className="lg:w-3/5 xl:w-2/3 h-full flex flex-col">
        <h2 className="font-headline text-3xl mb-6 text-primary shrink-0">القائمة</h2>
        <ScrollArea className="flex-grow pe-4 min-h-0">
          {menuItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
             <p className="text-muted-foreground text-center py-10">لا توجد عناصر متاحة في القائمة حاليًا.</p>
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
