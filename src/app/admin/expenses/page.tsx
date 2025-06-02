
'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  addExpenseAction,
  getExpensesAction,
  deleteExpenseAction,
} from '@/app/actions';
import type { Expense } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, PlusCircle, Filter, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { arEG } from 'date-fns/locale';

const expenseFormSchema = z.object({
  description: z.string().min(2, { message: 'الوصف يجب أن يتكون من حرفين على الأقل.' }),
  amount: z.coerce.number().positive({ message: 'المبلغ يجب أن يكون رقمًا موجبًا.' }),
  category: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, startLoadingTransition] = useTransition();
  const [isMutating, startMutationTransition] = useTransition();
  const [isDeleting, startDeletingTransition] = useTransition();

  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);
  const [currentFilterString, setCurrentFilterString] = useState<string>("لكل الأوقات");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: '',
    },
  });

  const fetchExpenses = React.useCallback(async (start?: number, end?: number) => {
    startLoadingTransition(async () => {
      try {
        const fetchedExpenses = await getExpensesAction(start, end);
        setExpenses(fetchedExpenses);

        let rangeString = "لكل الأوقات";
        if (start && end) {
            rangeString = `من ${format(new Date(start), "PPP", { locale: arEG })} إلى ${format(new Date(end), "PPP", { locale: arEG })}`;
        } else if (start) {
            rangeString = `من ${format(new Date(start), "PPP", { locale: arEG })}`;
        } else if (end) {
            rangeString = `حتى ${format(new Date(end), "PPP", { locale: arEG })}`;
        }
        setCurrentFilterString(rangeString);

      } catch (error) {
        toast({
          title: 'خطأ في تحميل المصاريف',
          description: 'فشل تحميل قائمة المصاريف.',
          variant: 'destructive',
        });
      }
    });
  }, [toast]);

  React.useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleFilterSubmit = () => {
    let startTimestamp: number | undefined = undefined;
    let endTimestamp: number | undefined = undefined;

    if (filterStartDate) {
      startTimestamp = new Date(filterStartDate.setHours(0, 0, 0, 0)).getTime();
    }
    if (filterEndDate) {
      endTimestamp = new Date(filterEndDate.setHours(23, 59, 59, 999)).getTime();
    }
    if (startTimestamp && endTimestamp && startTimestamp > endTimestamp) {
        toast({ title: "خطأ في التاريخ", description: "تاريخ البدء لا يمكن أن يكون بعد تاريخ الانتهاء.", variant: "destructive" });
        return;
    }
    fetchExpenses(startTimestamp, endTimestamp);
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    startMutationTransition(async () => {
      try {
        const newExpense = await addExpenseAction(values);
        setExpenses((prev) => [newExpense, ...prev]); // Add to top and re-sort if needed or rely on fetchExpenses to re-sort
        form.reset();
        toast({
          title: 'نجاح!',
          description: `تمت إضافة مصروف "${newExpense.description}" بنجاح.`,
        });
        // Optionally refetch all if sorting is critical or list is paginated
        handleFilterSubmit(); // Refetch with current filters to maintain sort order
      } catch (error) {
        toast({
          title: 'خطأ في إضافة المصروف',
          description: 'فشل إضافة المصروف الجديد.',
          variant: 'destructive',
        });
      }
    });
  };

  const openDeleteDialog = (id: string) => {
    setDeletingExpenseId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingExpenseId) return;
    startDeletingTransition(async () => {
      try {
        const result = await deleteExpenseAction(deletingExpenseId);
        if (result.success) {
          setExpenses((prev) => prev.filter((exp) => exp.id !== deletingExpenseId));
          toast({
            title: 'نجاح!',
            description: 'تم حذف المصروف بنجاح.',
          });
        } else {
          toast({
            title: 'خطأ في الحذف',
            description: result.message || 'فشل حذف المصروف.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'خطأ في الحذف',
          description: 'حدث خطأ غير متوقع أثناء الحذف.',
          variant: 'destructive',
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setDeletingExpenseId(null);
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY', { style: 'currency', currency: 'SYP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "PPP HH:mm", { locale: arEG });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 dir-rtl space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <DollarSign className="ms-2 h-6 w-6 text-primary" />
            إدارة المصاريف
          </CardTitle>
          <CardDescription>
            قم بإضافة وتتبع مصاريف مطعمك من هنا.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>وصف المصروف</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: فاتورة كهرباء شهر مايو" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المبلغ (ل.س)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="مثال: 50000" {...field} />
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
                        <Input placeholder="مثال: فواتير، مشتريات" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isMutating} className="w-full md:w-auto">
                {isMutating ? (
                  <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="ms-2 h-4 w-4" />
                )}
                {isMutating ? 'جاري الإضافة...' : 'إضافة مصروف جديد'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">قائمة المصاريف</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 items-end">
            <div className="space-y-1 flex-grow">
              <Label htmlFor="startDate">من تاريخ</Label>
              <DatePicker date={filterStartDate} setDate={setFilterStartDate} placeholder="تاريخ البدء" />
            </div>
            <div className="space-y-1 flex-grow">
              <Label htmlFor="endDate">إلى تاريخ</Label>
              <DatePicker date={filterEndDate} setDate={setFilterEndDate} placeholder="تاريخ الانتهاء" />
            </div>
            <Button onClick={handleFilterSubmit} disabled={isLoading} className="w-full sm:w-auto">
              <Filter className="ms-2 h-4 w-4" />
              تصفية المصاريف
            </Button>
          </div>
           <CardDescription className="mt-2 text-sm text-muted-foreground">
            عرض المصاريف لـ: {currentFilterString}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ms-3 text-muted-foreground">جاري تحميل المصاريف...</p>
            </div>
          ) : expenses.length > 0 ? (
            <Table>
              <TableCaption>قائمة بجميع المصاريف المسجلة.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">الوصف</TableHead>
                  <TableHead className="text-center">المبلغ</TableHead>
                  <TableHead className="text-center">الفئة</TableHead>
                  <TableHead className="text-center min-w-[150px]">التاريخ والوقت</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell className="text-center">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell className="text-center">{expense.category || '-'}</TableCell>
                    <TableCell className="text-center">{formatDate(expense.date)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(expense.id)}
                        disabled={isDeleting && deletingExpenseId === expense.id}
                        className="text-destructive hover:text-destructive/80"
                      >
                        {isDeleting && deletingExpenseId === expense.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-10">
              لا توجد مصاريف مسجلة {currentFilterString !== "لكل الأوقات" ? "خلال الفترة المحددة" : "حتى الآن"}.
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
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="ms-2 h-4 w-4 animate-spin"/> : <Trash2 className="ms-2 h-4 w-4" />}
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

