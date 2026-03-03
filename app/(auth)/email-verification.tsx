import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Container } from '@/components/ui';
import { borderRadius, colors, spacing, typography, withOpacity } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function EmailVerificationPendingScreen() {
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();

  return (
    <Container style={styles.container} backgroundColor={themeColors.background}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-unread-outline" size={42} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: themeColors.text }]}>Verify your email</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          We sent a verification link to your inbox. Open it to activate your account and keep setup secure.
        </Text>

        <View style={styles.ctaWrap}>
          <Button variant="primary" onPress={() => router.push('/(auth)/complete-profile' as any)}>
            I verified my email
          </Button>
          <Button variant="outline" onPress={() => router.push('/(auth)/account-recovery-status' as any)}>
            Need help with recovery?
          </Button>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.primary, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  ctaWrap: { width: '100%', gap: spacing.sm, marginTop: spacing.sm },
});
