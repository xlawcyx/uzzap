import { useColorScheme } from 'react-native';
import { colors, withOpacity } from '@/constants/design';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';

const lightColors = {
  // Backgrounds
  background: '#F5F7FA',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#EAEEF3',
  backgroundElevated: '#F0F2F5',
  backgroundCard: '#FFFFFF',

  // Text
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textDisabled: '#CBD5E1',
  textInverse: '#FFFFFF',

  // Borders
  border: '#DDE2EA',
  borderMuted: '#E8ECF1',
  borderAccent: 'rgba(62, 207, 142, 0.4)',

  // Options
  optionActiveBackground: '#D1FAE5',
  optionActiveText: '#065F46',

  // Chat bubbles
  bubbleMe: '#3ECF8E',
  bubbleMeText: '#FFFFFF',
  bubbleThem: '#EAEEF3',
  bubbleThemText: '#0F172A',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',

  // Gradient stops for profile header
  gradientStart: '#D6F5E8',
  gradientMid: '#EAF7F0',
  gradientEnd: '#F5F7FA',

  // Input
  inputBackground: '#F0F2F5',
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
  gradientStart: '#1A2E23',
  gradientMid: '#121E19',
  gradientEnd: colors.background,

  // Input
  inputBackground: colors.backgroundTertiary,
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
