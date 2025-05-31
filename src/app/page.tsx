
'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { getMenuItems, completeOrderAndPrint } from './actions';
import type { MenuItem, OrderItem, Order } from '@/lib/db';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import MenuItemCardComponent from '@/components/MenuItemCard'; // Renamed to avoid conflict
import { PlusIcon, MinusIcon, TrashIcon, PrinterIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

export default function POSPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [isFetchingMenu, startFetchingMenuTransition] = useTransition();
  const [isCompletingOrder, startCompletingOrderTransition] = useTransition();
  const { toast } = useToast();

  const fetchMenu = useCallback(() => {
    startFetchingMenuTransition(async () => {
      try {
        const items = await getMenuItems(true); // Fetch only available items
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
        toast({ title: "خطأ", description: "فشل تحميل قائمة الطعام.", variant: "destructive" });
      }
    });
  }, [toast]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleAddItemToOrder = useCallback((item: MenuItem) => {
    setCurrentOrderItems((prevOrderItems) => {
      const existingItem = prevOrderItems.find(oi => oi.menuItemId === item.id);
      if (existingItem) {
        return prevOrderItems.map(oi =>
          oi.menuItemId === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi
        );
      }
      toast({
        title: `تمت إضافة ${item.name}`,
        description: `السعر: ${item.price.toLocaleString('ar-SY')} ل.س`,
        duration: 2000,
      });
      return [...prevOrderItems, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  }, [toast]);

  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setCurrentOrderItems((prevOrderItems) => {
      const updatedOrder = prevOrderItems.map(item =>
        item.menuItemId === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) } // Ensure quantity doesn't go below 0
          : item
      );
      // Remove item if quantity is 0
      return updatedOrder.filter(item => item.quantity > 0);
    });
  }, []);

  const handleRemoveItemFromOrder = useCallback((itemId: string) => {
    setCurrentOrderItems((prevOrderItems) =>
      prevOrderItems.filter(oi => oi.menuItemId !== itemId)
    );
  }, []);

  const calculateTotalAmount = useCallback(() => {
    return currentOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [currentOrderItems]);

  const printReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank', 'height=600,width=400');
    if (printWindow) {
      printWindow.document.write('<html><head><title>فاتورة طلب</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        @media print {
          @page { margin: 5mm; size: 80mm auto; } /* Common thermal printer width */
        }
        body { 
          font-family: 'Arial', sans-serif; /* Common font */
          font-size: 10pt; /* Adjust for readability on small receipts */
          margin: 0;
          padding: 5mm;
          direction: rtl;
          text-align: right;
        }
        .receipt-header { text-align: center; margin-bottom: 10px; }
        .receipt-header h1 { font-size: 14pt; margin: 0; }
        .receipt-header p { font-size: 8pt; margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 3px 1px; font-size: 9pt; }
        th { border-bottom: 1px dashed #000; }
        .item-name { width: 50%; }
        .item-qty, .item-price { width: 15%; text-align: center; }
        .item-total { width: 20%; text-align: left; }
        .totals-section { margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
        .totals-section div { display: flex; justify-content: space-between; font-size: 10pt; margin-bottom: 3px; }
        .totals-section div span:first-child { font-weight: normal; }
        .totals-section div span:last-child { font-weight: bold; text-align: left;}
        .footer-message { text-align: center; margin-top: 15px; font-size: 8pt; }
        hr { border: none; border-top: 1px dashed #000; margin: 5px 0; }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write('<div class="receipt-header">');
      printWindow.document.write('<h1>ريستو سويفت</h1>'); // Restaurant Name
      // Add more details like address, phone if needed
      printWindow.document.write('</div>');
      printWindow.document.write(`<p>رقم الفاتورة: ${order.id.substring(0, 8)}</p>`);
      printWindow.document.write(`<p>التاريخ: ${new Date(order.timestamp).toLocaleString('ar-SY', {dateStyle: 'short', timeStyle: 'short'})}</p>`);
      printWindow.document.write('<table><thead><tr>');
      printWindow.document.write('<th class="item-name">الصنف</th><th class="item-qty">كمية</th><th class="item-price">سعر</th><th class="item-total">إجمالي</th>');
      printWindow.document.write('</tr></thead><tbody>');
      order.items.forEach(item => {
        printWindow.document.write('<tr>');
        printWindow.document.write(`<td class="item-name">${item.name}</td>`);
        printWindow.document.write(`<td class="item-qty">${item.quantity}</td>`);
        printWindow.document.write(`<td class="item-price">${item.price.toLocaleString('ar-SY')}</td>`);
        printWindow.document.write(`<td class="item-total">${(item.price * item.quantity).toLocaleString('ar-SY')}</td>`);
        printWindow.document.write('</tr>');
      });
      printWindow.document.write('</tbody></table>');
      printWindow.document.write('<hr>');
      printWindow.document.write('<div class="totals-section">');
      printWindow.document.write(`<div><span>الإجمالي الفرعي:</span> <span>${order.totalAmount.toLocaleString('ar-SY')} ل.س</span></div>`);
      // Add tax, discount if needed
      printWindow.document.write(`<div><span>الإجمالي الكلي:</span> <span>${order.totalAmount.toLocaleString('ar-SY')} ل.س</span></div>`);
      printWindow.document.write('</div>');
      printWindow.document.write('<hr>');
      printWindow.document.write('<p class="footer-message">شكراً لزيارتكم!</p>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      // printWindow.close(); // Some browsers might close it too soon
    } else {
      toast({ title: "خطأ في الطباعة", description: "لم يتمكن المتصفح من فتح نافذة الطباعة.", variant: "destructive" });
    }
  };

  const handleCheckout = useCallback(async () => {
    if (currentOrderItems.length === 0) {
      toast({
        title: "الطلب فارغ",
        description: "الرجاء إضافة عناصر إلى طلبك قبل الدفع.",
        variant: "destructive",
      });
      return;
    }

    startCompletingOrderTransition(async () => {
      const result = await completeOrderAndPrint(currentOrderItems);
      if ('error' in result) {
        toast({ title: "خطأ", description: result.error, variant: "destructive" });
      } else {
        toast({
          title: "تم إرسال الطلب بنجاح!",
          description: `الإجمالي: ${result.totalAmount.toLocaleString('ar-SY')} ل.س.`,
        });
        printReceipt(result);
        setCurrentOrderItems([]);
      }
    });
  }, [currentOrderItems, toast]);

  const totalAmount = calculateTotalAmount();

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-var(--header-height,80px))] max-h-[calc(100vh-var(--header-height,80px))]"> {/* Adjust header height var if needed */}
      {/* Menu Items Section */}
      <div className="lg:w-3/4 xl:w-2/3 flex flex-col p-4 bg-background rounded-lg shadow-md overflow-hidden">
        <h2 className="font-headline text-2xl mb-4 text-primary shrink-0">اختر الأصناف</h2>
        {isFetchingMenu ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ms-3 text-muted-foreground">جاري تحميل قائمة الطعام...</p>
          </div>
        ) : menuItems.length > 0 ? (
          <ScrollArea className="flex-grow -me-2 pe-2 min-h-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {menuItems.map((item) => (
                <MenuItemCardComponent 
                  key={item.id} 
                  item={item} 
                  onClick={handleAddItemToOrder}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-muted-foreground text-center py-10">
              لا توجد أصناف متاحة حاليًا.
              <Button variant="link" onClick={fetchMenu} className="block mx-auto mt-2">حاول مرة أخرى</Button>
            </p>
          </div>
        )}
      </div>

      {/* Order Summary Section */}
      <div className="lg:w-1/4 xl:w-1/3 flex flex-col p-4 bg-card text-card-foreground rounded-lg shadow-md overflow-hidden">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="font-headline text-2xl flex items-center">
            <ShoppingBagIcon className="h-7 w-7 me-2 text-primary" />
            الفاتورة الحالية
          </CardTitle>
        </CardHeader>
        <Separator className="mb-4" />
        
        {currentOrderItems.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-muted-foreground text-center py-10">الفاتورة فارغة. أضف أصنافًا من القائمة.</p>
          </div>
        ) : (
          <ScrollArea className="flex-grow -me-2 pe-2 min-h-0 mb-4">
            <div className="space-y-3">
              {currentOrderItems.map((item) => (
                <div key={item.menuItemId} className="flex items-center justify-between p-2 bg-background rounded-md shadow-sm">
                  <div className="flex-grow">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.price.toLocaleString('ar-SY')} ل.س</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.menuItemId, -1)}>
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                            const newQuantity = parseInt(e.target.value, 10);
                            if (!isNaN(newQuantity) && newQuantity >= 0) {
                                handleUpdateQuantity(item.menuItemId, newQuantity - item.quantity);
                            } else if (e.target.value === '') {
                                // Allow clearing the input, effectively setting quantity to 0 (will be removed if < 1)
                                handleUpdateQuantity(item.menuItemId, -item.quantity);
                            }
                        }}
                        className="w-10 h-7 text-center px-1 text-sm"
                        min="0"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.menuItemId, 1)}>
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="w-20 text-left font-semibold text-xs ps-2">{(item.price * item.quantity).toLocaleString('ar-SY')} ل.س</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80" onClick={() => handleRemoveItemFromOrder(item.menuItemId)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <CardFooter className="flex flex-col gap-3 p-0 pt-4 border-t">
          <div className="w-full flex justify-between items-center text-lg">
            <span className="font-semibold">الإجمالي:</span>
            <span className="font-bold text-primary">{totalAmount.toLocaleString('ar-SY')} ل.س</span>
          </div>
          <Button 
            onClick={handleCheckout} 
            disabled={isCompletingOrder || currentOrderItems.length === 0}
            className="w-full text-base py-3" 
            size="lg"
          >
            {isCompletingOrder ? (
              <Loader2 className="h-5 w-5 animate-spin me-2" />
            ) : (
              <PrinterIcon className="h-5 w-5 me-2" />
            )}
            {isCompletingOrder ? 'جاري الدفع...' : 'إغلاق الفاتورة ودفع'}
          </Button>
        </CardFooter>
      </div>
    </div>
  );
}
