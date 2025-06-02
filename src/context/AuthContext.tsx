
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { loginAction as performLoginAction } from '@/app/actions';
import type { LoginCredentials } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // True initially to check localStorage
  const [isProcessingAuth, startAuthTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved user in localStorage on initial load
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem('currentUser'); // Clear corrupted data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    startAuthTransition(async () => {
      try {
        const result = await performLoginAction(credentials);
        if (result.success && result.user) {
          setCurrentUser(result.user);
          localStorage.setItem('currentUser', JSON.stringify(result.user));
          toast({ title: 'نجاح', description: `مرحباً بك ${result.user.username}!` });
          router.push('/'); // Redirect to home or dashboard
        } else {
          toast({ title: 'خطأ في تسجيل الدخول', description: result.error || 'بيانات الاعتماد غير صحيحة.', variant: 'destructive' });
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error("Login error:", error);
        toast({ title: 'خطأ في النظام', description: 'حدث خطأ غير متوقع أثناء محاولة تسجيل الدخول.', variant: 'destructive' });
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      }
    });
  }, [router, toast]);

  const logout = useCallback(() => {
    startAuthTransition(() => {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      toast({ title: 'نجاح', description: 'تم تسجيل خروجك بنجاح.' });
      router.push('/login');
    });
  }, [router, toast]);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading: isLoading || isProcessingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
