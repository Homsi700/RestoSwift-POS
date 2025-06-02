
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 rtl:mr-4 text-lg text-muted-foreground">جاري التحقق من المصادقة...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    // While redirecting, or if not admin, show nothing or a minimal loader/message.
    // router.push already initiated, so this helps prevent flashing content.
    return (
         <div className="flex flex-col items-center justify-center h-screen w-full">
            <Loader2 className="h-12 w-12 animate-spin text-destructive" />
            <p className="mt-4 rtl:mr-4 text-lg text-muted-foreground">إعادة التوجيه لتسجيل الدخول...</p>
        </div>
    );
  }
  
  // User is authenticated as admin
  return <div className="w-full">{children}</div>;
}
