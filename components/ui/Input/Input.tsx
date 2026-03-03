/**
 * Input Component — Theme-aware
 */

import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, opacity } from '@/constants/design';
import { animationDurations, animationEasing } from '@/constants/animations';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { InputProps } from './Input.types';

export function Input({
  value,
  onChangeText,
  label,
  placeholder,
  error,
  disabled = false,
  leftIcon,
  rightIcon,
  clearable = false,
  multiline = false,
  numberOfLines = 4,
  accessibilityLabel,
  testID,
  ...textInputProps
}: InputProps) {
  const { colors: themeColors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const labelPosition = useSharedValue(value ? 1 : 0);
  const borderColorAnim = useSharedValue(0);

  const labelStyle = useAnimatedStyle(() => {
    const shouldFloat = isFocused || value.length > 0;
    labelPosition.value = withTiming(shouldFloat ? 1 : 0, {
      duration: animationDurations.fast,
      easing: animationEasing.easeOut,
    });
    return {
      transform: [
        { translateY: interpolate(labelPosition.value, [0, 1], [0, -28]) },
        { scale: interpolate(labelPosition.value, [0, 1], [1, 0.85]) },
      ],
    };
  });

  const containerAnimStyle = useAnimatedStyle(() => {
    borderColorAnim.value = withTiming(isFocused ? 1 : 0, {
      duration: animationDurations.fast,
      easing: animationEasing.easeOut,
    });
    return {
      borderColor: error
        ? colors.error
        : interpolateColor(borderColorAnim.value, [0, 1], [themeColors.border, colors.primary]),
    };
  });

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const handleClear = () => onChangeText('');
  const showClearButton = clearable && value.length > 0 && !disabled;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: themeColors.background },
          containerAnimStyle,
          multiline && styles.containerMultiline,
          disabled && [styles.containerDisabled, { backgroundColor: themeColors.backgroundSecondary }],
          error && styles.containerError,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <View style={styles.inputWrapper}>
          {label && (
            <Animated.Text
              style={[
                styles.label,
                { color: themeColors.textSecondary },
                labelStyle,
                isFocused && styles.labelFocused,
                error && styles.labelError,
                disabled && { color: themeColors.textDisabled },
              ]}
            >
              {label}
            </Animated.Text>
          )}

          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={label ? (isFocused ? placeholder : undefined) : placeholder}
            placeholderTextColor={themeColors.textTertiary}
            editable={!disabled}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
            textAlignVertical={multiline ? 'top' : 'center'}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityState={{ disabled }}
            testID={testID}
            style={[
              styles.input,
              { color: themeColors.text },
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || showClearButton) && styles.inputWithRightIcon,
              multiline && styles.inputMultiline,
              disabled && { color: themeColors.textDisabled },
            ]}
            {...textInputProps}
          />
        </View>

        {showClearButton && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Clear input"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle" size={18} color={themeColors.textSecondary} />
          </TouchableOpacity>
        )}

        {rightIcon && !showClearButton && <View style={styles.iconRight}>{rightIcon}</View>}
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  containerMultiline: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  containerDisabled: { opacity: opacity.disabled },
  containerError: { borderColor: colors.error },
  inputWrapper: { flex: 1, justifyContent: 'center', paddingTop: spacing.sm },
  label: {
    ...typography.body,
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -12,
    transformOrigin: 'left center',
  },
  labelFocused: { color: colors.primary },
  labelError: { color: colors.error },
  input: {
    ...typography.body,
    padding: 0,
    margin: 0,
    minHeight: 24,
    paddingTop: spacing.xs,
  },
  inputWithLeftIcon: {},
  inputWithRightIcon: {},
  inputMultiline: { minHeight: 80, paddingTop: spacing.md },
  iconLeft: { marginRight: spacing.sm, justifyContent: 'center', alignItems: 'center' },
  iconRight: { marginLeft: spacing.sm, justifyContent: 'center', alignItems: 'center' },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.xs, marginLeft: spacing.xs },
});