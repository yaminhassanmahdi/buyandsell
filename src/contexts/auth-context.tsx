
"use client";
import type { User, ShippingAddress, WithdrawalMethod } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock-data';
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
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  pendingGoogleUserEmail: string | null; // Store email of user needing phone number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Google User for simulation
const MOCK_GOOGLE_USER = {
  email: 'new.googleuser@example.com',
  name: 'Google User New',
  // No phone number initially
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [loading, setLoading] = useState(true);
  const [pendingGoogleUserEmail, setPendingGoogleUserEmail] = useLocalStorage<string | null>('pendingGoogleUserEmail', null);
  const router = useRouter();

  useEffect(() => {
    // On initial load, if there's a pendingGoogleUserEmail and no currentUser,
    // it implies the user needs to complete phone registration.
    // The redirect to phone input page will be handled by the component calling signInWithGoogle.
    setLoading(false);
  }, []);

  const login = async (identifier: string, _pass: string, loginType: 'email' | 'phone'): Promise<User | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    let userFromMock: User | undefined;

    if (loginType === 'email') {
      userFromMock = MOCK_USERS.find(u => u.email === identifier);
    } else {
      userFromMock = MOCK_USERS.find(u => u.phoneNumber === identifier);
    }

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

  const register = async (name: string, phoneNumber: string, _pass: string, email?: string): Promise<User | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const existingUserByPhone = MOCK_USERS.find(u => u.phoneNumber === phoneNumber);
    if (existingUserByPhone) {
      setLoading(false);
      // console.error("Registration failed: Phone number already exists.");
      return null; // Or throw an error / return specific error code
    }
    if (email) {
      const existingUserByEmail = MOCK_USERS.find(u => u.email === email);
      if (existingUserByEmail) {
        setLoading(false);
        // console.error("Registration failed: Email already exists.");
        return null;
      }
    }

    const newUser: User = {
      id: `user${MOCK_USERS.length + 1}-${Date.now()}`,
      phoneNumber,
      email: email || undefined,
      name,
      isAdmin: false,
      defaultShippingAddress: null,
      withdrawalMethods: []
    };
    MOCK_USERS.push(newUser); // Add to our "database"
    setCurrentUser(newUser);
    setLoading(false);
    return newUser;
  };

  const signInWithGoogle = async (): Promise<GoogleSignInResult | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate Google providing user info
    const googleProvidedEmail = MOCK_GOOGLE_USER.email;
    const googleProvidedName = MOCK_GOOGLE_USER.name;

    const existingUser = MOCK_USERS.find(u => u.email === googleProvidedEmail);

    if (existingUser) {
      if (existingUser.phoneNumber) {
        // User exists and has a phone number, log them in
        setCurrentUser(existingUser);
        setPendingGoogleUserEmail(null);
        setLoading(false);
        return { user: existingUser, needsPhoneNumber: false };
      } else {
        // User exists but needs a phone number
        setPendingGoogleUserEmail(googleProvidedEmail); // Store email to link later
        setCurrentUser(null); // Ensure no one is logged in
        setLoading(false);
        return { user: existingUser, needsPhoneNumber: true, googleEmail: googleProvidedEmail };
      }
    } else {
      // New user via Google, needs phone number
      // Create a partial user entry (or prepare one)
      const newUserDraft: User = {
        id: `user-google-${Date.now()}`,
        email: googleProvidedEmail,
        name: googleProvidedName,
        phoneNumber: '', // Placeholder, to be filled
        isAdmin: false,
        defaultShippingAddress: null,
        withdrawalMethods: [],
        isAwaitingPhoneNumber: true, // Flag this state
        googleEmail: googleProvidedEmail,
      };
      // Don't add to MOCK_USERS yet, or add with a flag, until phone is provided.
      // For this mock, we'll store the email and prompt for phone.
      setPendingGoogleUserEmail(googleProvidedEmail);
      setCurrentUser(null);
      setLoading(false);
      return { user: newUserDraft, needsPhoneNumber: true, googleEmail: googleProvidedEmail };
    }
  };

  const completeGoogleSignInWithPhoneNumber = async (googleEmailToLink: string, phoneNumber: string): Promise<User | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const existingUserByPhone = MOCK_USERS.find(u => u.phoneNumber === phoneNumber);
    if (existingUserByPhone && existingUserByPhone.email !== googleEmailToLink) {
        // Phone number is already taken by a different account
        setLoading(false);
        console.error("Phone number already associated with another account.");
        return null; 
    }

    let userToUpdate = MOCK_USERS.find(u => u.email === googleEmailToLink);

    if (userToUpdate) {
      // User found by Google email, update their phone number
      userToUpdate.phoneNumber = phoneNumber;
      userToUpdate.isAwaitingPhoneNumber = false;
    } else {
      // This case implies signInWithGoogle didn't pre-create a user.
      // Let's assume MOCK_GOOGLE_USER for name if no partial user was made.
      userToUpdate = {
        id: `user-google-${Date.now()}`,
        email: googleEmailToLink,
        name: MOCK_GOOGLE_USER.name, // Or fetch name from Google again
        phoneNumber: phoneNumber,
        isAdmin: false,
        defaultShippingAddress: null,
        withdrawalMethods: [],
        isAwaitingPhoneNumber: false,
      };
      MOCK_USERS.push(userToUpdate);
    }
    
    setCurrentUser(userToUpdate);
    setPendingGoogleUserEmail(null); // Clear pending state
    setLoading(false);
    return userToUpdate;
  };


  const logout = () => {
    setCurrentUser(null);
    setPendingGoogleUserEmail(null); // Clear any pending Google user state on logout
    router.push('/');
  };

  const updateCurrentUserData = (dataToUpdate: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...dataToUpdate };
      setCurrentUser(updatedUser);
      const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...updatedUser };
      }
    } else if (pendingGoogleUserEmail && dataToUpdate.phoneNumber) {
        // This case is for updating a pending Google user (who isn't currentUser yet)
        // This might be better handled by completeGoogleSignInWithPhoneNumber
        let userInMock = MOCK_USERS.find(u => u.email === pendingGoogleUserEmail);
        if (userInMock) {
            userInMock.phoneNumber = dataToUpdate.phoneNumber;
            userInMock.isAwaitingPhoneNumber = false;
            // Log them in now
            setCurrentUser(userInMock);
            setPendingGoogleUserEmail(null);
        } else {
            // If user wasn't pre-created in MOCK_USERS
            const newUserFromGoogle: User = {
                id: `user-google-${Date.now()}`,
                email: pendingGoogleUserEmail,
                name: dataToUpdate.name || 'Google User', // Name might not be in dataToUpdate here
                phoneNumber: dataToUpdate.phoneNumber,
                isAdmin: false,
                defaultShippingAddress: null,
                withdrawalMethods: [],
                isAwaitingPhoneNumber: false,
            };
            MOCK_USERS.push(newUserFromGoogle);
            setCurrentUser(newUserFromGoogle);
            setPendingGoogleUserEmail(null);
        }
    }
  };
  
  const clearPendingGoogleUser = () => {
    setPendingGoogleUserEmail(null);
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
