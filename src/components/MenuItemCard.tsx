
'use client';

import type { MenuItem } from '@/lib/db'; // Use type from db.ts
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Pencil } from 'lucide-react'; // PlusCircle removed as it's no longer used
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  onClick?: (item: MenuItem) => void; // For POS page: add to cart
  // Props for Admin page (from existing implementation)
  onToggleAvailability?: (id: string) => void;
  onEdit?: (item: MenuItem) => void;
  showAdminControls?: boolean;
}

export default function MenuItemCard({ 
  item, 
  onClick,
  onToggleAvailability,
  onEdit,
  showAdminControls = false
}: MenuItemCardProps) {

  const handleCardClick = () => {
    if (onClick && item.isAvailable) {
      onClick(item);
    }
  };

  const handleToggleAdmin = () => {
    if (onToggleAvailability) {
      onToggleAvailability(item.id);
    }
  };

  const handleEditAdmin = () => {
    if (onEdit) {
      onEdit(item);
    }
  };

  // Determine if the card is for POS (onClick is present) or Admin (showAdminControls is true)
  const isPOSCard = !!onClick;

  return (
    <Card 
      className={cn(
        "flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200",
        !item.isAvailable ? "opacity-60 bg-muted/50" : "bg-card",
        isPOSCard && item.isAvailable ? "cursor-pointer select-none" : "", // Added select-none
        isPOSCard && !item.isAvailable ? "cursor-not-allowed" : "",
        "min-w-[130px] max-w-[180px]" // Adjusted size for POS
      )}
      onClick={isPOSCard ? handleCardClick : undefined}
      role={isPOSCard ? "button" : undefined}
      tabIndex={isPOSCard && item.isAvailable ? 0 : undefined}
      aria-disabled={!item.isAvailable}
      aria-label={isPOSCard && item.isAvailable ? `إضافة ${item.name} للطلب` : item.name}
    >
      <CardHeader className="p-2 pt-3">
        <CardTitle className="font-semibold text-sm truncate text-center leading-tight h-10 flex items-center justify-center">
          {item.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 flex-grow flex flex-col items-center justify-center">
        <p className="text-xs font-bold text-primary">{item.price.toLocaleString('ar-SY')} ل.س</p>
        {!item.isAvailable && (
          <p className="text-xs font-semibold text-destructive mt-1">غير متوفر</p>
        )}
      </CardContent>
      
      {showAdminControls && ( // Admin controls section
        <CardFooter className="p-2 flex flex-col gap-2">
            <div className="flex items-center justify-around space-x-1 rtl:space-x-reverse w-full mb-1">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleAdmin}
                    aria-label={item.isAvailable ? "تحديد كغير متوفر" : "تحديد كمتوفر"}
                    className="h-7 w-7"
                >
                    {item.isAvailable ? <Eye size={14} /> : <EyeOff size={14} />}
                </Button>
              </div>
              {onEdit && (
                <Button variant="outline" size="icon" onClick={handleEditAdmin} aria-label={`تعديل ${item.name}`} className="h-7 w-7">
                  <Pencil size={14} />
                </Button>
              )}
            </div>
        </CardFooter>
      )}
      {/* Redundant "Add" button for POS card has been removed as per user feedback, the whole card is clickable */}
    </Card>
  );
}
