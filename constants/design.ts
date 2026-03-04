import { Platform } from 'react-native';

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
  // Brand — Emerald signature
  primary: '#3ECF8E',
  primaryDark: '#2BAE73',
  primaryLight: '#5DDBA3',
  primaryTint: '#0F3D2D',
  primaryGlow: 'rgba(62, 207, 142, 0.25)',

  secondary: '#1C1C1C',
  secondaryDark: '#111111',
  secondaryLight: '#2A2A2A',
  secondaryTint: '#3A3A3A',

  // Accent — slightly different from primary for highlights
  accent: '#3ECF8E',
  accentDark: '#2BAE73',
  accentLight: '#5DDBA3',
  accentTint: '#0F3D2D',

  // Subtle gold accent for special elements
  gold: '#F59E0B',
  goldDark: '#D97706',
  goldLight: '#FBBF24',
  goldTint: 'rgba(245, 158, 11, 0.12)',

  // Background hierarchy — deep dark
  background: '#0E0E0E',
  backgroundSecondary: '#161616',
  backgroundTertiary: '#1F1F1F',
  backgroundElevated: '#252525',
  backgroundCard: '#1A1A1A',

  // Dark mode aliases
  backgroundDark: '#0E0E0E',
  backgroundDarkSecondary: '#161616',
  backgroundDarkTertiary: '#1F1F1F',

  // Text — crisp on dark
  text: '#F0F0F0',
  textSecondary: '#909090',
  textTertiary: '#585858',
  textDisabled: '#3A3A3A',
  textInverse: '#0E0E0E',

  textDark: '#F0F0F0',
  textDarkSecondary: '#909090',
  textDarkTertiary: '#585858',

  // Semantic
  success: '#3ECF8E',
  successDark: '#2BAE73',
  successLight: '#5DDBA3',
  successTint: '#0F3D2D',

  error: '#F04F5B',
  errorDark: '#DC2626',
  errorLight: '#F87171',
  errorTint: 'rgba(240, 79, 91, 0.12)',

  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FBBF24',
  warningTint: 'rgba(245, 158, 11, 0.12)',

  info: '#60A5FA',
  infoDark: '#3B82F6',
  infoLight: '#93C5FD',
  infoTint: 'rgba(96, 165, 250, 0.12)',

  // Borders — subtle
  border: '#282828',
  borderMuted: '#202020',
  borderDark: '#333333',
  borderAccent: 'rgba(62, 207, 142, 0.3)',

  borderDarkMode: '#282828',
  borderDarkModeLight: '#333333',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.65)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Chat bubble specific
  bubbleMe: '#1D5C3E',
  bubbleMeText: '#F0F0F0',
  bubbleThem: '#202020',
  bubbleThemText: '#F0F0F0',

  // Additional Bubble Colors
  bubbleBlue: '#1D4ED8',
  bubbleIndigo: '#4338CA',
  bubbleViolet: '#6D28D9',
  bubbleFuchsia: '#A21CAF',
  bubblePink: '#BE185D',
  bubbleRose: '#BE123C',
  bubbleAmber: '#B45309',
  bubbleOrange: '#C2410C',
  bubbleSlate: '#334155',
  bubbleZink: '#3F3F46',
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
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
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

const createShadow = (
  x: number,
  y: number,
  blur: number,
  color: string,
  opacity: number,
  elevation: number,
) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `${x}px ${y}px ${blur}px rgba(${color}, ${opacity})`,
    };
  }

  return {
    shadowColor: `rgb(${color})`,
    shadowOffset: { width: x, height: y },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation,
  };
};

export const shadows = {
  none: Platform.OS === 'web' ? { boxShadow: 'none' } : { elevation: 0 },
  xs: createShadow(0, 1, 3, '0, 0, 0', 0.12, 1),
  sm: createShadow(0, 2, 5, '0, 0, 0', 0.18, 2),
  md: createShadow(0, 4, 8, '0, 0, 0', 0.25, 4),
  lg: createShadow(0, 8, 14, '0, 0, 0', 0.3, 8),
  xl: createShadow(0, 12, 20, '0, 0, 0', 0.35, 12),
  xxl: createShadow(0, 20, 28, '0, 0, 0', 0.4, 20),
  glow: createShadow(0, 0, 12, '62, 207, 142', 0.5, 6),
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  xxxl: 32,
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
  disabled: 0.38,
  pressed: 0.72,
  hover: 0.85,
  overlay: 0.5,
  overlayLight: 0.3,
  overlayDark: 0.7,
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
  primary: ['#3ECF8E', '#2BAE73'] as const,
  primarySubtle: ['rgba(62, 207, 142, 0.18)', 'rgba(62, 207, 142, 0.04)'] as const,
  darkHero: ['#1A2E23', '#0E0E0E'] as const,
  card: ['#1A1A1A', '#141414'] as const,
  profileHeader: ['#1A2E23', '#121E19', '#0E0E0E'] as const,
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
