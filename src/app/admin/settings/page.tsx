
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getRestaurantNameAction, updateRestaurantNameAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, SettingsIcon } from 'lucide-react';

const settingsFormSchema = z.object({
  restaurantName: z.string().min(2, { message: "اسم المطعم يجب أن يتكون من حرفين على الأقل." }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [currentRestaurantName, setCurrentRestaurantName] = useState<string>('');
  const [isLoadingName, startLoadingNameTransition] = useTransition();
  const [isUpdatingName, startUpdatingNameTransition] = useTransition();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      restaurantName: '',
    },
  });

  useEffect(() => {
    startLoadingNameTransition(async () => {
      try {
        const name = await getRestaurantNameAction();
        setCurrentRestaurantName(name);
        form.reset({ restaurantName: name });
      } catch (error) {
        toast({
          title: 'خطأ في تحميل اسم المطعم',
          description: 'لم نتمكن من جلب اسم المطعم الحالي.',
          variant: 'destructive',
        });
      }
    });
  }, [toast, form]);

  const onSubmit = async (values: SettingsFormValues) => {
    startUpdatingNameTransition(async () => {
      try {
        const result = await updateRestaurantNameAction(values.restaurantName);
        if ('error' in result) {
          toast({
            title: 'خطأ في تحديث الاسم',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'نجاح!',
            description: `تم تحديث اسم المطعم إلى "${result.restaurantName}".`,
          });
          setCurrentRestaurantName(result.restaurantName);
          // The header will pick up the new name on next refresh/remount
        }
      } catch (error) {
        toast({
          title: 'خطأ في تحديث الاسم',
          description: 'حدث خطأ غير متوقع أثناء تحديث اسم المطعم.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 dir-rtl">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <SettingsIcon className="ms-2 h-6 w-6 text-primary" />
            إعدادات التطبيق
          </CardTitle>
          <CardDescription>
            قم بتعديل الإعدادات العامة لنظام نقاط البيع الخاص بك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingName ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ms-3 text-muted-foreground">جاري تحميل الإعدادات...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="restaurantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المطعم</FormLabel>
                      <FormControl>
                        <Input placeholder="ادخل اسم المطعم هنا" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isUpdatingName} className="w-full">
                  {isUpdatingName ? (
                    <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="ms-2 h-4 w-4" />
                  )}
                  {isUpdatingName ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
