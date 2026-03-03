/**
 * Card Component (Compound Component Pattern) — Theme-aware
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, shadows, borderRadius } from '@/constants/design';
import { animationTimings } from '@/constants/animations';
import { useAppTheme } from '@/hooks/useAppTheme';
import type {
  CardProps,
  CardHeaderProps,
  CardImageProps,
  CardContentProps,
  CardFooterProps,
} from './Card.types';

export function Card({
  children,
  variant = 'elevated',
  onPress,
  style,
  testID,
}: CardProps) {
  const scale = useSharedValue(1);
  const { colors: themeColors, isDark } = useAppTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, animationTimings.springSnappy);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, animationTimings.springSnappy);
    }
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const cardContent = (
    <View
      style={[
        styles.card,
        { backgroundColor: themeColors.backgroundCard },
        variant === 'elevated' && [
          shadows.md,
          Platform.OS !== 'web' && { shadowColor: isDark ? '#000' : 'rgba(0,0,0,0.1)' },
        ],
        variant === 'outlined' && { borderWidth: 1, borderColor: themeColors.border },
        variant === 'flat' && { backgroundColor: themeColors.backgroundSecondary },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.95}
          accessibilityRole="button"
        >
          {cardContent}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return cardContent;
}

function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}
Card.Header = CardHeader;

function CardImage({ source, aspectRatio = 16 / 9, rounded = false }: CardImageProps) {
  return (
    <Image
      source={source}
      style={[styles.image, { aspectRatio }, rounded && styles.imageRounded]}
      resizeMode="cover"
    />
  );
}
Card.Image = CardImage;

function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}
Card.Content = CardContent;

function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}
Card.Footer = CardFooter;

const styles = StyleSheet.create({
  // Base card styles
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  // Header
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },

  // Image
  image: {
    width: '100%',
  },

  imageRounded: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },

  // Content
  content: {
    padding: spacing.lg,
  },

  // Footer
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderMuted,
  },
});
