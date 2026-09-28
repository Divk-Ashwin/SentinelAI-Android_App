import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser {
  id: string;
  phone: string;
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
const SETUP_STORAGE_KEY = 'sentinel_setup_complete';
const LANGUAGE_STORAGE_KEY = 'sentinel_language';

const toAuthUser = (u: User | null | undefined): AuthUser | null =>
  u ? { id: u.id, phone: (u.user_metadata?.phone as string) ?? '' } : null;

async function readError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      return body?.error ?? 'Request failed';
    } catch { /* fall through */ }
  }
  return 'Network error. Check your connection and try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(localStorage.getItem(SETUP_STORAGE_KEY) === 'true');

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(toAuthUser(session?.user));
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(toAuthUser(data.user));
      setIsLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const sendOTP = async (phone: string) => {
    const cleaned = phone.replace(/\s/g, '');
    if (!/^\+91\d{10}$/.test(cleaned)) return { success: false, error: 'Enter a valid number: +91 XXXXX XXXXX' };
    const { error } = await supabase.functions.invoke('phone-otp', { body: { action: 'send', phone: cleaned } });
    if (error) return { success: false, error: await readError(error) };
    return { success: true };
  };

  const verifyOTP = async (phone: string, otp: string) => {
    const cleaned = phone.replace(/\s/g, '');
    const { data, error } = await supabase.functions.invoke('phone-otp', { body: { action: 'verify', phone: cleaned, code: otp } });
    if (error) return { success: false, error: await readError(error) };
    const { error: vErr } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: 'magiclink' });
    if (vErr) return { success: false, error: 'Could not sign you in. Please try again.' };
    return { success: true };
  };

  const completeSetup = (language: string) => {
    localStorage.setItem(SETUP_STORAGE_KEY, 'true');
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    setHasCompletedSetup(true);
    if (user) supabase.from('profiles').update({ language }).eq('id', user.id).then(() => {});
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    setHasCompletedSetup(false);
    localStorage.removeItem(SETUP_STORAGE_KEY);
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, hasCompletedSetup, sendOTP, verifyOTP, completeSetup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
