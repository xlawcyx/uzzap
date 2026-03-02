import { supabase } from '../lib/supabase';
import { Profile } from '../types/database.types';

export const authService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data ?? null;
  },

  async createProfile(profile: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    // Try update first
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.message || 'Unable to update profile');
    }

    // If no row existed yet, upsert to create it
    if (!data) {
      const { data: upserted, error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates })
        .select()
        .single();

      if (upsertError) {
        console.error('Error upserting profile:', upsertError);
        throw new Error(upsertError.message || 'Unable to create profile');
      }

      return upserted;
    }

    return data;
  },

  async setPresence(userId: string, isOnline: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_online: isOnline,
        last_seen: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating presence:', error);
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  }
};
