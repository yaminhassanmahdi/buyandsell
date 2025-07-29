"use client";
import type { User, ShippingAddress, WithdrawalMethod } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';

// Define a type for the result of signInWithGoogle to indicate if phone number is needed
export type GoogleSignInResult = {
  user: User | null;
  needsPhoneNumber?: boolean;
  googleEmail?: string; // Email from Google to link if phone number is provided later
  error?: string;
};

interface AuthContextType {
  currentUser: User | null;
  login: (identifier: string, pass: string, loginType: 'email' | 'phone') => Promise<User | null>;
  logout: () => void;
  register: (name: string, phoneNumber: string, password: string, email?: string) => Promise<User | null>;
  updateCurrentUserData: (updatedData: Partial<Pick<User, 'name' | 'email' | 'phoneNumber' | 'defaultShippingAddress' | 'withdrawalMethods' | 'isAwaitingPhoneNumber' | 'googleEmail'>>) => void;
  signInWithGoogle: () => Promise<GoogleSignInResult | null>;
  completeGoogleSignInWithPhoneNumber: (googleEmail: string, phoneNumber: string) => Promise<User | null>;
  clearPendingGoogleUser: () => void;
  updateEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  updatePhoneNumber: (newPhoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  pendingGoogleUserEmail: string | null; // Store email of user needing phone number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [loading, setLoading] = useState(true);
  const [pendingGoogleUserEmail, setPendingGoogleUserEmail] = useLocalStorage<string | null>('pendingGoogleUserEmail', null);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string, loginType: 'email' | 'phone'): Promise<User | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userToStore: User = data.user;
        setCurrentUser(userToStore);
        setLoading(false);
        return userToStore;
      } else {
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return null;
    }
  };

  const register = async (name: string, phoneNumber: string, password: string, email?: string): Promise<User | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phoneNumber, password, email }),
      });

      if (response.ok) {
        const data = await response.json();
        const newUser: User = data.user;
        setCurrentUser(newUser);
        setLoading(false);
        return newUser;
      } else {
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      return null;
    }
  };

  const signInWithGoogle = async (): Promise<GoogleSignInResult | null> => {
    setLoading(true);
    // Google OAuth is not implemented in this demo
    // In a real app, you would integrate with Google OAuth
    setLoading(false);
    return { user: null, error: "Google Sign-In not implemented in demo" };
  };

  const completeGoogleSignInWithPhoneNumber = async (googleEmailToLink: string, phoneNumber: string): Promise<User | null> => {
    setLoading(true);
    // Google OAuth completion is not implemented in this demo
    setLoading(false);
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    setPendingGoogleUserEmail(null);
    router.push('/');
  };

  const updateCurrentUserData = async (dataToUpdate: Partial<User>) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...dataToUpdate };
      
      // If updating shipping address, save to database
      if (dataToUpdate.defaultShippingAddress) {
        // Save to database asynchronously
        fetch(`/api/users/${prevUser.id}/shipping-address`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToUpdate.defaultShippingAddress),
        }).catch(error => {
          console.error('Error saving shipping address:', error);
        });
      }
      
      // If updating withdrawal methods, save to database
      if (dataToUpdate.withdrawalMethods) {
        // Save to database asynchronously
        fetch(`/api/users/${prevUser.id}/withdrawal-methods`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToUpdate.withdrawalMethods),
        }).catch(error => {
          console.error('Error saving withdrawal methods:', error);
        });
      }
      
      return updatedUser;
    });
  };
  
  const clearPendingGoogleUser = () => {
    setPendingGoogleUserEmail(null);
  };

  const updateEmail = async (newEmail: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: "Not authenticated." };
    // In a real app, this would check the database and update the user
    // For now, we'll just update the local state
    updateCurrentUserData({ email: newEmail });
    return { success: true };
  };

  const updatePhoneNumber = async (newPhoneNumber: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: "Not authenticated." };
    // In a real app, this would check the database and update the user
    // For now, we'll just update the local state
    updateCurrentUserData({ phoneNumber: newPhoneNumber });
    return { success: true };
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: "Not authenticated." };
    // In a real app, this would involve re-hashing and saving the new password.
    // For this mock, we just acknowledge the change conceptually.
    console.log(`Password for user ${currentUser.id} conceptually updated.`);
    return { success: true };
  };

  const isAuthenticated = !!currentUser && !currentUser.isAwaitingPhoneNumber;
  const isAdmin = !!currentUser?.isAdmin && !currentUser.isAwaitingPhoneNumber;

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        login, 
        logout, 
        register, 
        updateCurrentUserData, 
        signInWithGoogle,
        completeGoogleSignInWithPhoneNumber,
        clearPendingGoogleUser,
        updateEmail,
        updatePhoneNumber,
        updatePassword,
        loading, 
        isAuthenticated, 
        isAdmin,
        pendingGoogleUserEmail 
    }}>
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

    