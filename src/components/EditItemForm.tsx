
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { MenuItem } from '@/types';
import { Save } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: "الاسم يجب أن يتكون من حرفين على الأقل." }),
  price: z.coerce.number().positive({ message: "السعر يجب أن يكون رقمًا موجبًا." }),
  category: z.string().min(2, { message: "الفئة يجب أن تتكون من حرفين على الأقل." }),
});

type EditItemFormValues = z.infer<typeof formSchema>;

interface EditItemFormProps {
  item: MenuItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (itemData: MenuItem) => void;
}

export default function EditItemForm({ item, isOpen, onOpenChange, onSave }: EditItemFormProps) {
  const form = useForm<EditItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
      category: '',
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        price: item.price,
        category: item.category,
      });
    }
  }, [item, form, isOpen]); // re-populate form when item or isOpen changes

  function onSubmit(values: EditItemFormValues) {
    if (item) {
      onSave({
        ...item, // preserve id, isAvailable, imageUrl
        ...values,
      });
      onOpenChange(false); // Close dialog on save
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">تعديل العنصر</DialogTitle>
        </DialogHeader>
        {item && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم العنصر</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: فروج مشوي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر (ل.س)</FormLabel>
                    <FormControl>
                      <Input type="number" step="100" placeholder="مثال: 25000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: بيتزا, مشروبات, حلويات" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">إلغاء</Button>
                </DialogClose>
                <Button type="submit">
                  <Save size={18} className="ms-2" /> حفظ التغييرات
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
