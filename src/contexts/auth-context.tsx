
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
  updateCurrentUserData: (updatedData: Partial<Pick<User, 'name' | 'email' | 'defaultShippingAddress' | 'withdrawalMethods'>>) => void;
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
    const userFromMock = MOCK_USERS.find(u => u.email === email);
    if (userFromMock) {
      const userToStore: User = {
        ...userFromMock,
        defaultShippingAddress: userFromMock.defaultShippingAddress || null,
        withdrawalMethods: userFromMock.withdrawalMethods || [],
      };
      setCurrentUser(userToStore);
      setLoading(false);
      return userToStore;
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

  const updateCurrentUserData = (dataToUpdate: Partial<Pick<User, 'name' | 'email' | 'defaultShippingAddress' | 'withdrawalMethods'>>) => {
    if (currentUser) {
      // Create the new state for `currentUser` based on its current value + updates
      // This ensures that if `dataToUpdate` is, e.g., just { defaultShippingAddress: ... },
      // other properties like `withdrawalMethods` from the current `currentUser` state are preserved.
      const newContextUser: User = {
        ...currentUser, // Start with the current state from context/localStorage
        ...dataToUpdate,  // Overlay the specific changes
      };

      // Now, update MOCK_USERS array (our "database" in this mock setup)
      const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        // MOCK_USERS[userIndex] should reflect the complete new state.
        MOCK_USERS[userIndex] = {
          ...MOCK_USERS[userIndex], // Preserve any fields in MOCK_USERS that might not be in User type (less likely here)
          ...newContextUser        // Ensure all fields from newContextUser are applied
        };
      }
      
      // This is the crucial call to update React state (via useLocalStorage) and persist to localStorage.
      // As newContextUser is a new object reference (due to the spread ...currentUser and ...dataToUpdate),
      // React's change detection should work.
      setCurrentUser(newContextUser);
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
