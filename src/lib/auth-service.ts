import { supabase } from './supabase';
import { User } from '../types';

// Constants for localStorage
const FINTRACK_SESSION_KEY = 'fintrack-session';

// Sign up with email and password
export async function signUp(email: string, password: string, fullName: string): Promise<{ user: User | null; error: any }> {
  try {
    console.log('auth-service: Attempting to sign up user:', email);
    
    // Clear any existing session data first
    localStorage.removeItem(FINTRACK_SESSION_KEY);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error('auth-service: Sign up error:', error);
      throw error;
    }

    console.log('auth-service: Sign up successful, user data:', data?.user ? 'exists' : 'null');

    // Create default user settings upon signup
    if (data?.user) {
      await createDefaultUserSettings(data.user.id);
      
      // Store session info in localStorage for backup
      if (data.session) {
        storeSessionBackup(data.session);
      }
    }

    return { 
      user: data?.user ? mapToUser(data.user) : null, 
      error: null 
    };
  } catch (error) {
    console.error('auth-service: Error signing up:', error);
    return { user: null, error };
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
  try {
    console.log('auth-service: Attempting to sign in user:', email);
    
    // Clear any existing session data first
    localStorage.removeItem(FINTRACK_SESSION_KEY);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('auth-service: Sign in error:', error);
      throw error;
    }

    console.log('auth-service: Sign in successful, session:', data?.session ? 'exists' : 'null');
    
    // Store session info in localStorage for backup
    if (data?.session) {
      storeSessionBackup(data.session);
    }

    return { 
      user: data?.user ? mapToUser(data.user) : null, 
      error: null 
    };
  } catch (error) {
    console.error('auth-service: Error signing in:', error);
    return { user: null, error };
  }
}

// Sign out
export async function signOut(): Promise<{ error: any }> {
  try {
    console.log('auth-service: Signing out user');
    
    // Clear our backup session data
    localStorage.removeItem(FINTRACK_SESSION_KEY);
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('auth-service: Sign out error:', error);
      throw error;
    }
    
    console.log('auth-service: User signed out successfully');
    return { error: null };
  } catch (error) {
    console.error('auth-service: Error signing out:', error);
    return { error };
  }
}

// Get the current user
export async function getCurrentUser(): Promise<{ user: User | null; error: any }> {
  try {
    console.log('auth-service: Fetching current user');
    
    // First try the official Supabase method
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('auth-service: Error getting current user from Supabase:', error);
      
      // If official method fails, try to use our backup
      console.log('auth-service: Attempting to recover from backup session');
      const backupSession = getSessionBackup();
      
      if (backupSession) {
        console.log('auth-service: Found backup session, attempting to use it');
        
        // Try setting the session and getting user again
        const { data: refreshData, error: refreshError } = await supabase.auth.setSession({
          access_token: backupSession.access_token,
          refresh_token: backupSession.refresh_token
        });
        
        if (refreshError) {
          console.error('auth-service: Failed to use backup session:', refreshError);
          clearSessionBackup();
          return { user: null, error: refreshError };
        }
        
        if (refreshData?.user) {
          console.log('auth-service: Successfully recovered session from backup');
          return { 
            user: mapToUser(refreshData.user), 
            error: null 
          };
        }
      }
      
      // Try to refresh the session as a last resort
      console.log('auth-service: Attempting to refresh the session');
      
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('auth-service: Failed to refresh session:', refreshError);
        return { user: null, error: refreshError };
      }
      
      if (refreshData?.user) {
        console.log('auth-service: Session refreshed successfully');
        
        // Store refreshed session
        if (refreshData.session) {
          storeSessionBackup(refreshData.session);
        }
        
        return { 
          user: mapToUser(refreshData.user), 
          error: null 
        };
      }
      
      // If all recovery attempts fail, return the original error
      return { user: null, error };
    }
    
    // Successful response from official method
    console.log('auth-service: User fetched successfully');
    
    // Update our backup with the latest session data
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      storeSessionBackup(sessionData.session);
    }
    
    return { 
      user: data?.user ? mapToUser(data.user) : null, 
      error: null 
    };
  } catch (error) {
    console.error('auth-service: Exception in getCurrentUser:', error);
    return { user: null, error };
  }
}

// Reset password
export async function resetPassword(email: string): Promise<{ error: any }> {
  try {
    console.log('auth-service: Sending password reset email to:', email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    
    if (error) {
      console.error('auth-service: Reset password error:', error);
      throw error;
    }
    
    console.log('auth-service: Password reset email sent successfully');
    return { error: null };
  } catch (error) {
    console.error('auth-service: Error resetting password:', error);
    return { error };
  }
}

// Update user data
export async function updateUserData(
  userId: string, 
  updates: Partial<{ fullName: string; avatarUrl: string }>
): Promise<{ user: User | null; error: any }> {
  try {
    console.log('auth-service: Updating user data for user:', userId);
    
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: updates.fullName,
        avatar_url: updates.avatarUrl,
      },
    });

    if (error) {
      console.error('auth-service: Update user error:', error);
      throw error;
    }
    
    console.log('auth-service: User data updated successfully');
    return { 
      user: data?.user ? mapToUser(data.user) : null, 
      error: null 
    };
  } catch (error) {
    console.error('auth-service: Error updating user data:', error);
    return { user: null, error };
  }
}

// Explicitly refresh the session
export async function refreshSession(): Promise<{ user: User | null; error: any }> {
  try {
    console.log('auth-service: Explicitly refreshing session');
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('auth-service: Refresh session error:', error);
      // Try using our backup as a last resort
      const backupSession = getSessionBackup();
      
      if (backupSession) {
        console.log('auth-service: Attempting to recover with backup session');
        const { data: recoveryData, error: recoveryError } = await supabase.auth.setSession({
          access_token: backupSession.access_token,
          refresh_token: backupSession.refresh_token
        });
        
        if (recoveryError) {
          console.error('auth-service: Failed to recover session:', recoveryError);
          clearSessionBackup();
          return { user: null, error: recoveryError };
        }
        
        if (recoveryData?.user) {
          console.log('auth-service: Successfully recovered session from backup');
          return { 
            user: mapToUser(recoveryData.user), 
            error: null 
          };
        }
      }
      
      return { user: null, error };
    }
    
    console.log('auth-service: Session refreshed successfully');
    
    // Update our backup
    if (data.session) {
      storeSessionBackup(data.session);
    }
    
    return { 
      user: data?.user ? mapToUser(data.user) : null, 
      error: null 
    };
  } catch (error) {
    console.error('auth-service: Error refreshing session:', error);
    return { user: null, error };
  }
}

// Completely reset the auth state and clear all data
export function resetAuthState(): void {
  try {
    console.log('auth-service: Resetting auth state');
    
    // Clear our backup
    clearSessionBackup();
    
    // Clear all Supabase storage
    localStorage.removeItem('fintrack-auth');
    
    // Clear all items that contain auth-related keys
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('auth') || key.includes('supabase')
    );
    
    authKeys.forEach(key => {
      console.log(`auth-service: Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    });
    
    // Also try to sign out from Supabase
    supabase.auth.signOut().catch(error => {
      console.error('auth-service: Error signing out during reset:', error);
    });
    
    console.log('auth-service: Auth state reset successful');
  } catch (error) {
    console.error('auth-service: Error resetting auth state:', error);
  }
}

// Helper to create default user settings
async function createDefaultUserSettings(userId: string): Promise<void> {
  try {
    console.log('auth-service: Creating default settings for user:', userId);
    
    const { error } = await supabase
      .from('user_settings')
      .insert([
        {
          user_id: userId,
          currency: 'INR',
          theme: 'system',
          notifications_enabled: true,
        },
      ]);

    if (error) {
      console.error('auth-service: Error creating default user settings:', error);
      throw error;
    }
    
    console.log('auth-service: Default user settings created successfully');
  } catch (error) {
    console.error('auth-service: Exception creating default user settings:', error);
    // Don't throw here to prevent blocking signup
  }
}

// Store a backup of the session in localStorage
function storeSessionBackup(session: any): void {
  try {
    // Only store the minimum required fields for session recovery
    const sessionBackup = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at
    };
    
    localStorage.setItem(FINTRACK_SESSION_KEY, JSON.stringify(sessionBackup));
    console.log('auth-service: Session backup stored');
  } catch (error) {
    console.error('auth-service: Error storing session backup:', error);
  }
}

// Get the backup session from localStorage
function getSessionBackup(): any {
  try {
    const sessionString = localStorage.getItem(FINTRACK_SESSION_KEY);
    if (!sessionString) return null;
    
    const session = JSON.parse(sessionString);
    
    // Check if the session has expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('auth-service: Backup session has expired');
      clearSessionBackup();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('auth-service: Error getting session backup:', error);
    return null;
  }
}

// Clear the backup session
function clearSessionBackup(): void {
  localStorage.removeItem(FINTRACK_SESSION_KEY);
  console.log('auth-service: Session backup cleared');
}

// Helper to map Supabase user to our User type
function mapToUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    full_name: supabaseUser.user_metadata?.full_name,
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at,
    last_sign_in_at: supabaseUser.last_sign_in_at,
  };
} 