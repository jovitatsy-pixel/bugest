import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Profile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_DEMO_PROFILE } from '../lib/mockData';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (
    email: string,
    password: string,
    fullName: string,
    dailyBudget: number,
    monthlyBudget: number
  ) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'full_name' | 'daily_budget' | 'monthly_budget'>>) => Promise<{ error?: string }>;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILE_STORAGE_KEY = 'spendsmart_demo_profile';
const DEMO_USER_STORAGE_KEY = 'spendsmart_is_demo';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  const supabaseReady = isSupabaseConfigured();

  const loadDemoSession = useCallback(() => {
    const savedProfile = localStorage.getItem(DEMO_PROFILE_STORAGE_KEY);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        setUser({ id: parsed.id, email: parsed.email });
      } catch {
        setProfile(INITIAL_DEMO_PROFILE);
        setUser({ id: INITIAL_DEMO_PROFILE.id, email: INITIAL_DEMO_PROFILE.email });
      }
    } else {
      localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PROFILE));
      setProfile(INITIAL_DEMO_PROFILE);
      setUser({ id: INITIAL_DEMO_PROFILE.id, email: INITIAL_DEMO_PROFILE.email });
    }
    setIsDemo(true);
    localStorage.setItem(DEMO_USER_STORAGE_KEY, 'true');
  }, []);

  const fetchSupabaseProfile = useCallback(async (userId: string) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile fetch error:', error.message);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // Check if user was previously using Demo Mode
      const storedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (storedDemo === 'true' || !supabaseReady) {
        loadDemoSession();
        if (mounted) setLoading(false);
        return;
      }

      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser({ id: session.user.id, email: session.user.email });
            const prof = await fetchSupabaseProfile(session.user.id);
            if (mounted) {
              setProfile(prof || {
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || 'User',
                email: session.user.email || '',
                daily_budget: 500,
                monthly_budget: 15000,
                created_at: new Date().toISOString(),
              });
              setIsDemo(false);
            }
          }
        } catch (err) {
          console.error('Session check failed:', err);
        }
      }

      if (mounted) setLoading(false);
    }

    initAuth();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email });
            const prof = await fetchSupabaseProfile(session.user.id);
            setProfile(prof || {
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || 'User',
              email: session.user.email || '',
              daily_budget: 500,
              monthly_budget: 15000,
              created_at: new Date().toISOString(),
            });
            setIsDemo(false);
            localStorage.removeItem(DEMO_USER_STORAGE_KEY);
          } else if (!isDemo) {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [supabaseReady, loadDemoSession, fetchSupabaseProfile, isDemo]);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!supabaseReady || !supabase) {
      return { error: 'Supabase is not configured yet. You can click "Explore Demo Mode" below to try all features!' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };

      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        const prof = await fetchSupabaseProfile(data.user.id);
        if (prof) setProfile(prof);
        setIsDemo(false);
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during login.' };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    dailyBudget: number,
    monthlyBudget: number
  ): Promise<{ error?: string }> => {
    if (!supabaseReady || !supabase) {
      return { error: 'Supabase is not configured. Please add your credentials in .env or try Demo Mode.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            daily_budget: dailyBudget,
            monthly_budget: monthlyBudget,
          },
        },
      });

      if (error) return { error: error.message };

      if (data.user) {
        // In case trigger takes a moment or if we need an immediate profile insert:
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          daily_budget: dailyBudget,
          monthly_budget: monthlyBudget,
        });

        if (profileError) {
          console.warn('Manual profile upsert notice:', profileError.message);
        }

        setUser({ id: data.user.id, email: data.user.email });
        const prof = await fetchSupabaseProfile(data.user.id);
        setProfile(
          prof || {
            id: data.user.id,
            full_name: fullName,
            email,
            daily_budget: dailyBudget,
            monthly_budget: monthlyBudget,
            created_at: new Date().toISOString(),
          }
        );
        setIsDemo(false);
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during registration.' };
    }
  };

  const logout = async (): Promise<void> => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    setUser(null);
    setProfile(null);
    setIsDemo(false);
  };

  const loginAsDemo = () => {
    loadDemoSession();
  };

  const updateProfile = async (
    updates: Partial<Pick<Profile, 'full_name' | 'daily_budget' | 'monthly_budget'>>
  ): Promise<{ error?: string }> => {
    if (isDemo || !supabaseReady || !supabase) {
      if (!profile) return { error: 'No profile found' };
      const updated = { ...profile, ...updates };
      setProfile(updated);
      localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(updated));
      return {};
    }

    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) return { error: error.message };

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemo,
        isSupabaseConnected: supabaseReady,
        login,
        register,
        logout,
        updateProfile,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
