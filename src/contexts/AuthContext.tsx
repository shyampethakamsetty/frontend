import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { nhost } from '@/lib/apollo-client';
import type { User } from '@/types/graphql';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Retry configuration
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const retryOperation = async (
    operation: () => Promise<any>,
    retries: number = MAX_RETRIES
  ): Promise<any> => {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        console.warn(`Operation failed, retrying... (${retries} attempts left)`);
        await delay(RETRY_DELAY);
        return retryOperation(operation, retries - 1);
      }
      throw error;
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      console.log('Checking authentication status...');
      
      // Check if we have a valid session
      const session = nhost.auth.getSession();
      console.log('Session found:', !!session);
      
      if (session) {
        // Check if the session is still valid
        const isAuthenticated = nhost.auth.isAuthenticated();
        console.log('Is authenticated:', isAuthenticated);
        
        if (isAuthenticated) {
          try {
            const userData = await nhost.auth.getUser();
            console.log('User data retrieved:', !!userData);
            
            if (userData) {
              const user: User = {
                id: userData.id,
                email: userData.email || '',
                displayName: userData.displayName || undefined,
                avatarUrl: userData.avatarUrl || undefined,
                createdAt: userData.createdAt || new Date().toISOString(),
              };
              setUser(user);
              console.log('User set successfully:', user.email);
            }
          } catch (userError) {
            console.error('Failed to get user data:', userError);
            // If we can't get user data, the session might be invalid
            await nhost.auth.signOut();
            setUser(null);
          }
        } else {
          console.log('Session exists but not authenticated, clearing user');
          setUser(null);
        }
      } else {
        console.log('No session found, user is not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear any stale auth data
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    console.log('AuthProvider mounted, checking auth...');
    checkAuth();

    // Listen for auth state changes
    const unsubscribe = nhost.auth.onAuthStateChanged(async (event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      try {
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, getting user data...');
          const userData = await nhost.auth.getUser();
          if (userData) {
            const user: User = {
              id: userData.id,
              email: userData.email || '',
              displayName: userData.displayName || undefined,
              avatarUrl: userData.avatarUrl || undefined,
              createdAt: userData.createdAt || new Date().toISOString(),
            };
            setUser(user);
            console.log('User signed in successfully:', user.email);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing user data');
          setUser(null);
        } else if (String(event) === 'TOKEN_REFRESHED') {
          console.log('Token refreshed, re-checking auth');
          await checkAuth();
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (event === 'SIGNED_IN') {
          // If we can't get user data after sign in, sign out
          console.log('Failed to get user data after sign in, signing out');
          await nhost.auth.signOut();
        }
      }
    });

    // Listen for token changes
    const tokenUnsubscribe = nhost.auth.onTokenChanged((session) => {
      console.log('Token changed:', !!session);
      if (session) {
        // Token was refreshed, re-check authentication
        checkAuth();
      }
    });

    return () => {
      unsubscribe();
      tokenUnsubscribe();
    };
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    setIsLoading(true);
    try {
      const { error } = await retryOperation(() => 
        nhost.auth.signIn({
          email,
          password,
        })
      );

      if (error) {
        console.error('Login error from Nhost:', error);
        throw new Error(error.message);
      }
      
      console.log('Login successful for:', email);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    console.log('Attempting signup for:', email);
    setIsLoading(true);
    try {
      const { error } = await retryOperation(() => 
        nhost.auth.signUp({
          email,
          password,
          options: {
            displayName: displayName || email,
          },
        })
      );

      if (error) {
        console.error('Signup error from Nhost:', error);
        throw new Error(error.message);
      }
      
      console.log('Signup successful for:', email);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('Attempting logout');
    setIsLoading(true);
    try {
      await retryOperation(() => nhost.auth.signOut());
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    console.log('Refreshing authentication');
    try {
      await checkAuth();
    } catch (error) {
      console.error('Auth refresh error:', error);
    }
  };

  // Log current state for debugging
  useEffect(() => {
    console.log('Auth state updated:', {
      user: user ? { id: user.id, email: user.email } : null,
      isAuthenticated: !!user,
      isLoading,
      isInitialized,
    });
  }, [user, isLoading, isInitialized]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      isInitialized,
      login,
      signup,
      logout,
      refreshAuth,
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