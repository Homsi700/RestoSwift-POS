
'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { getMenuItems, completeOrderAndPrint, getRestaurantNameAction } from './actions';
import type { MenuItem, OrderItem, Order } from '@/lib/db';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import MenuItemCardComponent from '@/components/MenuItemCard';
import { PlusIcon, MinusIcon, TrashIcon, PrinterIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function POSPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>("ريستو سويفت POS");
  const [isFetchingMenu, startFetchingMenuTransition] = useTransition();
  const [isCompletingOrder, startCompletingOrderTransition] = useTransition();
  const { toast } = useToast();

  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isAuthLoading, router]);

  const fetchMenu = useCallback(() => {
    if (!currentUser) return; // Don't fetch if no user (though redirect should happen)
    startFetchingMenuTransition(async () => {
      try {
        const items = await getMenuItems(true);
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
        toast({ title: "خطأ", description: "فشل تحميل قائمة الطعام.", variant: "destructive" });
      }
    });
  }, [toast, currentUser]);

  const fetchRestaurantName = useCallback(async () => {
    if (!currentUser) return;
    try {
      const name = await getRestaurantNameAction();
      setRestaurantName(name);
    } catch (error) {
      console.error("Failed to fetch restaurant name for POS:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchMenu();
      fetchRestaurantName();
    }
  }, [fetchMenu, fetchRestaurantName, currentUser]);

  const handleAddItemToOrder = useCallback((item: MenuItem) => {
    const itemExistedBeforeUpdate = currentOrderItems.some(oi => oi.menuItemId === item.id);

    setCurrentOrderItems((prevOrderItems) => {
      const existingItem = prevOrderItems.find(oi => oi.menuItemId === item.id);
      if (existingItem) {
        return prevOrderItems.map(oi =>
          oi.menuItemId === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi
        );
      }
      return [...prevOrderItems, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });

    if (!itemExistedBeforeUpdate) {
      toast({
        title: `تمت إضافة ${item.name}`,
        description: `السعر: ${item.price.toLocaleString('ar-SY')} ل.س`,
        duration: 2000,
      });
    }
  }, [currentOrderItems, toast, setCurrentOrderItems]);


  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setCurrentOrderItems((prevOrderItems) => {
      const updatedOrder = prevOrderItems.map(item =>
        item.menuItemId === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      );
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

  const printReceipt = (order: Order, currentRestaurantName: string) => {
    const printWindow = window.open('', '_blank', 'height=600,width=400');
    if (printWindow) {
      printWindow.document.write('<html><head><title>فاتورة طلب</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        @media print {
          @page {
            margin: 5mm;
            size: 80mm auto; /* Common thermal printer width */
          }
        }
        body {
          font-family: 'Courier New', Courier, monospace; /* Monospaced font for alignment */
          font-size: 10pt;
          margin: 0;
          padding: 5mm;
          direction: rtl;
          text-align: right;
          color: #000; /* Ensure text is black */
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 10px;
        }
        .receipt-header h1 {
          font-size: 16pt; /* Larger restaurant name */
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        .receipt-header p {
          font-size: 8pt;
          margin: 2px 0;
        }
        .order-details p {
          font-size: 9pt;
          margin: 3px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          padding: 4px 2px; /* Increased padding */
          font-size: 9pt;
          text-align: right; /* Align text to right for Arabic */
        }
        th {
          border-bottom: 1px solid #000; /* Solid line for header separation */
          font-weight: bold;
        }
        td {
          border-bottom: 1px dashed #ccc; /* Dashed line for items */
        }
        tr.no-border td {
          border-bottom: none;
        }
        .item-name { width: 45%; } /* Adjusted column widths */
        .item-qty { width: 15%; text-align: center; }
        .item-price { width: 20%; text-align: left; } /* Price aligned left */
        .item-total { width: 20%; text-align: left; } /* Total aligned left */

        .totals-section {
          margin-top: 15px;
          border-top: 2px solid #000; /* Double solid line before totals */
          padding-top: 8px;
        }
        .totals-section div {
          display: flex;
          justify-content: space-between;
          font-size: 10pt;
          margin-bottom: 4px;
        }
        .totals-section div span:first-child {
          font-weight: normal;
          text-align: right;
        }
        .totals-section div span:last-child {
          font-weight: bold;
          text-align: left;
        }
        .footer-message {
          text-align: center;
          margin-top: 20px;
          font-size: 9pt;
        }
        hr.separator {
          border: none;
          border-top: 1px dashed #555;
          margin: 8px 0;
        }
      `);
      printWindow.document.write('</style></head><body>');

      printWindow.document.write('<div class="receipt-header">');
      printWindow.document.write(`<h1>${currentRestaurantName || 'ريستو سويفت POS'}</h1>`);
      printWindow.document.write('</div>');

      printWindow.document.write('<hr class="separator">');

      printWindow.document.write('<div class="order-details">');
      printWindow.document.write(`<p>رقم الفاتورة: ${order.id}</p>`);
      printWindow.document.write(`<p>التاريخ: ${new Date(order.timestamp).toLocaleDateString('ar-SY', { year: 'numeric', month: 'short', day: 'numeric' })}</p>`);
      printWindow.document.write(`<p>الوقت: ${new Date(order.timestamp).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}</p>`);
      printWindow.document.write('</div>');

      printWindow.document.write('<hr class="separator">');

      printWindow.document.write('<table><thead><tr>');
      printWindow.document.write('<th class="item-name">الصنف</th><th class="item-qty">الكمية</th><th class="item-price">السعر</th><th class="item-total">الإجمالي</th>');
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

      printWindow.document.write('<div class="totals-section">');
      printWindow.document.write(`<div><span>الإجمالي للدفع:</span> <span>${order.totalAmount.toLocaleString('ar-SY')} ل.س</span></div>`);
      printWindow.document.write('</div>');

      printWindow.document.write('<hr class="separator" style="margin-top: 15px;">');

      printWindow.document.write('<p class="footer-message">شكراً لزيارتكم!</p>');
      printWindow.document.write('<p class="footer-message">نتمنى لكم يوماً سعيداً</p>');

      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
      }, 250);

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
          description: `رقم الفاتورة: ${result.id}. الإجمالي: ${result.totalAmount.toLocaleString('ar-SY')} ل.س.`,
        });
        printReceipt(result, restaurantName);
        setCurrentOrderItems([]);
      }
    });
  }, [currentOrderItems, toast, restaurantName, setCurrentOrderItems]);

  const totalAmount = calculateTotalAmount();

  if (isAuthLoading || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-var(--header-height,80px))] w-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 rtl:mr-4 text-lg text-muted-foreground">
          {isAuthLoading ? 'جاري تحميل بيانات المستخدم...' : 'إعادة التوجيه لتسجيل الدخول...'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-var(--header-height,80px))] max-h-[calc(100vh-var(--header-height,80px))]">
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
