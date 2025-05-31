'use client';

import { useMenu } from '@/context/MenuContext';
import AddItemForm from '@/components/AddItemForm';
import MenuItemCard from '@/components/MenuItemCard';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminMenuPage() {
  const { menuItems, addMenuItem, toggleItemAvailability } = useMenu();

  return (
    <div className="space-y-8">
      <div>
        <AddItemForm onAddItem={addMenuItem} />
      </div>

      <div>
        <h2 className="font-headline text-3xl mb-6 text-primary">Manage Menu Items</h2>
        {menuItems.length > 0 ? (
           <ScrollArea className="h-[calc(100vh-var(--header-height,100px)-20rem)] pr-2"> {/* Adjust height */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {menuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onToggleAvailability={toggleItemAvailability}
                  showAdminControls={true}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground text-center py-10">No menu items yet. Add some using the form above.</p>
        )}
      </div>
    </div>
  );
}
