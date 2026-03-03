import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '@/lib/supabase';
import { Button, Container, Input } from '@/components/ui';
import { borderRadius, colors, shadows, spacing, typography, withOpacity } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Email required', 'Enter the email linked to your account.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
      if (error) throw error;
      Alert.alert('Email sent', 'Check your inbox for the password reset link.');
      router.replace('/(auth)/account-recovery-status' as any);
    } catch (error: any) {
      Alert.alert('Reset Failed', error.message || 'Unable to send reset email right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={styles.container} backgroundColor={themeColors.background}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(120).duration(700)} style={styles.headerWrap}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={themeColors.text} />
            <Text style={[styles.backText, { color: themeColors.text }]}>Back to login</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={[withOpacity(colors.primary, 0.22), withOpacity(colors.secondary, 0.95)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.iconBadge}>
              <Ionicons name="key-outline" size={24} color={colors.primaryLight} />
            </View>
            <Text style={[styles.title, { color: themeColors.text }]}>Forgot your password?</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>No worries. We&apos;ll send a reset link so you can securely get back in.</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(280).duration(700)} style={[styles.formCard, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}>
          <Input
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            clearable
            leftIcon={<Ionicons name="mail-outline" size={20} color={themeColors.textSecondary} />}
          />

          <View style={styles.tipRow}>
            <Ionicons name="information-circle-outline" size={16} color={themeColors.textTertiary} />
            <Text style={[styles.tipText, { color: themeColors.textTertiary }]}>Use the email you used during registration.</Text>
          </View>

          <View style={styles.sendButton}>
            <Button variant="primary" size="lg" onPress={handleSendReset} loading={loading}>
              Send reset link
            </Button>
          </View>
        </Animated.View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  headerWrap: {
    gap: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: {
    ...typography.captionBold,
    color: colors.text,
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: withOpacity(colors.primary, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    ...shadows.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  tipText: {
    ...typography.small,
    color: colors.textTertiary,
  },
  sendButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
  },
});
