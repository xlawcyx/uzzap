import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'light' | 'dark';
export type AppLanguage = 'English' | 'Filipino' | 'Bisaya' | 'Spanish';

export type DownloadRule = 'always' | 'wifi-only' | 'never';
export type BubbleStyle = 'modern' | 'classic' | 'minimalist' | 'playful';

export type ConnectedAccount = {
  id: string;
  provider: string;
  handle: string;
  connectedAt: string;
  status: 'connected' | 'expiring';
};

type AppSettingsState = {
  theme: ThemePreference;
  language: AppLanguage;
  imageAutoplay: boolean;
  mediaDownloadRule: DownloadRule;
  fontScale: number;
  highContrast: boolean;
  reduceMotion: boolean;
  mediaCacheMB: number;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  diagnosticsMode: boolean;
  crashReports: boolean;
  connectedAccounts: ConnectedAccount[];
  bubbleColor: string;
  bubbleStyle: BubbleStyle;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: AppLanguage) => void;
  setImageAutoplay: (enabled: boolean) => void;
  setMediaDownloadRule: (rule: DownloadRule) => void;
  setFontScale: (scale: number) => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  clearMediaCache: () => void;
  setAutoBackup: (enabled: boolean) => void;
  setBackupFrequency: (frequency: 'daily' | 'weekly' | 'monthly') => void;
  setDiagnosticsMode: (enabled: boolean) => void;
  setCrashReports: (enabled: boolean) => void;
  setBubbleColor: (color: string) => void;
  setBubbleStyle: (style: BubbleStyle) => void;
  disconnectAccount: (id: string) => void;
};

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'English',
      imageAutoplay: true,
      mediaDownloadRule: 'wifi-only',
      fontScale: 1,
      highContrast: false,
      reduceMotion: false,
      mediaCacheMB: 182,
      autoBackup: true,
      backupFrequency: 'weekly',
      diagnosticsMode: false,
      crashReports: true,
      bubbleColor: '#1D5C3E',
      bubbleStyle: 'modern',
      connectedAccounts: [
        { id: 'google', provider: 'Google', handle: 'buddy.user@gmail.com', connectedAt: '2026-01-14', status: 'connected' },
        { id: 'apple', provider: 'Apple', handle: 'appleid@privaterelay.appleid.com', connectedAt: '2025-11-09', status: 'expiring' },
      ],
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setImageAutoplay: (imageAutoplay) => set({ imageAutoplay }),
      setMediaDownloadRule: (mediaDownloadRule) => set({ mediaDownloadRule }),
      setFontScale: (fontScale) => set({ fontScale }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      clearMediaCache: () => set({ mediaCacheMB: 0 }),
      setAutoBackup: (autoBackup) => set({ autoBackup }),
      setBackupFrequency: (backupFrequency) => set({ backupFrequency }),
      setDiagnosticsMode: (diagnosticsMode) => set({ diagnosticsMode }),
      setCrashReports: (crashReports) => set({ crashReports }),
      setBubbleColor: (bubbleColor) => set({ bubbleColor }),
      setBubbleStyle: (bubbleStyle) => set({ bubbleStyle }),
      disconnectAccount: (id) =>
        set((state) => ({ connectedAccounts: state.connectedAccounts.filter((account) => account.id !== id) })),
    }),
    {
      name: 'uzzap-app-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
