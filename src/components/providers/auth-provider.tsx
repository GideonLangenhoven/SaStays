// src/components/providers/auth-provider.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Owner, Guest } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: Owner | Guest | null;
  userType: 'owner' | 'guest' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Owner | Guest>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Owner | Guest | null>(null);
  const [userType, setUserType] = useState<'owner' | 'guest' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
          setUserType(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Try to fetch from owners table first
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .select('*')
        .eq('id', userId)
        .single();

      if (ownerData && !ownerError) {
        setUserProfile(ownerData);
        setUserType('owner');
        return;
      }

      // If not found in owners, try guests table
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('id', userId)
        .single();

      if (guestData && !guestError) {
        setUserProfile(guestData);
        setUserType('guest');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile based on type
        const profileData = {
          id: data.user.id,
          email: data.user.email,
          ...userData,
          createdAt: new Date().toISOString(),
        };

        const tableName = userData.userType === 'owner' ? 'owners' : 'guests';
        
        const { error: profileError } = await supabase
          .from(tableName)
          .insert(profileData);

        if (profileError) throw profileError;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<Owner | Guest>) => {
    if (!user || !userType) return;

    try {
      const tableName = userType === 'owner' ? 'owners' : 'guests';
      
      const { error } = await supabase
        .from(tableName)
        .update({ ...data, updatedAt: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile
      await fetchUserProfile(user.id);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    userType,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};