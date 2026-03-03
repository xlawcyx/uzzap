import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, spacing, typography } from '@/constants/design';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface TypingIndicatorProps {
  typingUsers: string[];
  themeColors: any;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers, themeColors }) => {
  if (typingUsers.length === 0) return null;

  return (
    <Animated.View 
      entering={FadeIn.duration(200)} 
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      <View style={styles.dots}>
        <Animated.View style={[styles.dot, styles.dot1]} />
        <Animated.View style={[styles.dot, styles.dot2]} />
        <Animated.View style={[styles.dot, styles.dot3]} />
      </View>
      <Text style={[styles.text, { color: themeColors.textTertiary }]}>
        {typingUsers.length === 1 ? 'Someone is typing...' : 'Several people are typing...'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  dot1: { opacity: 0.8 },
  dot2: { opacity: 0.5 },
  dot3: { opacity: 0.2 },
  text: {
    ...typography.tiny,
  },
});
