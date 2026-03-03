import { useColorScheme } from 'react-native';
import { colors } from '@/constants/design';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';

const lightColors = {
  background: '#F5F7FA',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#EAEEF3',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: '#DDE2EA',
  borderAccent: 'rgba(62, 207, 142, 0.4)',
  optionActiveBackground: '#D1FAE5',
  optionActiveText: '#065F46',
};

const darkColors = {
  background: colors.background,
  backgroundSecondary: colors.backgroundSecondary,
  backgroundTertiary: colors.backgroundTertiary,
  text: colors.text,
  textSecondary: colors.textSecondary,
  textTertiary: colors.textTertiary,
  border: colors.border,
  borderAccent: colors.borderAccent,
  optionActiveBackground: colors.primaryTint,
  optionActiveText: colors.primary,
};

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const themePreference = useAppSettingsStore((state) => state.theme);

  const resolvedTheme =
    themePreference === 'system' ? (systemColorScheme ?? 'dark') : themePreference;
  const isDark = resolvedTheme === 'dark';

  return {
    themePreference,
    resolvedTheme,
    isDark,
    statusBarStyle: isDark ? 'light' : 'dark',
    colors: isDark ? darkColors : lightColors,
  } as const;
}
