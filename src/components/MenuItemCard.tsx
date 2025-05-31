
'use client';

import Image from 'next/image';
import type { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle, Eye, EyeOff, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  onToggleAvailability?: (id: string) => void;
  onEdit?: (item: MenuItem) => void; // Added for edit functionality
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
    <Card className={cn("flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300", !item.isAvailable && !showAdminControls ? "opacity-50" : "")}>
      <CardHeader className="p-4">
        <CardTitle className="font-headline text-xl truncate">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{item.category}</CardDescription>
      </CardHeader>
      {item.imageUrl && (
        <div className="relative w-full h-40">
          <Image 
            src={item.imageUrl} 
            alt={item.name} 
            layout="fill" 
            objectFit="cover" 
            data-ai-hint={`${item.category.toLowerCase()} food`}
          />
        </div>
      )}
      <CardContent className="p-4 flex-grow">
        <p className="text-lg font-semibold text-primary">{item.price.toFixed(0)} ل.س</p>
        {!item.isAvailable && !showAdminControls && (
          <p className="text-sm font-semibold text-destructive mt-2">غير متوفر</p>
        )}
      </CardContent>
      <CardFooter className="p-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        {showAdminControls && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Switch
              id={`available-${item.id}`}
              checked={item.isAvailable}
              onCheckedChange={handleToggle}
              aria-label={item.isAvailable ? "تحديد كغير متوفر" : "تحديد كمتوفر"}
            />
            <Label htmlFor={`available-${item.id}`} className="text-sm flex items-center gap-1">
              {item.isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
              {item.isAvailable ? 'متوفر' : 'غير متوفر'}
            </Label>
            {onEdit && (
              <Button variant="outline" size="icon" onClick={handleEdit} aria-label={`تعديل ${item.name}`}>
                <Pencil size={16} />
              </Button>
            )}
          </div>
        )}
        {onAddToCart && item.isAvailable && (
          <Button 
            onClick={() => onAddToCart(item)} 
            className="w-full sm:w-auto"
            aria-label={`إضافة ${item.name} للطلب`}
          >
            <PlusCircle size={18} className="ms-2" /> إضافة للطلب
          </Button>
        )}
         {onAddToCart && !item.isAvailable && !showAdminControls && (
          <Button disabled className="w-full sm:w-auto">
            غير متوفر
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
