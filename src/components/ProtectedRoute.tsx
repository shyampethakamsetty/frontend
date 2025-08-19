import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - Auth state:', {
      isAuthenticated,
      isLoading,
      isInitialized,
    });

    if (isInitialized && !isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login...');
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, isInitialized, navigate]);

  // Show loading spinner while checking authentication
  if (isLoading || !isInitialized) {
    console.log('ProtectedRoute - Showing loading state');
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-foreground font-medium">
            {isLoading ? 'Checking authentication...' : 'Initializing...'}
          </span>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    console.log('ProtectedRoute - User not authenticated, not rendering children');
    return null;
  }

  // User is authenticated, render children
  console.log('ProtectedRoute - User authenticated, rendering children');
  return <>{children}</>;
}
