import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Container } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function AboutScreen() {
  const { colors: themeColors } = useAppTheme();

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: 'About', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]}>About Our App</Text>
        <Text style={[styles.description, { color: themeColors.textSecondary }]}>
          This app helps people connect, chat, and build communities around shared interests.
          From meeting new buddies to joining chatrooms, it&apos;s built to keep conversations fun,
          safe, and meaningful.
        </Text>
        <View style={[styles.creatorCard, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}>
          <Text style={[styles.creatorLabel, { color: themeColors.textTertiary }]}>Created by</Text>
          <Text style={styles.creatorName}>cY</Text>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 460,
    marginBottom: spacing.xl,
  },
  creatorCard: {
    width: '100%',
    maxWidth: 460,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  creatorLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  creatorName: {
    ...typography.h2,
    color: colors.accent,
  },
});
