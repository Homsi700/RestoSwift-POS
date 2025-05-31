
'use client';

import React, { useState } from 'react';
import { useMenu } from '@/context/MenuContext';
import AddItemForm from '@/components/AddItemForm';
import EditItemForm from '@/components/EditItemForm';
import MenuItemCard from '@/components/MenuItemCard';
import type { MenuItem } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Trash2 } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminMenuPage() {
  const { menuItems, addMenuItem, toggleItemAvailability, updateMenuItem, deleteMenuItem, isLoading, isMutating } = useMenu();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);


  const handleOpenEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (updatedItem: MenuItem) => {
    await updateMenuItem(updatedItem); 
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleAddItem = async (itemData: Omit<MenuItem, 'id' | 'isAvailable' | 'imageUrl'>) => {
    await addMenuItem(itemData);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setDeletingItemId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingItemId) {
      await deleteMenuItem(deletingItemId);
    }
    setIsDeleteDialogOpen(false);
    setDeletingItemId(null);
  };

  if (isLoading && menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-lg">جاري تحميل قائمة الطعام...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <AddItemForm onAddItem={handleAddItem} /> 
      </div>

      <div className="flex flex-col flex-grow min-h-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-headline text-3xl text-primary shrink-0">إدارة عناصر القائمة</h2>
          {(isLoading || isMutating) && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        </div>
        
        {menuItems.length > 0 ? (
           <ScrollArea className="flex-grow pe-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {menuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onToggleAvailability={toggleItemAvailability}
                  onEdit={handleOpenEditDialog}
                  onDelete={handleOpenDeleteDialog} // Pass delete handler
                  showAdminControls={true}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          !isLoading && (
            <p className="text-muted-foreground text-center py-10">
              لا توجد عناصر في القائمة بعد. أضف البعض باستخدام النموذج أعلاه.
            </p>
          )
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
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف هذا العنصر نهائياً من قائمة الطعام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                <Trash2 className="ms-2 h-4 w-4" />
                حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
