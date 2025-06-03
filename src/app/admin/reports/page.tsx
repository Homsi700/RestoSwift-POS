
'use client';

import React, { useState, useTransition } from 'react';
import { getDailySalesReport, getItemSalesCountReport } from '@/app/actions';
import type { DailySalesReportData, ItemSalesReportItem } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2, BarChart3, AlertTriangle, CalendarDays, Printer, FileDown } from 'lucide-react';
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

  const printDailyReport = (report: DailySalesReportData | null) => {
    if (!report) return;
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>تقرير المبيعات اليومي</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: 'Cairo', 'PT Sans', sans-serif; direction: rtl; padding: 20px; }
        h1 { text-align: center; color: #D9534F; margin-bottom: 20px; }
        .report-details { border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .report-details p { margin: 8px 0; font-size: 16px; }
        .report-details strong { color: #333; }
        @media print {
          body { padding: 10mm; }
          .no-print { display: none; }
        }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write('<h1>تقرير المبيعات اليومي</h1>');
      printWindow.document.write('<div class="report-details">');
      printWindow.document.write(`<p><strong>تاريخ التقرير:</strong> ${formatDateForDisplay(report.date)}</p>`);
      printWindow.document.write(`<p><strong>إجمالي المبيعات:</strong> ${formatCurrency(report.totalSales)}</p>`);
      printWindow.document.write(`<p><strong>عدد الفواتير:</strong> ${report.numberOfInvoices}</p>`);
      printWindow.document.write('</div>');
      printWindow.document.write('<p class="no-print" style="text-align:center;">يمكنك إغلاق هذه النافذة بعد الطباعة.</p>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 250);
    }
  };

  const printItemSalesReport = (items: ItemSalesReportItem[], range: string | null) => {
    if (items.length === 0) return;
    const printWindow = window.open('', '_blank', 'height=800,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>تقرير كميات الأصناف المباعة</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: 'Cairo', 'PT Sans', sans-serif; direction: rtl; padding: 20px; }
        h1 { text-align: center; color: #D9534F; margin-bottom: 10px; }
        p.date-range { text-align: center; margin-bottom: 20px; font-size: 14px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
        th { background-color: #f9f9f9; font-weight: bold; }
        @media print {
          body { padding: 10mm; }
          .no-print { display: none; }
        }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write('<h1>تقرير كميات الأصناف المباعة</h1>');
      if (range) {
        printWindow.document.write(`<p class="date-range">الفترة: ${range}</p>`);
      }
      printWindow.document.write('<table><thead><tr><th>اسم الصنف</th><th>الكمية المباعة</th></tr></thead><tbody>');
      items.forEach(item => {
        printWindow.document.write(`<tr><td>${item.itemName}</td><td style="text-align:center;">${item.quantitySold}</td></tr>`);
      });
      printWindow.document.write('</tbody></table>');
      printWindow.document.write('<p class="no-print" style="text-align:center; margin-top: 20px;">يمكنك إغلاق هذه النافذة بعد الطباعة.</p>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 250);
    }
  };

  const exportItemSalesReportToCSV = (items: ItemSalesReportItem[], range: string | null) => {
    if (items.length === 0) return;
    const headers = ["اسم الصنف", "الكمية المباعة"];
    const csvRows = [
      headers.join(','),
      ...items.map(item => `${item.itemName.replace(/,/g, ';')},${item.quantitySold}`)
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Adding BOM for Excel
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const dateSuffix = range ? `_${range.replace(/ /g, '_').replace(/:/g, '-')}` : `_all_time`;
    link.setAttribute('download', `تقرير_مبيعات_الاصناف${dateSuffix}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={handleFetchDailyReport} disabled={isLoadingDaily} className="w-full sm:w-auto">
                  {isLoadingDaily && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                  {isLoadingDaily ? 'جاري التحميل...' : 'عرض تقرير اليوم'}
                </Button>
                <Button onClick={() => printDailyReport(dailyReport)} disabled={!dailyReport || isLoadingDaily} variant="outline" className="w-full sm:w-auto">
                  <Printer className="ms-2 h-4 w-4" />
                  طباعة التقرير
                </Button>
              </div>
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
             <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button onClick={() => printItemSalesReport(itemSalesReport, itemReportDateRange)} disabled={itemSalesReport.length === 0 || isLoadingItems} variant="outline" className="w-full sm:w-auto">
                  <Printer className="ms-2 h-4 w-4" />
                  طباعة تقرير الأصناف
                </Button>
                <Button onClick={() => exportItemSalesReportToCSV(itemSalesReport, itemReportDateRange)} disabled={itemSalesReport.length === 0 || isLoadingItems} variant="outline" className="w-full sm:w-auto">
                  <FileDown className="ms-2 h-4 w-4" />
                  تصدير إلى CSV
                </Button>
              </div>
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

  