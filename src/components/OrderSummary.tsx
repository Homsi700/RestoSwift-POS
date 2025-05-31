'use client';

import type { OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { MinusCircle, PlusCircle, Trash2, CreditCard } from 'lucide-react';

interface OrderSummaryProps {
  orderItems: OrderItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onCheckout: () => void;
}

export default function OrderSummary({ orderItems, onRemoveItem, onUpdateQuantity, onCheckout }: OrderSummaryProps) {
  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      onUpdateQuantity(itemId, newQuantity);
    } else if (newQuantity === 0) {
      onRemoveItem(itemId);
    }
  };
  
  const handleManualQuantityChange = (itemId: string, value: string) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      onUpdateQuantity(itemId, newQuantity);
    } else if (!isNaN(newQuantity) && newQuantity <= 0) {
       onRemoveItem(itemId);
    }
  };


  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Current Order</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[calc(100%-0px)] p-4"> {/* Adjust height as needed */}
          {orderItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">Your order is empty. Add items from the menu.</p>
          ) : (
            <ul className="space-y-3">
              {orderItems.map((item) => (
                <li key={item.menuItemId} className="flex items-center justify-between p-3 bg-card-foreground/5 rounded-md">
                  <div className="flex-grow">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.menuItemId, item.quantity, -1)} aria-label={`Decrease quantity of ${item.name}`}>
                      <MinusCircle size={18} />
                    </Button>
                    <Input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => handleManualQuantityChange(item.menuItemId, e.target.value)} 
                      className="w-12 h-8 text-center"
                      aria-label={`Quantity of ${item.name}`}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.menuItemId, item.quantity, 1)} aria-label={`Increase quantity of ${item.name}`}>
                      <PlusCircle size={18} />
                    </Button>
                  </div>
                  <p className="w-20 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.menuItemId)} className="text-destructive hover:text-destructive/80" aria-label={`Remove ${item.name} from order`}>
                    <Trash2 size={18} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
      {orderItems.length > 0 && (
        <CardFooter className="flex flex-col gap-4 p-4 border-t">
          <div className="w-full flex justify-between items-center text-xl font-bold">
            <span>Total:</span>
            <span className="text-primary">${totalAmount.toFixed(2)}</span>
          </div>
          <Button onClick={onCheckout} className="w-full text-lg py-6" size="lg" aria-label="Proceed to payment">
            <CreditCard size={22} className="mr-2" /> Pay / Complete Order
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
