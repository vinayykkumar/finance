import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signUp, signOut, getCurrentUser, resetPassword, refreshSession, resetAuthState } from '../lib/auth-service';
import { User, AuthSession } from '../types';

interface AuthContextType {
  // Auth state
  user: User | null;
  session: AuthSession;
  isAuthenticated: boolean;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshSession: () => Promise<{ user: User | null; error: any }>;
  resetAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession>({
    user: null,
    session: null,
    isLoading: true
  });

  const isAuthenticated = !!user && !!session.session;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('AuthProvider: Initializing auth...');
      setSession(prev => ({ ...prev, isLoading: true }));
      
      const { user: currentUser, error } = await getCurrentUser();
      
      if (error) {
        console.error('AuthProvider: Error getting current user:', error);
        setUser(null);
        setSession({
          user: null,
          session: null,
          isLoading: false
        });
        return;
      }
      
      if (currentUser) {
        console.log('AuthProvider: User found:', currentUser.email);
        setUser(currentUser);
        setSession({
          user: currentUser,
          session: { user: currentUser }, // Mock session object
          isLoading: false
        });
      } else {
        console.log('AuthProvider: No user found');
        setUser(null);
        setSession({
          user: null,
          session: null,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('AuthProvider: Exception during auth initialization:', error);
      setUser(null);
      setSession({
        user: null,
        session: null,
        isLoading: false
      });
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Signing in user:', email);
      const result = await signIn(email, password);
      
      if (result.user && !result.error) {
        setUser(result.user);
        setSession({
          user: result.user,
          session: { user: result.user },
          isLoading: false
        });
      }
      
      return result;
    } catch (error) {
      console.error('AuthProvider: Sign in error:', error);
      return { user: null, error };
    }
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('AuthProvider: Signing up user:', email);
      const result = await signUp(email, password, fullName);
      
      if (result.user && !result.error) {
        setUser(result.user);
        setSession({
          user: result.user,
          session: { user: result.user },
          isLoading: false
        });
      }
      
      return result;
    } catch (error) {
      console.error('AuthProvider: Sign up error:', error);
      return { user: null, error };
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('AuthProvider: Signing out user');
      const result = await signOut();
      
      setUser(null);
      setSession({
        user: null,
        session: null,
        isLoading: false
      });
      
      return result;
    } catch (error) {
      console.error('AuthProvider: Sign out error:', error);
      return { error };
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      console.log('AuthProvider: Resetting password for:', email);
      return await resetPassword(email);
    } catch (error) {
      console.error('AuthProvider: Reset password error:', error);
      return { error };
    }
  };

  const handleRefreshSession = async () => {
    try {
      console.log('AuthProvider: Refreshing session');
      setSession(prev => ({ ...prev, isLoading: true }));
      
      const result = await refreshSession();
      
      if (result.user && !result.error) {
        setUser(result.user);
        setSession({
          user: result.user,
          session: { user: result.user },
          isLoading: false
        });
      } else {
        setUser(null);
        setSession({
          user: null,
          session: null,
          isLoading: false
        });
      }
      
      return result;
    } catch (error) {
      console.error('AuthProvider: Refresh session error:', error);
      setSession(prev => ({ ...prev, isLoading: false }));
      return { user: null, error };
    }
  };

  const handleResetAuthState = () => {
    try {
      console.log('AuthProvider: Resetting auth state');
      resetAuthState();
      setUser(null);
      setSession({
        user: null,
        session: null,
        isLoading: false
      });
      
      // Reload the page to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('AuthProvider: Error resetting auth state:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    refreshSession: handleRefreshSession,
    resetAuthState: handleResetAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}