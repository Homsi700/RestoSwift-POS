
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
    // Only attempt to redirect if loading is complete
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

  // After loading, if still not an admin (e.g., redirect is in progress or user is not admin),
  // return null to prevent rendering admin content.
  // The useEffect above should handle the redirect.
  if (!currentUser || currentUser.role !== 'admin') {
    return null; 
  }

  // Only render children if loading is complete AND user is an admin
  return <div className="w-full">{children}</div>;
}
