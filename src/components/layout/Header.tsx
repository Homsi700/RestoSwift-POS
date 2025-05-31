
'use client';

import Link from 'next/link';
import { Utensils } from 'lucide-react';
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
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-foreground hover:text-accent transition-colors font-medium">
              نقطة البيع
            </Link>
            <Link href="/admin/menu" className="text-foreground hover:text-accent transition-colors font-medium">
              إدارة القائمة
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
