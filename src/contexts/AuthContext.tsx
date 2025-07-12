import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/supabaseClient'; // Import the Supabase client
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';

// Define the user role type as specified in the PFD
export type UserRole = 'guest' | 'owner' | 'co-host';

// Updated User interface to include profile data
export interface UserProfile {
  id: string;
  email?: string; // Email comes from the auth user
  name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // This effect runs once on mount to check for an existing session
  // and then listens for any authentication state changes (login, logout)
  useEffect(() => {
    // Check for the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        getProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          getProfile(session.user);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Helper function to fetch the user profile from our `profiles` table
  const getProfile = async (supabaseUser: SupabaseUser) => {
    try {
      setIsLoading(true);
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, role, avatar_url, phone`)
        .eq('id', supabaseUser.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        const userProfile: UserProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: data.full_name,
          role: data.role,
          avatar_url: data.avatar_url,
          phone: data.phone,
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Could not fetch user profile.');
    } finally {
      setIsLoading(false);
    }
  };


  // Login function now uses Supabase
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      throw error;
    }
    
    toast.success('Welcome back!');
    // The onAuthStateChange listener will handle fetching the profile and redirecting
  };

  // Register function now uses Supabase
  const register = async (email: string, password: string, name: string, role: UserRole) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // We pass the full_name and role in the `data` object
        // The SQL trigger we created will use this to populate the new profile
        data: {
          full_name: name,
          role: role,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('Account created! Please check your email to verify.');
    // In Supabase, users need to confirm their email by default.
    // After confirmation, they can log in.
  };

  // Logout function now uses Supabase
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      throw error;
    }
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully');
  };

  // Update profile function now uses Supabase
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    const profileData = {
        full_name: data.name,
        phone: data.phone,
        avatar_url: data.avatar_url,
        role: data.role,
    };

    const { error } = await supabase.from('profiles').update(profileData).eq('id', user.id);

    if (error) {
      toast.error(error.message);
      throw error;
    }

    // Refresh local user state
    setUser(prev => prev ? { ...prev, ...data } : null);
    toast.success('Profile updated successfully');
  };

  // The value provided to the context consumers
  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}