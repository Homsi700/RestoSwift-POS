
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addExpenseAction, getExpensesAction, deleteExpenseAction, type Expense } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
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
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusSquare, Trash2, CalendarDays, AlertTriangle, ListFilter } from 'lucide-react';
import { format } from "date-fns";
import { arEG } from "date-fns/locale";

const expenseFormSchema = z.object({
  description: z.string().min(3, { message: "الوصف يجب أن يتكون من 3 أحرف على الأقل." }),
  amount: z.coerce.number().positive({ message: "المبلغ يجب أن يكون رقمًا موجبًا." }),
  category: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, startLoadingTransition] = useTransition();
  const [isMutating, startMutationTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: '',
    },
  });

  const fetchExpenses = React.useCallback((start?: number, end?: number) => {
    setError(null);
    startLoadingTransition(async () => {
      try {
        const fetchedExpenses = await getExpensesAction(start, end);
        setExpenses(fetchedExpenses);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
        setError("فشل تحميل قائمة المصاريف. يرجى المحاولة مرة أخرى.");
        toast({ title: "خطأ", description: "فشل تحميل المصاريف.", variant: "destructive" });
      }
    });
  }, [toast]);

  useEffect(() => {
    fetchExpenses(); // Fetch all on initial load
  }, [fetchExpenses]);

  const handleFilterExpenses = () => {
    let startTimestamp: number | undefined = undefined;
    let endTimestamp: number | undefined = undefined;

    if (filterStartDate) {
      startTimestamp = new Date(filterStartDate.setHours(0, 0, 0, 0)).getTime();
    }
    if (filterEndDate) {
      endTimestamp = new Date(filterEndDate.setHours(23, 59, 59, 999)).getTime();
    }
    
    if (filterStartDate && filterEndDate && filterStartDate > filterEndDate) {
        toast({ title: "خطأ في التاريخ", description: "تاريخ البدء لا يمكن أن يكون بعد تاريخ الانتهاء.", variant: "destructive" });
        return;
    }

    fetchExpenses(startTimestamp, endTimestamp);
  };
  
  const handleClearFilters = () => {
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
    fetchExpenses(); // Fetch all expenses
  };

  const onSubmit: SubmitHandler<ExpenseFormValues> = async (data) => {
    startMutationTransition(async () => {
      try {
        const newExpense = await addExpenseAction(data);
        setExpenses(prev => [newExpense, ...prev].sort((a,b) => b.date - a.date)); // Add and re-sort
        toast({ title: "نجاح", description: `تم تسجيل المصروف "${newExpense.description}" بنجاح.` });
        form.reset();
      } catch (err) {
        console.error("Failed to add expense:", err);
        toast({ title: "خطأ", description: "فشل تسجيل المصروف.", variant: "destructive" });
      }
    });
  };

  const openDeleteDialog = (id: string) => {
    setDeletingExpenseId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingExpenseId) {
      startMutationTransition(async () => {
        try {
          const result = await deleteExpenseAction(deletingExpenseId);
          if (result.success) {
            setExpenses(prev => prev.filter(exp => exp.id !== deletingExpenseId));
            toast({ title: "نجاح", description: "تم حذف المصروف بنجاح." });
          } else {
            throw new Error(result.message || "Failed to delete expense");
          }
        } catch (err: any) {
          console.error("Failed to delete expense:", err);
          toast({ title: "خطأ", description: err.message || "فشل حذف المصروف.", variant: "destructive" });
        }
      });
    }
    setIsDeleteDialogOpen(false);
    setDeletingExpenseId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY', { style: 'currency', currency: 'SYP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "PPP HH:mm", { locale: arEG });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 dir-rtl space-y-8">
      <h1 className="text-3xl font-bold text-primary font-headline text-center">إدارة المصاريف</h1>

      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <PlusSquare size={24} className="text-primary" /> إضافة مصروف جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف المصروف</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: شراء أدوات تنظيف، فاتورة كهرباء" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المبلغ (ل.س)</FormLabel>
                      <FormControl>
                        <Input type="number" step="100" placeholder="مثال: 15000" {...field} />
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
                      <FormLabel>الفئة (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: تشغيل، صيانة، شخصي" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isMutating} className="w-full md:w-auto">
                {isMutating && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                إضافة المصروف
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-semibold font-headline flex items-center">
              <ListFilter className="ms-2 h-6 w-6 text-primary" />
              عرض المصاريف
            </CardTitle>
            {(isLoading || isMutating) && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
          </div>
          <CardDescription className="mt-2">
            يمكنك تصفية المصاريف حسب نطاق تاريخي محدد.
          </CardDescription>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 items-end">
              <div className="space-y-1">
                <label htmlFor="filterStartDate" className="text-sm font-medium text-muted-foreground">من تاريخ</label>
                <DatePicker date={filterStartDate} setDate={setFilterStartDate} placeholder="تاريخ البدء" />
              </div>
              <div className="space-y-1">
                <label htmlFor="filterEndDate" className="text-sm font-medium text-muted-foreground">إلى تاريخ</label>
                <DatePicker date={filterEndDate} setDate={setFilterEndDate} placeholder="تاريخ الانتهاء" />
              </div>
              <Button onClick={handleFilterExpenses} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                تطبيق الفلتر
              </Button>
              <Button onClick={handleClearFilters} variant="outline" disabled={isLoading || (!filterStartDate && !filterEndDate)} className="w-full sm:w-auto">
                مسح الفلتر
              </Button>
            </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ms-3">جاري تحميل المصاريف...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-destructive">
              <AlertTriangle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>قائمة المصاريف المسجلة.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">الوصف</TableHead>
                    <TableHead className="text-center min-w-[120px]">المبلغ</TableHead>
                    <TableHead className="text-center min-w-[150px]">التاريخ</TableHead>
                    <TableHead className="text-center min-w-[120px]">الفئة</TableHead>
                    <TableHead className="text-center">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell className="text-center">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell className="text-center">{formatDate(expense.date)}</TableCell>
                      <TableCell className="text-center">{expense.category || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => openDeleteDialog(expense.id)}
                          disabled={isMutating}
                          className="h-8 w-8"
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">حذف</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">
              لا توجد مصاريف مسجلة بعد، أو لا توجد مصاريف تطابق الفلتر الحالي.
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف هذا المصروف نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90" disabled={isMutating}>
              {isMutating && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
