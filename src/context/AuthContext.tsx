
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
  isLoading: boolean; // Combined loading state
  login: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  logout: () => void;
  restaurantName: string;
  fetchRestaurantName: () => Promise<void>;
  setRestaurantNameState: (name: string) => void; // For updating name from settings page
}

// Provide a default context value that matches the AuthContextType structure
// This helps prevent errors if a component tries to access the context before it's fully initialized.
const defaultAuthContextValue: AuthContextType = {
  currentUser: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  restaurantName: "ريستو سويفت POS", // Initial default
  fetchRestaurantName: async () => {},
  setRestaurantNameState: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Specific for auth operations
  const [isRestaurantNameLoading, setIsRestaurantNameLoading] = useState(true); // Specific for name fetching
  const [isProcessingAuth, startAuthTransition] = useTransition();
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
      // Keep default or last known name if already set, otherwise use the initial default
      setRestaurantName(prev => prev || defaultAuthContextValue.restaurantName);
    } finally {
      setIsRestaurantNameLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsAuthLoading(true);
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem('currentUser');
        setCurrentUser(null); // Ensure currentUser is null if parsing fails
      }
    } else {
        setCurrentUser(null); // Ensure currentUser is null if not in localStorage
    }
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    fetchRestaurantName();
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
          // Re-fetch restaurant name in case it was changed by another admin or process
          // Although, with the current setup, only this user can change it via settings.
          // But it's good practice if settings could be influenced externally.
          fetchRestaurantName(); 
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

  // Combined loading state
  const isLoading = isAuthLoading || isRestaurantNameLoading || isProcessingAuth;

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
  if (context === undefined) { // This check should ideally catch the issue
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
