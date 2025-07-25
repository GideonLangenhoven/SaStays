import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = ['owner', 'co-host'] }) => {
  const { user, owner, isLoading } = useAuth();

  if (isLoading) {
    // You can add a loading spinner here
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }

  if (!user) {
    // User not logged in, redirect to login page
    return <Navigate to="/owner-login" replace />;
  }

  // Check if user has the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User doesn't have permission, redirect to appropriate page
    if (user.role === 'guest') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/owner-login" replace />;
  }

  // User is authenticated and has the required role, so render the child components
  return <>{children}</>;
};

export default ProtectedRoute;