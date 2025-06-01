
'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction, getRestaurantNameAction, type User as DbUser, type AppSettings } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

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

const defaultAuthContextValue: AuthContextType = {
  currentUser: null,
  isLoading: true, // Start as true, will be false after initial check
  login: async () => false,
  logout: () => {},
  restaurantName: "ريستو سويفت POS",
  fetchRestaurantName: async () => {},
  setRestaurantNameState: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false); // Tracks completion of localStorage check
  const [isRestaurantNameLoading, setIsRestaurantNameLoading] = useState(true);
  const [isProcessingAuthAction, startAuthActionTransition] = useTransition(); // For login/logout server actions

  const [restaurantName, setRestaurantName] = useState<string>(defaultAuthContextValue.restaurantName);
  const router = useRouter();
  const { toast } = useToast();

  const fetchRestaurantName = useCallback(async () => {
    setIsRestaurantNameLoading(true);
    try {
      const name = await getRestaurantNameAction();
      setRestaurantName(name);
    } catch (error) {
      console.error("Failed to fetch restaurant name:", error);
      setRestaurantName(prev => prev || defaultAuthContextValue.restaurantName);
    } finally {
      setIsRestaurantNameLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setIsAuthCheckComplete(true); // Mark initial auth check as complete
  }, []);

  useEffect(() => {
    fetchRestaurantName();
  }, [fetchRestaurantName]);

  const login = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    return new Promise((resolve) => {
      startAuthActionTransition(async () => {
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
          await fetchRestaurantName(); 
          if (result.role === 'admin') {
            router.push('/admin/menu');
          } else {
            router.push('/');
          }
          resolve(true);
        }
      });
    });
  }, [router, toast, fetchRestaurantName]);

  const logout = useCallback(() => {
    startAuthActionTransition(() => {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      router.push('/login');
      toast({ title: "تم تسجيل الخروج بنجاح" });
    });
  }, [router, toast]);

  const setRestaurantNameState = (name: string) => {
    setRestaurantName(name);
  };

  // isLoading is true if initial auth check isn't complete OR restaurant name is loading OR an auth action is processing
  const isLoading = !isAuthCheckComplete || isRestaurantNameLoading || isProcessingAuthAction;

  const contextValue = {
    currentUser,
    isLoading,
    login,
    logout,
    restaurantName,
    fetchRestaurantName,
    setRestaurantNameState,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
