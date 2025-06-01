
'use client';

import Link from 'next/link';
import { Utensils, BarChartBig, Settings, LogOut, UserCircle, CreditCard, DollarSign, Building } from 'lucide-react'; // Added icons
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { currentUser, logout, restaurantName } = useAuth();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
          { currentUser && currentUser.role === 'admin' ? <Building size={28}/> : <Utensils size={28} /> }
          <h1 className="text-2xl font-headline font-bold">{restaurantName}</h1>
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
              </>
            )}
          </nav>

          <ThemeToggle />

          {currentUser ? (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <UserCircle size={20} />
                  {currentUser.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Mobile Navigation Links */}
                <div className="md:hidden">
                    <DropdownMenuItem asChild>
                        <Link href="/" className="w-full">نقطة البيع</Link>
                    </DropdownMenuItem>
                    {currentUser.role === 'admin' && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/menu" className="w-full">إدارة القائمة</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/reports" className="w-full">التقارير</Link>
                            </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                                <Link href="/admin/expenses" className="w-full">المصاريف</Link>
                            </DropdownMenuItem>
                        </>
                    )}
                    <DropdownMenuSeparator />
                </div>
                {currentUser.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="flex items-center gap-2">
                      <Settings size={16} />
                      الإعدادات
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut size={16} />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
