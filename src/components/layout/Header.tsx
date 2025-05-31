
'use client';

import Link from 'next/link';
import { Utensils, BarChartBig } from 'lucide-react'; // Added BarChartBig for reports
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Header() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
          <Utensils size={28} />
          <h1 className="text-2xl font-headline font-bold">ريستو سويفت POS</h1>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-3 md:gap-6">
            <Link href="/" className="text-foreground hover:text-accent transition-colors font-medium text-sm md:text-base">
              نقطة البيع
            </Link>
            <Link href="/admin/menu" className="text-foreground hover:text-accent transition-colors font-medium text-sm md:text-base">
              إدارة القائمة
            </Link>
            <Link href="/admin/reports" className="text-foreground hover:text-accent transition-colors font-medium text-sm md:text-base flex items-center">
              <BarChartBig size={18} className="ms-1 md:ms-2 order-last md:order-first" /> 
              التقارير
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
