import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows, withOpacity } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button, Input, Container } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

export default function LoginScreen() {
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      Alert.alert('Missing details', 'Please enter your email and password to continue.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={styles.container} backgroundColor={themeColors.background}>
      {/* Background gradient */}
      <LinearGradient
        colors={[themeColors.gradientStart, themeColors.background, themeColors.background]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <Animated.View entering={FadeIn.duration(700)} style={styles.hero}>
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={[withOpacity(colors.primary, 0.3), withOpacity(colors.primary, 0.1)]}
              style={styles.logoCircle}
            >
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>

          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>Uzzap Community</Text>
          </View>

          <Text style={[styles.title, { color: themeColors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Sign in and continue chatting with your buddies</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInUp.delay(250).duration(600)} style={[styles.formCard, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}>
          <Text style={[styles.formTitle, { color: themeColors.textTertiary }]}>Sign in to your account</Text>

          <View style={styles.fieldGroup}>
            <Input
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              clearable
              leftIcon={<Ionicons name="mail-outline" size={18} color={themeColors.textTertiary} />}
            />

            <View style={styles.fieldSpacer} />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={themeColors.textTertiary} />}
            />
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push('/(auth)/forgot-password' as any)}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            variant="primary"
            size="lg"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          >
            Sign In
          </Button>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
            <Text style={[styles.dividerText, { color: themeColors.textTertiary }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
              <Text style={styles.registerLink}>Create one →</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450).duration(600)}>
          <TouchableOpacity
            style={styles.onboardingLink}
            onPress={() => router.push('/(auth)/welcome' as any)}
          >
            <Ionicons name="sparkles-outline" size={14} color={themeColors.textTertiary} />
            <Text style={[styles.onboardingLinkText, { color: themeColors.textTertiary }]}>New here? Take the guided setup</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  // Hero
  hero: { alignItems: 'center', paddingTop: spacing.md },
  logoWrap: { marginBottom: spacing.md },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: withOpacity(colors.primary, 0.4),
    ...shadows.glow,
  },
  logoImage: { width: 60, height: 60 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: withOpacity(colors.primary, 0.1),
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.25),
    marginBottom: spacing.md,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  heroBadgeText: { ...typography.smallBold, color: colors.primary },
  title: { ...typography.h2, color: colors.text, textAlign: 'center' },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Form
  formCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    ...shadows.md,
  },
  formTitle: {
    ...typography.captionBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.lg,
  },
  fieldGroup: { gap: 0 },
  fieldSpacer: { height: spacing.md },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
  },
  forgotPasswordText: { ...typography.captionBold, color: colors.primary },
  loginButton: { width: '100%' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    ...typography.tinyBold,
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
    letterSpacing: 1,
  },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { ...typography.body, color: colors.textSecondary },
  registerLink: { ...typography.bodyBold, color: colors.primary },

  // Onboarding link
  onboardingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  onboardingLinkText: { ...typography.captionBold, color: colors.textTertiary },
});
