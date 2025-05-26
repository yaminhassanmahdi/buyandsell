
"use client";
import type { User, ShippingAddress, WithdrawalMethod } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock-data';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<User | null>; // pass is unused for mock
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<User | null>; // pass is unused for mock
  updateCurrentUserData: (updatedData: Partial<Pick<User, 'defaultShippingAddress' | 'withdrawalMethods'>>) => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email: string, _pass: string): Promise<User | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setLoading(false);
      return user;
    }
    setLoading(false);
    return null;
  };

  const register = async (name: string, email: string, _pass: string): Promise<User | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      setLoading(false);
      return null; 
    }
    const newUser: User = { 
      id: `user${MOCK_USERS.length + 1}`, 
      email, 
      name, 
      isAdmin: false, 
      defaultShippingAddress: null, 
      withdrawalMethods: [] 
    };
    MOCK_USERS.push(newUser); 
    setCurrentUser(newUser);
    setLoading(false);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    router.push('/'); 
  };

  const updateCurrentUserData = (updatedData: Partial<Pick<User, 'defaultShippingAddress' | 'withdrawalMethods'>>) => {
    if (currentUser) {
      const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        const updatedUser = { ...MOCK_USERS[userIndex], ...updatedData };
        MOCK_USERS[userIndex] = updatedUser;
        setCurrentUser(updatedUser); // Update local storage and context state
      }
    }
  };
  
  const isAuthenticated = !!currentUser;
  const isAdmin = !!currentUser?.isAdmin;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, updateCurrentUserData, loading, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
