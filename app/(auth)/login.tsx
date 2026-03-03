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
  const { colors: themeColors, isDark } = useAppTheme();
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
      <LinearGradient
        colors={isDark ? ['#1E1B4B', '#000000'] : ['#F5F3FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Decorative Blur Circles */}
      <View style={[styles.blurCircle, { top: -100, left: -100, backgroundColor: withOpacity(colors.primary, 0.2) }]} />
      <View style={[styles.blurCircle, { bottom: -50, right: -100, backgroundColor: withOpacity(colors.accent, 0.15) }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <Animated.View entering={FadeIn.duration(800)} style={styles.hero}>
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={gradients.primarySubtle}
              style={styles.logoCircle}
            >
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>

          <Animated.View entering={FadeInUp.delay(200)} style={[styles.heroBadge, { backgroundColor: withOpacity(colors.primary, 0.1), borderColor: withOpacity(colors.primary, 0.2) }]}>
            <View style={[styles.heroBadgeDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.heroBadgeText, { color: colors.primary }]}>Uzzap Community</Text>
          </Animated.View>

          <Text style={[styles.title, { color: themeColors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Connect with your buddies in real-time</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(800)} 
          style={[
            styles.formCard, 
            { 
              backgroundColor: isDark ? 'rgba(28, 28, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)', 
              borderColor: themeColors.border 
            }
          ]}
        >
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
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.primary} />}
            />

            <View style={styles.fieldSpacer} />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.primary} />}
            />
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push('/(auth)/forgot-password' as any)}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot password?</Text>
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
            <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>Create one</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(800)}>
          <TouchableOpacity
            style={styles.onboardingLink}
            onPress={() => router.push('/(auth)/welcome' as any)}
          >
            <Ionicons name="sparkles-outline" size={16} color={themeColors.textTertiary} />
            <Text style={[styles.onboardingLinkText, { color: themeColors.textTertiary }]}>New here? Guided setup</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurCircle: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },

  hero: { alignItems: 'center', marginBottom: spacing.md },
  logoWrap: { marginBottom: spacing.lg },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: withOpacity(colors.primary, 0.4),
    ...shadows.glow,
  },
  logoImage: { width: 70, height: 70 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  heroBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroBadgeText: { ...typography.smallBold, letterSpacing: 0.5 },
  title: { ...typography.h1, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 22,
  },

  formCard: {
    borderWidth: 1,
    borderRadius: borderRadius.xxxl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  fieldGroup: { gap: 0 },
  fieldSpacer: { height: spacing.lg },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    paddingVertical: 4,
  },
  forgotPasswordText: { ...typography.captionBold },
  loginButton: { 
    width: '100%',
    height: 56,
    borderRadius: borderRadius.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: {
    ...typography.tinyBold,
    marginHorizontal: spacing.lg,
    letterSpacing: 2,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { ...typography.body },
  registerLink: { ...typography.bodyBold },

  onboardingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  onboardingLinkText: { ...typography.captionBold },
});
