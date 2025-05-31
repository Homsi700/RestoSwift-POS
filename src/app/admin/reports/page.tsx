
'use client';

import React, { useState, useTransition } from 'react';
import { getDailySalesReport, getItemSalesCountReport } from '@/app/actions';
import type { DailySalesReportData, ItemSalesReportItem } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker'; // Import DatePicker
import { Loader2, BarChart3, AlertTriangle, CalendarDays } from 'lucide-react';
import { format } from "date-fns"
import { arEG } from "date-fns/locale"

export default function ReportsPage() {
  const [dailyReport, setDailyReport] = useState<DailySalesReportData | null>(null);
  const [itemSalesReport, setItemSalesReport] = useState<ItemSalesReportItem[]>([]);
  const [isLoadingDaily, startDailyTransition] = useTransition();
  const [isLoadingItems, startItemsTransition] = useTransition();
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [itemReportDateRange, setItemReportDateRange] = useState<string | null>(null);


  const handleFetchDailyReport = () => {
    setDailyError(null);
    setDailyReport(null); 
    startDailyTransition(async () => {
      try {
        const report = await getDailySalesReport();
        setDailyReport(report);
      } catch (error) {
        console.error("Failed to fetch daily report:", error);
        setDailyError("فشل تحميل التقرير اليومي. يرجى المحاولة مرة أخرى.");
      }
    });
  };

  const handleFetchItemSalesReport = () => {
    setItemsError(null);
    setItemSalesReport([]); 
    setItemReportDateRange(null);

    let startTimestamp: number | undefined = undefined;
    let endTimestamp: number | undefined = undefined;
    let rangeString = "لكل الأوقات";

    if (startDate) {
      startTimestamp = new Date(startDate.setHours(0, 0, 0, 0)).getTime();
      rangeString = `من ${format(startDate, "PPP", { locale: arEG })}`;
    }
    if (endDate) {
      endTimestamp = new Date(endDate.setHours(23, 59, 59, 999)).getTime();
      if (startDate) {
        rangeString += ` إلى ${format(endDate, "PPP", { locale: arEG })}`;
      } else {
        rangeString = `حتى ${format(endDate, "PPP", { locale: arEG })}`;
      }
    }
    
    // Ensure if one date is set, the other is also considered (or make it more flexible)
    // For now, if only one is set, it might not work as intended by action, or might need action adjustment
    // Let's enforce both or none for now for simplicity with current action logic
    if ((startDate && !endDate) || (!startDate && endDate)) {
        setItemsError("يرجى تحديد تاريخ البدء والانتهاء معًا، أو ترك كليهما فارغين لتقرير شامل.");
        return;
    }


    startItemsTransition(async () => {
      try {
        const report = await getItemSalesCountReport(startTimestamp, endTimestamp);
        setItemSalesReport(report);
        if (startTimestamp || endTimestamp) {
          setItemReportDateRange(rangeString);
        } else {
          setItemReportDateRange("لكل الأوقات (بدون تحديد تاريخ)");
        }
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
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return 'تاريخ غير صالح';

    try {
        const date = new Date(year, month - 1, day);
        return new Intl.DateTimeFormat('ar-EG', { 
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
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl font-semibold font-headline flex items-center">
                <CalendarDays className="ms-2 h-6 w-6 text-primary" />
                ملخص المبيعات لليوم الحالي
              </CardTitle>
              <Button onClick={handleFetchDailyReport} disabled={isLoadingDaily} className="w-full sm:w-auto">
                {isLoadingDaily && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {isLoadingDaily ? 'جاري التحميل...' : 'عرض تقرير اليوم'}
              </Button>
            </div>
            {dailyReport?.date && <CardDescription className="text-sm text-muted-foreground mt-2">التقرير لتاريخ: {formatDateForDisplay(dailyReport.date)}</CardDescription>}
            <CardDescription className="text-xs text-muted-foreground mt-1">
              ملاحظة: هذا التقرير يعرض إجمالي المبيعات لكامل اليوم الحالي حتى لحظة طلبه.
            </CardDescription>
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
              <p className="text-muted-foreground text-center py-5">الرجاء الضغط على زر "عرض تقرير اليوم" لتحميل البيانات.</p>
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 items-end">
              <div className="space-y-1">
                <label htmlFor="startDate" className="text-sm font-medium text-muted-foreground">من تاريخ</label>
                <DatePicker date={startDate} setDate={setStartDate} placeholder="تاريخ البدء" />
              </div>
              <div className="space-y-1">
                <label htmlFor="endDate" className="text-sm font-medium text-muted-foreground">إلى تاريخ</label>
                <DatePicker date={endDate} setDate={setEndDate} placeholder="تاريخ الانتهاء" />
              </div>
              <Button onClick={handleFetchItemSalesReport} disabled={isLoadingItems} className="w-full sm:w-auto self-end">
                {isLoadingItems && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {isLoadingItems ? 'جاري التحميل...' : 'عرض تقرير الكميات'}
              </Button>
            </div>
             {itemReportDateRange && <CardDescription className="mt-3 text-sm text-muted-foreground">التقرير لـ: {itemReportDateRange}</CardDescription>}
             <CardDescription className="mt-1 text-xs text-muted-foreground">
                اترك حقول التاريخ فارغة لعرض تقرير شامل لكل الأوقات.
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
                  <TableCaption>قائمة الأصناف وإجمالي الكميات المباعة {itemReportDateRange ? `(${itemReportDateRange})` : '(لكل الأوقات)'}.</TableCaption>
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
               !isLoadingItems && itemReportDateRange && <p className="text-muted-foreground text-center py-10">لا توجد بيانات مبيعات للأصناف خلال الفترة المحددة.</p>
            )}
             { !isLoadingItems && !itemsError && itemSalesReport.length === 0 && !itemReportDateRange && (
                 <p className="text-muted-foreground text-center py-10">الرجاء الضغط على زر "عرض تقرير الكميات" لتحميل البيانات.</p>
             )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
