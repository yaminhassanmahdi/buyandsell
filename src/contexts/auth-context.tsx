
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
    // On initial load, if there's a currentUser in localStorage,
    // ensure its data (especially nested objects like withdrawalMethods)
    // is correctly synchronized with the MOCK_USERS source if they logged in before.
    // This is more relevant if MOCK_USERS could change structure or if we want to ensure consistency.
    // For now, we trust useLocalStorage's initial load.
    setLoading(false);
  }, []);

  const login = async (email: string, _pass: string): Promise<User | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const userFromMock = MOCK_USERS.find(u => u.email === email);
    if (userFromMock) {
      // When logging in, ensure we're using the definitive version from MOCK_USERS
      // This helps if MOCK_USERS was updated elsewhere (e.g. admin panel direct modification - though not implemented)
      // or if the structure of User object in MOCK_USERS changed.
      // Also ensures that arrays like withdrawalMethods are fresh.
      const userToStore: User = {
        ...userFromMock, // Base data from MOCK_USERS
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

  const updateCurrentUserData = (updatedData: Partial<Pick<User, 'name' | 'email' | 'defaultShippingAddress' | 'withdrawalMethods'>>) => {
    if (currentUser) {
      const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        // Create the updated user object
        const updatedUserInMock = { 
          ...MOCK_USERS[userIndex], 
          ...updatedData 
        };
        
        // Ensure withdrawalMethods is always an array, even if updatedData.withdrawalMethods is undefined
        if (updatedData.withdrawalMethods !== undefined) {
            updatedUserInMock.withdrawalMethods = updatedData.withdrawalMethods;
        } else {
            updatedUserInMock.withdrawalMethods = MOCK_USERS[userIndex].withdrawalMethods || [];
        }
        
        // Ensure defaultShippingAddress can be set to null
        if (updatedData.hasOwnProperty('defaultShippingAddress')) {
             updatedUserInMock.defaultShippingAddress = updatedData.defaultShippingAddress;
        } else {
            updatedUserInMock.defaultShippingAddress = MOCK_USERS[userIndex].defaultShippingAddress || null;
        }

        MOCK_USERS[userIndex] = updatedUserInMock; // Update the "database"
        setCurrentUser(updatedUserInMock); // Update local storage and context state
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
