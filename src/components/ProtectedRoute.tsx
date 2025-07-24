import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { owner, isLoading } = useAuth();

  if (isLoading) {
    // You can add a loading spinner here
    return <div>Loading...</div>;
  }

  if (!owner) {
    // User not logged in, redirect to login page
    return <Navigate to="/owner-login" replace />;
  }

  // User is authenticated, so render the child components
  return <>{children}</>;
};

export default ProtectedRoute;