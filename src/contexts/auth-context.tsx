
"use client";
import type { User } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock-data';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<User | null>; // pass is unused for mock
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<User | null>; // pass is unused for mock
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
    // Simulate loading user from storage or API
    setLoading(false);
  }, []);

  const login = async (email: string, _pass: string): Promise<User | null> => {
    setLoading(true);
    // Simulate API call
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
      return null; // User already exists
    }
    const newUser: User = { id: `user${MOCK_USERS.length + 1}`, email, name, isAdmin: false };
    MOCK_USERS.push(newUser); // In a real app, this would be an API call
    setCurrentUser(newUser);
    setLoading(false);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    router.push('/'); // Redirect to home after logout
  };
  
  const isAuthenticated = !!currentUser;
  const isAdmin = !!currentUser?.isAdmin;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, loading, isAuthenticated, isAdmin }}>
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
