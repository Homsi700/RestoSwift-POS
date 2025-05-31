
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Not used directly, FormLabel is used
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusSquare } from 'lucide-react';
import type { MenuItem } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "الاسم يجب أن يتكون من حرفين على الأقل." }),
  price: z.coerce.number().positive({ message: "السعر يجب أن يكون رقمًا موجبًا." }),
  category: z.string().min(2, { message: "الفئة يجب أن تتكون من حرفين على الأقل." }),
});

type AddItemFormValues = z.infer<typeof formSchema>;

interface AddItemFormProps {
  onAddItem: (itemData: Omit<MenuItem, 'id' | 'isAvailable' | 'imageUrl'>) => void;
}

export default function AddItemForm({ onAddItem }: AddItemFormProps) {
  const form = useForm<AddItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
      category: '',
    },
  });

  function onSubmit(values: AddItemFormValues) {
    onAddItem(values);
    form.reset();
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <PlusSquare size={24} className="text-primary" /> إضافة عنصر جديد للقائمة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <Button type="submit" className="w-full">
              <PlusSquare size={18} className="ms-2" /> إضافة عنصر
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
