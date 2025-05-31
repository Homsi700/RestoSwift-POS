
'use client';

import React, { useState } from 'react';
import { useMenu } from '@/context/MenuContext';
import AddItemForm from '@/components/AddItemForm';
import EditItemForm from '@/components/EditItemForm'; // Import EditItemForm
import MenuItemCard from '@/components/MenuItemCard';
import type { MenuItem } from '@/types'; // Import MenuItem type
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminMenuPage() {
  const { menuItems, addMenuItem, toggleItemAvailability, updateMenuItem } = useMenu();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleOpenEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedItem: MenuItem) => {
    updateMenuItem(updatedItem);
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <AddItemForm onAddItem={addMenuItem} />
      </div>

      <div className="flex flex-col flex-grow min-h-0">
        <h2 className="font-headline text-3xl mb-6 text-primary shrink-0">إدارة عناصر القائمة</h2>
        {menuItems.length > 0 ? (
           <ScrollArea className="flex-grow pe-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {menuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onToggleAvailability={toggleItemAvailability}
                  onEdit={handleOpenEditDialog} // Pass handler to open edit dialog
                  showAdminControls={true}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground text-center py-10">لا توجد عناصر في القائمة بعد. أضف البعض باستخدام النموذج أعلاه.</p>
        )}
      </div>
      {editingItem && (
        <EditItemForm
          item={editingItem}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
