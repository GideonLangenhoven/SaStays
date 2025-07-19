// File: src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export interface Owner {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_image_url?: string;
  email_verified: boolean;
  phone_verified: boolean;
}

interface AuthContextType {
  owner: Owner | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateOwner: (data: Partial<Owner>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Add request interceptor to include auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchOwnerProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchOwnerProfile = async () => {
    try {
      const response = await axios.get('/auth/profile');
      setOwner(response.data.owner);
    } catch (error) {
      console.error('Failed to fetch owner profile:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, owner } = response.data;
      
      localStorage.setItem('auth_token', token);
      setOwner(owner);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await axios.post('/auth/register', data);
      const { token, owner } = response.data;
      
      localStorage.setItem('auth_token', token);
      setOwner(owner);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setOwner(null);
  };

  const updateOwner = async (data: Partial<Owner>) => {
    try {
      const response = await axios.put('/auth/profile', data);
      setOwner(response.data.owner);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <AuthContext.Provider value={{
      owner,
      isLoading,
      login,
      register,
      logout,
      updateOwner
    }}>
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