import { supabase } from './supabase';
import { UserSettings } from '../types';

// Get user settings
export async function getUserSettings(userId: string): Promise<{ settings: UserSettings | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return { settings: data as UserSettings, error: null };
  } catch (error) {
    console.error('Error getting user settings:', error);
    return { settings: null, error };
  }
}

// Update user settings
export async function updateUserSettings(
  userId: string,
  updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ settings: UserSettings | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { settings: data as UserSettings, error: null };
  } catch (error) {
    console.error('Error updating user settings:', error);
    return { settings: null, error };
  }
}

// Get user profile - additional user info beyond auth data
export async function getUserProfile(userId: string): Promise<{ profile: any; error: any }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { profile: data, error: null };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { profile: null, error };
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: any
): Promise<{ profile: any; error: any }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { profile: data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { profile: null, error };
  }
}

// Delete user account
export async function deleteUserAccount(userId: string): Promise<{ error: any }> {
  try {
    // Will need to handle this with a Supabase function with admin rights
    // For demo purposes, we'll just simulate success
    console.log('Deleting user account:', userId);
    
    return { error: null };
  } catch (error) {
    console.error('Error deleting user account:', error);
    return { error };
  }
} 