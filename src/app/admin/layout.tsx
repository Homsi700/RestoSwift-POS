
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // For loading indicator

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth check is complete (isLoading is false)
    // AND (there's no current user OR the user is not an admin)
    // THEN redirect to login page.
    if (!isLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/login');
    }
  }, [currentUser, isLoading, router]); // Effect dependencies

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 rtl:mr-4 text-lg text-muted-foreground">جاري التحقق من المصادقة...</p>
      </div>
    );
  }

  // If, after loading, there's still no admin user,
  // the useEffect should have initiated a redirect.
  // Returning null here prevents rendering children if the redirect is pending or if something went wrong.
  if (!currentUser || currentUser.role !== 'admin') {
    return null; 
  }

  // If loading is false AND currentUser is an admin, render the children (admin page content)
  return <div className="w-full">{children}</div>;
}
