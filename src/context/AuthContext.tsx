
'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction, getRestaurantNameAction, type User as DbUser, type AppSettings } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

// Define a cleaner User type for the context, excluding passwordHash
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'cashier';
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  logout: () => void;
  restaurantName: string;
  fetchRestaurantName: () => Promise<void>;
  setRestaurantNameState: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingAuth, startAuthTransition] = useTransition(); // General transition for login/logout
  const [restaurantName, setRestaurantName] = useState<string>("ريستو سويفت POS"); // Default
  const router = useRouter();
  const { toast } = useToast();

  const fetchRestaurantName = useCallback(async () => {
    try {
      const name = await getRestaurantNameAction();
      setRestaurantName(name);
    } catch (error) {
      console.error("Failed to fetch restaurant name:", error);
      // Keep default or last known name
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem('currentUser');
      }
    }
    fetchRestaurantName().finally(() => {
      setIsLoading(false);
    });
  }, [fetchRestaurantName]);

  const login = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    return new Promise((resolve) => {
      startAuthTransition(async () => {
        const result = await loginAction(usernameInput, passwordInput);
        if ('error' in result) {
          toast({ title: "خطأ في تسجيل الدخول", description: result.error, variant: "destructive" });
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
          resolve(false);
        } else {
          const userToStore: User = {
            id: result.id,
            username: result.username,
            role: result.role,
          };
          setCurrentUser(userToStore);
          localStorage.setItem('currentUser', JSON.stringify(userToStore));
          toast({ title: "تم تسجيل الدخول بنجاح", description: `مرحباً ${result.username}!` });
          if (result.role === 'admin') {
            router.push('/admin/menu');
          } else {
            router.push('/');
          }
          resolve(true);
        }
      });
    });
  }, [router, toast]);

  const logout = useCallback(() => {
    startAuthTransition(() => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        router.push('/login');
        toast({ title: "تم تسجيل الخروج بنجاح" });
    });
  }, [router, toast]);

  const setRestaurantNameState = (name: string) => {
    setRestaurantName(name);
  };

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        isLoading: isLoading || isProcessingAuth, 
        login, 
        logout, 
        restaurantName, 
        fetchRestaurantName, 
        setRestaurantNameState 
    }}>
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
