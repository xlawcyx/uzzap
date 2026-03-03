/**
 * Button Component — Theme-aware
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius, touchTargets, opacity } from '@/constants/design';
import { animationTimings } from '@/constants/animations';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ButtonProps } from './Button.types';

const MIN_TOUCH_TARGET = touchTargets?.minimum ?? 44;

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  fullWidth = false,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  testID,
  style,
}: ButtonProps) {
  const { colors: themeColors } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, animationTimings.springSnappy);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, animationTimings.springSnappy);
  };
  const handlePress = () => {
    if (Platform.OS !== 'web' && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onPress && !disabled && !loading) onPress();
  };

  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondary: {
      backgroundColor: themeColors.backgroundTertiary,
      borderColor: themeColors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: themeColors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.error,
      borderColor: colors.error,
    },
  };

  const textColors = {
    primary: colors.white,
    secondary: themeColors.text,
    outline: themeColors.text,
    ghost: colors.primary,
    danger: colors.white,
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.9}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        testID={testID}
        style={[
          styles.button,
          variantStyles[variant],
          styles[`button_${size}`],
          fullWidth && styles.buttonFullWidth,
          isDisabled && styles.buttonDisabled,
        ]}
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
              size={size === 'sm' ? 'small' : 'small'}
            />
          </View>
        )}

        {!loading && leftIcon && (
          <View style={[styles.icon, styles.iconLeft]}>
            {leftIcon}
          </View>
        )}

        <Text
          style={[
            styles.text,
            { color: textColors[variant] },
            styles[`text_${size}`],
            isDisabled && [styles.textDisabled, { color: themeColors.textDisabled }],
            loading && styles.textLoading,
          ]}
          numberOfLines={1}
        >
          {children}
        </Text>

        {!loading && rightIcon && (
          <View style={[styles.icon, styles.iconRight]}>
            {rightIcon}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    minHeight: MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: { width: '100%' },
  buttonFullWidth: { width: '100%' },
  button_sm: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 36 },
  button_md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: MIN_TOUCH_TARGET },
  button_lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, minHeight: 52 },
  button_primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  button_primary_disabled: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  button_secondary: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  button_secondary_disabled: { backgroundColor: colors.secondaryLight, borderColor: colors.secondaryLight },
  button_outline: { backgroundColor: colors.transparent, borderColor: colors.border },
  button_outline_disabled: { borderColor: colors.borderMuted },
  button_ghost: { backgroundColor: colors.transparent, borderColor: colors.transparent },
  button_ghost_disabled: { backgroundColor: colors.transparent },
  button_danger: { backgroundColor: colors.error, borderColor: colors.error },
  button_danger_disabled: { backgroundColor: colors.errorLight, borderColor: colors.errorLight },
  buttonDisabled: { opacity: opacity.disabled },
  text: { textAlign: 'center' },
  text_sm: { ...typography.caption, fontWeight: '600' },
  text_md: { ...typography.body, fontWeight: '600' },
  text_lg: { ...typography.h4, fontWeight: '600' },
  text_primary: { color: colors.white },
  text_primary_disabled: { color: colors.white },
  text_secondary: { color: colors.white },
  text_secondary_disabled: { color: colors.white },
  text_outline: { color: colors.text },
  text_outline_disabled: { color: colors.textDisabled },
  text_ghost: { color: colors.primary },
  text_ghost_disabled: { color: colors.textDisabled },
  text_danger: { color: colors.white },
  text_danger_disabled: { color: colors.white },
  textDisabled: {},
  textLoading: { opacity: 0 },
  icon: { justifyContent: 'center', alignItems: 'center' },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
  loadingContainer: { position: 'absolute', left: 0, right: 0, justifyContent: 'center', alignItems: 'center' },
});