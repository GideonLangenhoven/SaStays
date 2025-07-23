// src/App.tsx - Main Application Component
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppProvider } from './contexts/AppContextDemo';
import { I18nProvider } from './contexts/I18nContext';
import Index from './pages/Index'; // Home page
import Apartments from './pages/Apartments'; // Property list
import ApartmentPage from './pages/ApartmentPage'; // Property detail
import BookingPage from './pages/BookingPage'; // Booking page
import BookingConfirmation from './pages/BookingConfirmation'; // Booking confirmation
import Login from './pages/Login'; // Login page
import OwnerLogin from './pages/OwnerLogin'; // Owner login
import OwnerRegister from './pages/OwnerRegister'; // Owner register
import OwnerDashboard from './pages/OwnerDashboard'; // Owner dashboard
import PropertyManagement from './pages/PropertyManagement'; // Property management
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
      <I18nProvider>
        <AppProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/apartments" element={<Apartments />} />
                  <Route path="/properties" element={<Apartments />} />
                  <Route path="/apartments/:id" element={<ApartmentPage />} />
                  <Route path="/properties/:id" element={<ApartmentPage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/owner-login" element={<OwnerLogin />} />
                  <Route path="/owner-register" element={<OwnerRegister />} />
                  
                  {/* Owner Protected Routes */}
                  <Route path="/owner" element={
                    <ProtectedRoute>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/owner/properties" element={
                    <ProtectedRoute>
                      <PropertyManagement />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
            </div>
            <Toaster position="top-right" />
          </Router>
        </AppProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;