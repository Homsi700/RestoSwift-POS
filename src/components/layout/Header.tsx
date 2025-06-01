
'use client';

import Link from 'next/link';
import { Utensils, BarChartBig } from 'lucide-react'; 
import { ThemeToggle } from '@/components/ThemeToggle';
// import { useAuth } from '@/context/AuthContext'; // Removed useAuth
import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

export default function Header() {
  // const { currentUser, logout, restaurantName } = useAuth(); // Removed useAuth usage
  const restaurantName = "ريستو سويفت POS"; // Static name for now

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
          <Utensils size={28} />
          <h1 className="text-2xl font-headline font-bold">{restaurantName}</h1>
        </Link>
        
        <div className="flex items-center gap-3 md:gap-4">
          <nav className="flex items-center gap-3 md:gap-5">
            <Link href="/" className="text-foreground hover:text-accent transition-colors font-medium text-sm md:text-base">
              نقطة البيع
            </Link>
            {/* Always show admin links for now, as auth is removed */}
            <Link href="/admin/menu" className="text-foreground hover:text-accent transition-colors font-medium text-sm md:text-base">
              إدارة القائمة
            </Link>
            <Link href="/admin/reports" className="text-foreground hover:text-accent transition-colors font-medium text-sm md:text-base flex items-center">
              <BarChartBig size={18} className="ms-1 md:ms-2 order-last md:order-first" /> 
              التقارير
            </Link>
            {/* Link to expenses removed as the page is removed */}
          </nav>

          <ThemeToggle />

          {/* Auth-related UI removed */}
          {/* {currentUser ? ( ... ) : ( <Button asChild variant="outline"> <Link href="/login">تسجيل الدخول</Link> </Button> )} */}
        </div>
      </div>
    </header>
  );
}
