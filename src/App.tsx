// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { HomePage } from '@/pages/HomePage';
import { PropertyDetailsPage } from '@/pages/PropertyDetailsPage';
import { BookingPage } from '@/pages/BookingPage';
import { OwnerDashboard } from '@/pages/OwnerDashboard';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="sastays-theme">
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/property/:id" element={<PropertyDetailsPage />} />
                <Route path="/book/:propertyId" element={<BookingPage />} />
                <Route path="/payment/:bookingId" element={<PaymentPage />} />
                <Route path="/review/:bookingId" element={<ReviewPage />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Owner Routes */}
                <Route 
                  path="/dashboard/*" 
                  element={
                    <ProtectedRoute>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;