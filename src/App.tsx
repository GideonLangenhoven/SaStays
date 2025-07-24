// src/App.tsx - Production-Ready SaStays Application
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { Loader2, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import { useToast } from './hooks/use-toast';
import './globals.css';

// Core Components (Non-lazy loaded for better UX)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationCenter } from './components/notifications/NotificationCenter';

// Lazy-loaded Pages for Performance Optimization
const Index = lazy(() => import('./pages/Index'));
const Apartments = lazy(() => import('./pages/Apartments'));
const ApartmentPage = lazy(() => import('./pages/ApartmentPage'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Amenities = lazy(() => import('./pages/Amenities'));
const Contact = lazy(() => import('./pages/Contact'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));
const RateYourStay = lazy(() => import('./pages/RateYourStay'));

// Authentication Pages
const Login = lazy(() => import('./pages/Login'));
const OwnerLogin = lazy(() => import('./pages/OwnerLogin'));
const OwnerRegister = lazy(() => import('./pages/OwnerRegister'));

// Owner Dashboard & Management
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const PropertyManagement = lazy(() => import('./pages/PropertyManagement'));
const PropertyCreateEdit = lazy(() => import('./pages/PropertyCreateEdit'));
const PropertyCreatedList = lazy(() => import('./pages/PropertyCreatedList'));
const OwnerInbox = lazy(() => import('./pages/OwnerInbox'));

// Advanced Owner Features
const GoogleCalendarSync = lazy(() => import('./pages/owner/GoogleCalendarSync'));
const EnhancedAnalytics = lazy(() => import('./pages/owner/EnhancedAnalytics'));
const EnhancedCommunication = lazy(() => import('./pages/owner/EnhancedCommunication'));
const CoHostingMultiProperty = lazy(() => import('./pages/owner/CoHostingMultiProperty'));

// Error & Utility Pages
const NotFound = lazy(() => import('./pages/NotFound'));

// React Query Configuration - Production Ready
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

// Enhanced Loading Component with Skeleton UI
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
    <div className="relative">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-primary/20" />
    </div>
    <div className="text-center space-y-2">
      <p className="text-lg font-medium text-foreground">{message}</p>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
      </div>
    </div>
  </div>
);

// Page Loading Skeleton
const PageSkeleton: React.FC = () => (
  <div className="min-h-screen">
    <div className="h-20 bg-muted animate-pulse" />
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="h-8 bg-muted rounded-lg animate-pulse w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

// Network Status Hook
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection restored",
        description: "You're back online!",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection lost",
        description: "Please check your internet connection",
        variant: "destructive",
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return isOnline;
};

// Network Status Banner
const NetworkStatusBanner: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2"
    >
      <div className="container mx-auto flex items-center justify-center space-x-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">No internet connection</span>
      </div>
    </motion.div>
  );
};

// Page Transition Wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced Error Boundary with Better UX
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error; errorInfo?: React.ErrorInfo }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // In production, send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-4">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
                <p className="text-muted-foreground">
                  We apologize for the inconvenience. Please try refreshing the page.
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Refresh Page
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Go to Homepage
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <details className="text-left mt-6">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-40">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component with Enhanced Architecture
function App() {
  const isOnline = useNetworkStatus();

  // Preload critical pages for better UX
  useEffect(() => {
    // Preload the most likely next pages
    const preloadPages = [
      () => import('./pages/Apartments'),
      () => import('./pages/BookingPage'),
      () => import('./pages/OwnerLogin'),
    ];

    const timer = setTimeout(() => {
      preloadPages.forEach(importFn => importFn().catch(() => {}));
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <Router>
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                {/* Network Status Banner */}
                <NetworkStatusBanner isOnline={isOnline} />
                
                {/* Navigation */}
                <Navbar />
                
                {/* Main Content with Page Transitions */}
                <main className="flex-1">
                  <Suspense fallback={<PageSkeleton />}>
                    <PageTransition>
                      <Routes>
                        {/* Public Routes - Guest Experience */}
                        <Route path="/" element={<Index />} />
                        <Route path="/home" element={<Navigate to="/" replace />} />
                        
                        {/* Property Discovery & Booking */}
                        <Route path="/apartments" element={<Apartments />} />
                        <Route path="/properties" element={<Navigate to="/apartments" replace />} />
                        <Route path="/apartments/:id" element={<ApartmentPage />} />
                        <Route path="/properties/:id" element={<Navigate to="/apartments/$1" replace />} />
                        
                        {/* Booking Flow */}
                        <Route path="/booking" element={<BookingPage />} />
                        <Route path="/booking/:propertyId" element={<BookingPage />} />
                        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                        <Route path="/booking-success" element={<Navigate to="/booking-confirmation" replace />} />
                        
                        {/* Post-Stay Experience */}
                        <Route path="/rate-your-stay" element={<RateYourStay />} />
                        <Route path="/review/:bookingId" element={<RateYourStay />} />
                        
                        {/* Information & Discovery */}
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/amenities" element={<Amenities />} />
                        <Route path="/facilities" element={<Navigate to="/amenities" replace />} />
                        <Route path="/contact" element={<Contact />} />
                        
                        {/* Guest Authentication */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/guest-login" element={<Navigate to="/login" replace />} />
                        
                        {/* Owner Authentication & Onboarding */}
                        <Route path="/owner-login" element={<OwnerLogin />} />
                        <Route path="/owner-register" element={<OwnerRegister />} />
                        <Route path="/owner-signup" element={<Navigate to="/owner-register" replace />} />
                        <Route path="/host-login" element={<Navigate to="/owner-login" replace />} />
                        <Route path="/host-register" element={<Navigate to="/owner-register" replace />} />
                        
                        {/* Owner Dashboard & Core Management */}
                        <Route path="/owner" element={
                          <ProtectedRoute>
                            <OwnerDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/dashboard" element={<Navigate to="/owner" replace />} />
                        <Route path="/owner/dashboard" element={<Navigate to="/owner" replace />} />
                        
                        {/* Property Management */}
                        <Route path="/owner/properties" element={
                          <ProtectedRoute>
                            <PropertyManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/owner/properties/new" element={
                          <ProtectedRoute>
                            <PropertyCreateEdit />
                          </ProtectedRoute>
                        } />
                        <Route path="/owner/properties/:id/edit" element={
                          <ProtectedRoute>
                            <PropertyCreateEdit />
                          </ProtectedRoute>
                        } />
                        <Route path="/owner/listings" element={
                          <ProtectedRoute>
                            <PropertyCreatedList />
                          </ProtectedRoute>
                        } />
                        
                        {/* Communication & Guest Management */}
                        <Route path="/owner/inbox" element={
                          <ProtectedRoute>
                            <OwnerInbox />
                          </ProtectedRoute>
                        } />
                        <Route path="/owner/messages" element={<Navigate to="/owner/inbox" replace />} />
                        <Route path="/owner/communication" element={
                          <ProtectedRoute>
                            <EnhancedCommunication />
                          </ProtectedRoute>
                        } />
                        
                        {/* Advanced Analytics & Insights */}
                        <Route path="/owner/analytics" element={
                          <ProtectedRoute>
                            <EnhancedAnalytics />
                          </ProtectedRoute>
                        } />
                        <Route path="/owner/reports" element={<Navigate to="/owner/analytics" replace />} />
                        <Route path="/owner/insights" element={<Navigate to="/owner/analytics" replace />} />
                        
                        {/* Calendar & Availability Management */}
                        <Route path="/owner/calendar" element={
                          <ProtectedRoute>
                            <GoogleCalendarSync />
                          </ProtectedRoute>
                        } />
                        <Route path="/owner/availability" element={<Navigate to="/owner/calendar" replace />} />
                        <Route path="/owner/calendar-sync" element={<Navigate to="/owner/calendar" replace />} />
                        
                        {/* Advanced Features */}
                        <Route path="/owner/co-hosting" element={
                          <ProtectedRoute>
                            <CoHostingMultiProperty />
                          </ProtectedRoute>
                        } />
                        <Route path="/owner/multi-property" element={<Navigate to="/owner/co-hosting" replace />} />
                        
                        {/* Settings & Preferences */}
                        <Route path="/owner/settings" element={
                          <ProtectedRoute>
                            <OwnerDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/owner/profile" element={<Navigate to="/owner/settings" replace />} />
                        <Route path="/owner/account" element={<Navigate to="/owner/settings" replace />} />
                        
                        {/* Legacy Route Redirects */}
                        <Route path="/properties-management" element={<Navigate to="/owner/properties" replace />} />
                        <Route path="/property-management" element={<Navigate to="/owner/properties" replace />} />
                        <Route path="/host" element={<Navigate to="/owner" replace />} />
                        <Route path="/host/*" element={<Navigate to="/owner" replace />} />
                        
                        {/* Error Handling */}
                        <Route path="/404" element={<NotFound />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </PageTransition>
                  </Suspense>
                </main>
                
                {/* Footer */}
                <Footer />
                
                {/* Global Notification System - Only for logged-in users */}
                {/* Notification Center will be shown conditionally based on auth status */}
                
                {/* Toast Notifications */}
                <Toaster 
                  position="top-right" 
                  toastOptions={{
                    duration: 4000,
                    className: "bg-card border border-border text-foreground",
                  }}
                />
              </div>
              
              {/* Development Tools */}
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools 
                  initialIsOpen={false} 
                  position="bottom-right" 
                />
              )}
            </Router>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;