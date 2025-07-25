// File: src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_image_url?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  role: 'owner' | 'guest' | 'co-host';
  full_name?: string;
}

export interface Owner extends User {
  role: 'owner' | 'co-host';
}

interface AuthContextType {
  user: User | null;
  owner: Owner | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginOwner: (email: string, password: string) => Promise<void>;
  loginGuest: (email: string, password: string) => Promise<void>;
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
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
axios.defaults.baseURL = apiUrl;
console.log('Axios configured with baseURL:', apiUrl);

// Add request interceptor to include auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('owner_jwt');
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const owner = user && (user.role === 'owner' || user.role === 'co-host') ? user as Owner : null;

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
      setUser(response.data.user || response.data.owner);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const loginOwner = async (email: string, password: string) => {
    try {
      console.log('Attempting owner login with:', { email, baseURL: axios.defaults.baseURL });
      const response = await axios.post('/owner/login', { email, password });
      console.log('Owner login successful:', response.data.owner?.email);
      const { token, owner } = response.data;
      localStorage.setItem('auth_token', token);
      setUser({ ...owner, role: 'owner' });
      console.log('User state updated for owner:', owner.email);
    } catch (error: any) {
      console.error('Owner login failed:', error.message);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response from server:', error.request);
      }
      throw new Error(error.response?.data?.message || `Owner login failed: ${error.message}`);
    }
  };

  const loginGuest = async (email: string, password: string) => {
    try {
      console.log('Attempting guest login with:', { email, baseURL: axios.defaults.baseURL });
      const response = await axios.post('/auth/login', { email, password });
      console.log('Guest login successful:', response.data.user?.email);
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      setUser({ ...user, role: 'guest' });
      console.log('User state updated for guest:', user.email);
    } catch (error: any) {
      console.error('Guest login failed:', error.message);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response from server:', error.request);
      }
      throw new Error(error.response?.data?.message || `Guest login failed: ${error.message}`);
    }
  };

  const login = async (email: string, password: string) => {
    // Default behavior - try owner first, then guest
    try {
      await loginOwner(email, password);
    } catch (ownerError) {
      try {
        await loginGuest(email, password);
      } catch (guestError) {
        throw ownerError; // Throw the original owner error
      }
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await axios.post('/auth/register', data);
      const { token, owner, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      setUser(owner || user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const updateOwner = async (data: Partial<Owner>) => {
    try {
      const response = await axios.put('/auth/profile', data);
      setUser(response.data.owner || response.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      owner,
      isLoading,
      login,
      loginOwner,
      loginGuest,
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