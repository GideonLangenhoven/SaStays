// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type UserRole = 'guest' | 'owner' | 'cohost';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with actual API call to Supabase
      // For now, simulate login with localStorage
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'owner', // Default role, should come from backend
        createdAt: new Date(),
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      toast.success('Welcome back!');
      
      // Redirect based on role
      switch (mockUser.role) {
        case 'owner':
        case 'cohost':
          navigate('/dashboard');
          break;
        case 'guest':
          navigate('/');
          break;
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      // TODO: Replace with actual API call to Supabase
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role,
        createdAt: new Date(),
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      toast.success('Account created successfully!');
      
      // Redirect based on role
      switch (role) {
        case 'owner':
        case 'cohost':
          navigate('/dashboard/onboarding');
          break;
        case 'guest':
          navigate('/');
          break;
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}