
'use client';

import React from 'react';
// import { useAuth } from '@/context/AuthContext'; // Removed useAuth
// import { useRouter } from 'next/navigation'; // Removed useRouter
// import { Loader2 } from 'lucide-react'; // Removed Loader2

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { currentUser, isLoading } = useAuth(); // Removed useAuth
  // const router = useRouter(); // Removed useRouter

  // useEffect(() => {
  //   if (!isLoading) {
  //     if (!currentUser || currentUser.role !== 'admin') {
  //       router.push('/login');
  //     }
  //   }
  // }, [currentUser, isLoading, router]);

  // if (isLoading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-screen w-full">
  //       <Loader2 className="h-12 w-12 animate-spin text-primary" />
  //       <p className="mt-4 rtl:mr-4 text-lg text-muted-foreground">جاري التحقق من المصادقة...</p>
  //     </div>
  //   );
  // }

  // if (!currentUser || currentUser.role !== 'admin') {
  //   return null; 
  // }
  
  // No protection, just render children directly
  return <div className="w-full">{children}</div>;
}
