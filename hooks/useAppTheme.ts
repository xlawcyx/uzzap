import { useColorScheme } from 'react-native';
import { colors, withOpacity } from '@/constants/design';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';

const lightColors = {
  // Backgrounds
  background: '#F8F7FF',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F1F0FB',
  backgroundElevated: '#EBE9F9',
  backgroundCard: '#FFFFFF',

  // Text
  text: '#1A1A1E',
  textSecondary: '#636366',
  textTertiary: '#8E8E93',
  textDisabled: '#C7C7CC',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E5E5EA',
  borderMuted: '#F2F2F7',
  borderAccent: 'rgba(139, 92, 246, 0.4)',

  // Options
  optionActiveBackground: '#F5F3FF',
  optionActiveText: '#8B5CF6',

  // Chat bubbles
  bubbleMe: '#8B5CF6',
  bubbleMeText: '#FFFFFF',
  bubbleThem: '#E5E5EA',
  bubbleThemText: '#1A1A1E',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',

  // Gradient stops for profile header
  gradientStart: '#DDD6FE',
  gradientMid: '#EDE9FE',
  gradientEnd: '#F8F7FF',
};

const darkColors = {
  // Backgrounds
  background: colors.background,
  backgroundSecondary: colors.backgroundSecondary,
  backgroundTertiary: colors.backgroundTertiary,
  backgroundElevated: colors.backgroundElevated,
  backgroundCard: colors.backgroundCard,

  // Text
  text: colors.text,
  textSecondary: colors.textSecondary,
  textTertiary: colors.textTertiary,
  textDisabled: colors.textDisabled,
  textInverse: colors.textInverse,

  // Borders
  border: colors.border,
  borderMuted: colors.borderMuted,
  borderAccent: colors.borderAccent,

  // Options
  optionActiveBackground: colors.primaryTint,
  optionActiveText: colors.primary,

  // Chat bubbles
  bubbleMe: colors.bubbleMe,
  bubbleMeText: colors.bubbleMeText,
  bubbleThem: colors.bubbleThem,
  bubbleThemText: colors.bubbleThemText,

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.65)',

  // Gradient stops for profile header
  gradientStart: '#1E1B4B',
  gradientMid: '#111111',
  gradientEnd: colors.background,
};

export type ThemeColors = typeof lightColors;

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
