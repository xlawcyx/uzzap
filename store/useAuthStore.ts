import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { Profile } from '../types/database.types';

type AuthState = {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  authSubscription: { unsubscribe: () => void } | null;
  setUser: (user: any | null) => void;
  setProfile: (profile: Profile | null) => void;
  initialize: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  authSubscription: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  initialize: async () => {
    set({ isLoading: true });

    // Unsubscribe from any existing listener first
    const existingSubscription = get().authSubscription;
    existingSubscription?.unsubscribe();

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        set({ user: session.user, profile });
      } else {
        set({ user: null, profile: null });
      }
    } catch (error) {
      console.error('Error initializing auth store:', error);
      set({ user: null, profile: null });
    } finally {
      set({ isLoading: false });
    }

    // Set up auth state listener AFTER initial load is complete
    const { data } = supabase.auth.onAuthStateChange(async (event, changedSession) => {
      // Ignore the initial SIGNED_IN event during app startup (already handled above)
      if (event === 'INITIAL_SESSION') return;

      if (changedSession?.user) {
        const nextProfile = await authService.getProfile(changedSession.user.id);
        set({ user: changedSession.user, profile: nextProfile, isLoading: false });
      } else {
        set({ user: null, profile: null, isLoading: false });
      }
    });

    set({ authSubscription: data.subscription });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const updatedProfile = await authService.updateProfile(user.id, updates);
    set({ profile: updatedProfile });
  },

  signOut: async () => {
    const existingSubscription = get().authSubscription;
    existingSubscription?.unsubscribe();

    await authService.signOut();
    set({ user: null, profile: null, authSubscription: null });
  },
}));
