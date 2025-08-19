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
      // Check if we have a valid session
      const session = nhost.auth.getSession();
      
      if (session) {
        // Check if the session is still valid
        const isAuthenticated = nhost.auth.isAuthenticated();
        
        if (isAuthenticated) {
          try {
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
            }
          } catch (userError) {
            console.error('Failed to get user data:', userError);
            // If we can't get user data, the session might be invalid
            await nhost.auth.signOut();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
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
    checkAuth();

    // Listen for auth state changes
    const unsubscribe = nhost.auth.onAuthStateChanged(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session) {
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
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (String(event) === 'TOKEN_REFRESHED') {
          await checkAuth();
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (event === 'SIGNED_IN') {
          // If we can't get user data after sign in, sign out
          await nhost.auth.signOut();
        }
      }
    });

    // Listen for token changes
    const tokenUnsubscribe = nhost.auth.onTokenChanged((session) => {
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
    setIsLoading(true);
    try {
      const { error } = await retryOperation(() => 
        nhost.auth.signIn({
          email,
          password,
        })
      );

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName?: string) => {
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
        throw new Error(error.message);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await retryOperation(() => nhost.auth.signOut());
      setUser(null);
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      await checkAuth();
    } catch (error) {
      console.error('Auth refresh error:', error);
    }
  };



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