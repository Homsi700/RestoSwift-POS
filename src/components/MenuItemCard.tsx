
'use client';

import type { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle, Eye, EyeOff, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  onToggleAvailability?: (id: string) => void;
  onEdit?: (item: MenuItem) => void;
  showAdminControls?: boolean;
}

export default function MenuItemCard({ item, onAddToCart, onToggleAvailability, onEdit, showAdminControls = false }: MenuItemCardProps) {
  const handleToggle = () => {
    if (onToggleAvailability) {
      onToggleAvailability(item.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(item);
    }
  };

  return (
    <Card className={cn(
      "flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200",
      !item.isAvailable && !showAdminControls ? "opacity-60" : "",
      "min-w-[150px]" // Added min-width for better control in dense grids
    )}>
      <CardHeader className="p-2 pt-3">
        <CardTitle className="font-headline text-md truncate text-center leading-tight">{item.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 flex-grow flex flex-col items-center justify-center">
        <p className="text-sm font-semibold text-primary">{item.price.toFixed(0)} ل.س</p>
        {!item.isAvailable && !showAdminControls && (
          <p className="text-xs font-semibold text-destructive mt-1">غير متوفر</p>
        )}
      </CardContent>
      
      <CardFooter className="p-2 flex flex-col gap-2">
        {showAdminControls && (
          <div className="flex items-center justify-around space-x-1 rtl:space-x-reverse w-full mb-1">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Switch
                id={`available-${item.id}`}
                checked={item.isAvailable}
                onCheckedChange={handleToggle}
                aria-label={item.isAvailable ? "تحديد كغير متوفر" : "تحديد كمتوفر"}
                className="h-5 w-9 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-4 [&>span]:data-[state=unchecked]:translate-x-0"
              />
              <Label htmlFor={`available-${item.id}`} className="text-xs flex items-center gap-1">
                {item.isAvailable ? <Eye size={14} /> : <EyeOff size={14} />}
              </Label>
            </div>
            {onEdit && (
              <Button variant="outline" size="icon" onClick={handleEdit} aria-label={`تعديل ${item.name}`} className="h-7 w-7">
                <Pencil size={14} />
              </Button>
            )}
          </div>
        )}
        {onAddToCart && item.isAvailable && (
          <Button 
            onClick={() => onAddToCart(item)} 
            className="w-full h-8 text-xs"
            size="sm"
            aria-label={`إضافة ${item.name} للطلب`}
          >
            <PlusCircle size={14} className="ms-1" /> إضافة
          </Button>
        )}
         {onAddToCart && !item.isAvailable && !showAdminControls && (
          <Button disabled className="w-full h-8 text-xs" size="sm">
            غير متوفر
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
