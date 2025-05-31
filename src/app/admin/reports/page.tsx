
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getDailySalesReport, getItemSalesCountReport } from '@/app/actions';
import type { DailySalesReportData, ItemSalesReportItem } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Loader2, BarChart3, FileText, AlertTriangle } from 'lucide-react';

export default function ReportsPage() {
  const [dailyReport, setDailyReport] = useState<DailySalesReportData | null>(null);
  const [itemSalesReport, setItemSalesReport] = useState<ItemSalesReportItem[]>([]);
  const [isLoadingDaily, startDailyTransition] = useTransition();
  const [isLoadingItems, startItemsTransition] = useTransition();
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);

  useEffect(() => {
    setDailyError(null);
    startDailyTransition(async () => {
      try {
        const report = await getDailySalesReport();
        setDailyReport(report);
      } catch (error) {
        console.error("Failed to fetch daily report:", error);
        setDailyError("فشل تحميل التقرير اليومي. يرجى المحاولة مرة أخرى.");
      }
    });
  }, []);

  const handleFetchItemSalesReport = () => {
    setItemsError(null);
    startItemsTransition(async () => {
      try {
        const report = await getItemSalesCountReport();
        setItemSalesReport(report);
      } catch (error) {
        console.error("Failed to fetch item sales report:", error);
        setItemsError("فشل تحميل تقرير مبيعات الأصناف. يرجى المحاولة مرة أخرى.");
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY', { style: 'currency', currency: 'SYP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const formatDateForDisplay = (dateString: string | undefined) => {
    if (!dateString) return 'غير محدد';
    // Assuming dateString is YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return 'تاريخ غير صالح';

    try {
        const date = new Date(year, month - 1, day); // Month is 0-indexed in JS Date
        return new Intl.DateTimeFormat('ar-EG', { // Using ar-EG for a common Arabic locale for date
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        }).format(date);
    } catch (e) {
        return 'تاريخ غير صالح';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 dir-rtl">
      <h1 className="text-3xl font-bold mb-8 text-primary font-headline text-center">تقارير المبيعات</h1>

      <section className="mb-10">
        <Card className="shadow-lg border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold font-headline flex items-center">
              <FileText className="ms-2 h-6 w-6 text-primary" />
              ملخص المبيعات اليومي
            </CardTitle>
            {dailyReport?.date && <CardDescription className="text-sm text-muted-foreground">لتاريخ: {formatDateForDisplay(dailyReport.date)}</CardDescription>}
          </CardHeader>
          <CardContent>
            {isLoadingDaily ? (
              <div className="flex items-center justify-center h-24 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ms-3">جاري تحميل التقرير اليومي...</p>
              </div>
            ) : dailyError ? (
                <div className="flex flex-col items-center justify-center h-24 text-destructive">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    <p>{dailyError}</p>
                </div>
            ) : dailyReport ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
                  <p className="text-base font-medium text-muted-foreground mb-1">إجمالي المبيعات</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(dailyReport.totalSales)}</p>
                </div>
                <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
                  <p className="text-base font-medium text-muted-foreground mb-1">عدد الفواتير</p>
                  <p className="text-3xl font-bold text-primary">{dailyReport.numberOfInvoices}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-5">لا توجد بيانات لعرضها للتقرير اليومي.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="shadow-lg border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-xl font-semibold font-headline flex items-center">
                  <BarChart3 className="ms-2 h-6 w-6 text-primary" />
                  تقرير كميات الأصناف المباعة
                </CardTitle>
                <Button onClick={handleFetchItemSalesReport} disabled={isLoadingItems} className="w-full sm:w-auto">
                  {isLoadingItems && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                  {isLoadingItems ? 'جاري التحميل...' : 'عرض تقرير الكميات (الكل)'}
                </Button>
            </div>
             <CardDescription className="mt-2 text-sm text-muted-foreground">
              يعرض هذا التقرير إجمالي الكميات المباعة لكل صنف منذ بداية تسجيل الطلبات.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingItems ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ms-3">جاري تحميل تقرير الأصناف...</p>
              </div>
            ) : itemsError ? (
                <div className="flex flex-col items-center justify-center h-40 text-destructive">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    <p>{itemsError}</p>
                </div>
            ) : itemSalesReport.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>قائمة الأصناف وإجمالي الكميات المباعة.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[70%] min-w-[200px]">اسم الصنف</TableHead>
                      <TableHead className="text-center min-w-[120px]">الكمية المباعة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemSalesReport.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell className="text-center">{item.quantitySold}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
               !isLoadingItems && <p className="text-muted-foreground text-center py-10">لم يتم إنشاء تقرير الأصناف بعد أو لا توجد بيانات مبيعات للأصناف.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
