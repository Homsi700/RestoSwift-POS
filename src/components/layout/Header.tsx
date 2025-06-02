
'use client';

import Link from 'next/link';
import { Utensils, BarChartBig, DollarSign, SettingsIcon, LogIn, LogOut, UserCircle } from 'lucide-react'; 
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useTransition } from 'react';
import { getRestaurantNameAction } from '@/app/actions';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function Header() {
  const [restaurantName, setRestaurantName] = useState("ريستو سويفت POS");
  const [isLoadingName, startLoadingNameTransition] = useTransition();
  const { currentUser, logout, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    const fetchName = async () => {
      startLoadingNameTransition(async () => {
        try {
          const name = await getRestaurantNameAction();
          setRestaurantName(name);
        } catch (error) {
          console.error("Failed to fetch restaurant name for header:", error);
        }
      });
    };
    fetchName();
  }, []);


  return (
    <header className="bg-card shadow-md sticky top-0 z-50" style={{ '--header-height': '80px' } as React.CSSProperties}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
          <Utensils size={28} />
          <h1 className="text-2xl font-headline font-bold">
            {isLoadingName ? "جاري التحميل..." : restaurantName}
          </h1>
        </Link>
        
        <div className="flex items-center gap-3 md:gap-4">
          <nav className="hidden md:flex items-center gap-3 md:gap-5">
            <Link href="/" className="text-foreground hover:text-accent transition-colors font-medium text-sm md:text-base">
              نقطة البيع
            </Link>
            {currentUser && currentUser.role === 'admin' && (
              <>
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
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthLoading ? (
              <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
                <Loader2 className="h-5 w-5 animate-spin" />
              </Button>
            ) : currentUser ? (
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3">
                    <UserCircle size={20} />
                    <span className="hidden sm:inline">{currentUser.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>حسابي ({currentUser.role})</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Mobile Nav Links */}
                  <div className="md:hidden">
                     <DropdownMenuItem asChild>
                       <Link href="/">نقطة البيع</Link>
                     </DropdownMenuItem>
                    {currentUser.role === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                           <Link href="/admin/menu">إدارة القائمة</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           <Link href="/admin/reports">التقارير</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           <Link href="/admin/expenses">المصاريف</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           <Link href="/admin/settings">الإعدادات</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                  </div>
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut size={16} className="ms-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline">
                <Link href="/login" className="flex items-center gap-1">
                  <LogIn size={18} />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
