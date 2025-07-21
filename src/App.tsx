// src/App.tsx - Main Application Component
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { PropertyListPage } from './pages/PropertyListPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { BookingPage } from './pages/BookingPage';
import { PaymentPage } from './pages/PaymentPage';
import { OwnerDashboard } from './pages/owner/Dashboard';
import { OwnerProperties } from './pages/owner/Properties';
import { OwnerBookings } from './pages/owner/Bookings';
import { OwnerMessages } from './pages/owner/Messages';
import { OwnerEarnings } from './pages/owner/Earnings';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import './globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/properties" element={<PropertyListPage />} />
                <Route path="/properties/:id" element={<PropertyDetailPage />} />
                <Route path="/book/:id" element={<BookingPage />} />
                <Route path="/payment/:bookingId" element={<PaymentPage />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Owner Protected Routes */}
                <Route path="/owner" element={
                  <ProtectedRoute>
                    <OwnerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/owner/properties" element={
                  <ProtectedRoute>
                    <OwnerProperties />
                  </ProtectedRoute>
                } />
                <Route path="/owner/bookings" element={
                  <ProtectedRoute>
                    <OwnerBookings />
                  </ProtectedRoute>
                } />
                <Route path="/owner/messages" element={
                  <ProtectedRoute>
                    <OwnerMessages />
                  </ProtectedRoute>
                } />
                <Route path="/owner/earnings" element={
                  <ProtectedRoute>
                    <OwnerEarnings />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

// src/contexts/AuthContext.tsx - Authentication Context
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phoneNumber: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  const register = async (email: string, password: string, fullName: string, phoneNumber: string) => {
    const response = await authService.register(email, password, fullName, phoneNumber);
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// src/services/authService.ts - Authentication Service
class AuthService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/owner/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  }

  async register(email: string, password: string, fullName: string, phoneNumber: string) {
    const response = await fetch(`${this.baseUrl}/auth/owner/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName, phoneNumber }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user data');
    }

    return response.json();
  }
}

export const authService = new AuthService();

// src/services/propertyService.ts - Property Service
export interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  nightly_price: number;
  cleaning_fee: number;
  extra_guest_fee: number;
  pet_fee: number;
  amenities: string[];
  house_rules: string[];
  guest_requirements: string[];
  images: string[];
  average_rating: number;
  total_reviews: number;
  status: string;
  owner_name: string;
}

class PropertyService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  async getProperties(filters?: {
    location?: string;
    start_date?: string;
    end_date?: string;
    guests?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const response = await fetch(`${this.baseUrl}/properties?${params}`);
    if (!response.ok) throw new Error('Failed to fetch properties');
    return response.json();
  }

  async getProperty(id: string) {
    const response = await fetch(`${this.baseUrl}/properties/${id}`);
    if (!response.ok) throw new Error('Failed to fetch property');
    return response.json();
  }

  async getBookedDates(propertyId: string) {
    const response = await fetch(`${this.baseUrl}/properties/${propertyId}/booked-dates`);
    if (!response.ok) throw new Error('Failed to fetch booked dates');
    return response.json();
  }

  async createProperty(propertyData: FormData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/properties`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: propertyData,
    });

    if (!response.ok) throw new Error('Failed to create property');
    return response.json();
  }
}

export const propertyService = new PropertyService();

// src/services/bookingService.ts - Booking Service
export interface BookingData {
  property_id: number;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  guests: number;
  special_requests?: string;
}

class BookingService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  async createBooking(bookingData: BookingData) {
    const response = await fetch(`${this.baseUrl}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }

    return response.json();
  }

  async getBookings() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  }

  async getBooking(id: string) {
    const response = await fetch(`${this.baseUrl}/bookings/${id}`);
    if (!response.ok) throw new Error('Failed to fetch booking');
    return response.json();
  }
}

export const bookingService = new BookingService();

// src/components/layout/Header.tsx - Header Component
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-sea-dark">
          SaStays
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/properties" className="text-gray-700 hover:text-sea-dark">
            Properties
          </Link>
          {user && (
            <Link to="/owner" className="text-gray-700 hover:text-sea-dark">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{user.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/owner')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// src/pages/HomePage.tsx - Home Page Component
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-sea-light to-sea-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Discover Amazing Places to Stay
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Find the perfect accommodation for your next getaway. From cozy apartments to luxury villas.
          </p>
          <Button size="lg" asChild className="bg-white text-sea-dark hover:bg-gray-100">
            <Link to="/properties">
              Start Exploring
            </Link>
          </Button>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Find Your Perfect Stay</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Where to?"
                      className="flex-1 outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      placeholder="Check-in"
                      className="flex-1 outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      placeholder="Check-out"
                      className="flex-1 outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Users className="w-5 h-5 text-gray-400" />
                    <select className="flex-1 outline-none">
                      <option>1 Guest</option>
                      <option>2 Guests</option>
                      <option>3 Guests</option>
                      <option>4+ Guests</option>
                    </select>
                  </div>
                </div>
                <Button className="w-full mt-4" size="lg">
                  <Search className="w-5 h-5 mr-2" />
                  Search Properties
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SaStays?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-sea-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-sea-dark" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                <p className="text-gray-600">
                  Simple and secure booking process with instant confirmation
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-sea-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-sea-dark" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
                <p className="text-gray-600">
                  Handpicked properties in the best locations across South Africa
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-sea-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-sea-dark" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600">
                  Round-the-clock customer support for a worry-free experience
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};