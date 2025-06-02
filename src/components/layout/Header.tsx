
'use client';

import Link from 'next/link';
import { Utensils, BarChartBig, DollarSign, SettingsIcon } from 'lucide-react'; 
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getRestaurantNameAction } from '@/app/actions';


export default function Header() {
  const [restaurantName, setRestaurantName] = useState("ريستو سويفت POS");
  const [isLoadingName, setIsLoadingName] = useState(true);

  useEffect(() => {
    const fetchName = async () => {
      try {
        setIsLoadingName(true);
        const name = await getRestaurantNameAction();
        setRestaurantName(name);
      } catch (error) {
        console.error("Failed to fetch restaurant name for header:", error);
        // Keep default name or set to a fallback
      } finally {
        setIsLoadingName(false);
      }
    };
    fetchName();
  }, []);


  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
          <Utensils size={28} />
          <h1 className="text-2xl font-headline font-bold">
            {isLoadingName ? "جاري التحميل..." : restaurantName}
          </h1>
        </Link>
        
        <div className="flex items-center gap-3 md:gap-4">
          <nav className="flex items-center gap-3 md:gap-5">
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
            <Link href="/admin/expenses" className="text-foreground hover:text-accent transition-colors font-medium text-sm md:text-base flex items-center">
              <DollarSign size={18} className="ms-1 md:ms-2 order-last md:order-first" />
              المصاريف
            </Link>
            <Link href="/admin/settings" className="text-foreground hover:text-accent transition-colors font-medium text-sm md:text-base flex items-center">
              <SettingsIcon size={18} className="ms-1 md:ms-2 order-last md:order-first" />
              الإعدادات
            </Link>
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
