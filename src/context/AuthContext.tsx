import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
  phone: string;
  authenticatedAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedSetup: boolean;
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  completeSetup: (language: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sentinel_auth_user';
const SETUP_STORAGE_KEY = 'sentinel_setup_complete';
const LANGUAGE_STORAGE_KEY = 'sentinel_language';

// Mock OTP code for development
const MOCK_OTP = '123456';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    const setupDone = localStorage.getItem(SETUP_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setHasCompletedSetup(setupDone === 'true');
    setIsLoading(false);
  }, []);

  const sendOTP = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    // Validate phone format (Indian: +91 followed by 10 digits)
    const cleaned = phone.replace(/\s/g, '');
    if (!/^\+91\d{10}$/.test(cleaned)) {
      return { success: false, error: 'Invalid phone number format. Use +91 XXXXX XXXXX' };
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In production, this would call Supabase auth.signInWithOtp
    // For now, mock success
    return { success: true };
  };

  const verifyOTP = async (phone: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock verification — accept '123456' as valid OTP
    if (otp !== MOCK_OTP) {
      return { success: false, error: 'Invalid verification code. Try 123456.' };
    }

    const authUser: AuthUser = {
      phone: phone.replace(/\s/g, ''),
      authenticatedAt: new Date().toISOString(),
    };

    setUser(authUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    return { success: true };
  };

  const completeSetup = (language: string) => {
    localStorage.setItem(SETUP_STORAGE_KEY, 'true');
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    setHasCompletedSetup(true);
  };

  const logout = () => {
    setUser(null);
    setHasCompletedSetup(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(SETUP_STORAGE_KEY);
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        hasCompletedSetup,
        sendOTP,
        verifyOTP,
        completeSetup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
