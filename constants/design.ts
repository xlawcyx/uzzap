/**
 * Design Token System — Uzzap
 *
 * Deep dark theme with Emerald Green as the signature brand color.
 * Inspired by Supabase's palette but crafted for mobile chat experience.
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Brand — Electric Violet signature
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryTint: '#2E1065',
  primaryGlow: 'rgba(139, 92, 246, 0.35)',

  secondary: '#1C1C1E',
  secondaryDark: '#121214',
  secondaryLight: '#2C2C2E',
  secondaryTint: '#3A3A3C',

  // Accent — Cyan for contrast
  accent: '#06B6D4',
  accentDark: '#0891B2',
  accentLight: '#22D3EE',
  accentTint: '#083344',

  // Subtle gold accent for special elements
  gold: '#F59E0B',
  goldDark: '#D97706',
  goldLight: '#FBBF24',
  goldTint: 'rgba(245, 158, 11, 0.12)',

  // Background hierarchy — OLED dark
  background: '#000000',
  backgroundSecondary: '#0A0A0B',
  backgroundTertiary: '#121214',
  backgroundElevated: '#1C1C1E',
  backgroundCard: '#0F0F11',

  // Dark mode aliases
  backgroundDark: '#000000',
  backgroundDarkSecondary: '#0A0A0B',
  backgroundDarkTertiary: '#121214',

  // Text — crisp on dark
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  textDisabled: '#3F3F46',
  textInverse: '#000000',

  textDark: '#FFFFFF',
  textDarkSecondary: '#A1A1AA',
  textDarkTertiary: '#71717A',

  // Semantic
  success: '#10B981',
  successDark: '#059669',
  successLight: '#34D399',
  successTint: '#064E3B',

  error: '#EF4444',
  errorDark: '#DC2626',
  errorLight: '#F87171',
  errorTint: 'rgba(239, 68, 68, 0.12)',

  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FBBF24',
  warningTint: 'rgba(245, 158, 11, 0.12)',

  info: '#3B82F6',
  infoDark: '#2563EB',
  infoLight: '#60A5FA',
  infoTint: 'rgba(59, 130, 246, 0.12)',

  // Borders — subtle glass style
  border: '#1F1F23',
  borderMuted: '#16161A',
  borderDark: '#2D2D33',
  borderAccent: 'rgba(139, 92, 246, 0.3)',

  borderDarkMode: '#1F1F23',
  borderDarkModeLight: '#2D2D33',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.9)',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Chat bubble specific
  bubbleMe: '#8B5CF6',
  bubbleMeText: '#FFFFFF',
  bubbleThem: '#1C1C1E',
  bubbleThemText: '#F4F4F5',
};

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  xxxxl: 96,
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  display: {
    fontSize: 42,
    fontWeight: '800' as const,
    lineHeight: 52,
    letterSpacing: -1,
  },
  h1: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 42,
    letterSpacing: -0.6,
  },
  h2: {
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 19,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  captionBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  smallBold: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  tiny: {
    fontSize: 10,
    fontWeight: '400' as const,
    lineHeight: 14,
    letterSpacing: 0,
  },
  tinyBold: {
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 16,
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.7,
    shadowRadius: 35,
    elevation: 24,
  },
  glow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  full: 9999,
};

// ============================================================================
// TOUCH TARGETS
// ============================================================================

export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
};

// ============================================================================
// OPACITY
// ============================================================================

export const opacity = {
  disabled: 0.3,
  pressed: 0.6,
  hover: 0.8,
  overlay: 0.7,
  overlayLight: 0.4,
  overlayDark: 0.85,
};

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
};

// ============================================================================
// ICON SIZES
// ============================================================================

export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// ============================================================================
// AVATAR SIZES
// ============================================================================

export const avatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  xxl: 120,
};

// ============================================================================
// GRADIENTS
// ============================================================================

export const gradients = {
  primary: ['#8B5CF6', '#6D28D9'] as const,
  primarySubtle: ['rgba(139, 92, 246, 0.25)', 'rgba(139, 92, 246, 0.05)'] as const,
  darkHero: ['#1E1B4B', '#000000'] as const,
  card: ['#0F0F11', '#050505'] as const,
  profileHeader: ['#2E1065', '#1E1B4B', '#000000'] as const,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const withOpacity = (color: string, opacityValue: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
};

export const getThemedColor = (
  lightColor: string,
  darkColor: string,
  isDark: boolean,
): string => {
  return isDark ? darkColor : lightColor;
};
