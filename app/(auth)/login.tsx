import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows, withOpacity } from '@/constants/design';
import { Button, Input, Container } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function LoginScreen() {
  const router = useRouter();
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
    <Container style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(150).duration(700)}>
          <LinearGradient
            colors={[withOpacity(colors.primary, 0.2), withOpacity(colors.secondary, 0.95)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.logoCircle}>
              <Image source={require('@/assets/images/icon.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in and continue chatting with your buddies.</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(700)} style={styles.formCard}>
          <Input
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            clearable
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
          />

          <View style={styles.fieldSpacer} />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          />

          <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/(auth)/forgot-password' as any)}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.loginButton}>
            <Button
              variant="primary"
              size="lg"
              onPress={handleLogin}
              loading={loading}
            >
              Sign In
            </Button>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>NEW HERE?</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account yet? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
              <Text style={styles.registerLink}>Create one</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.onboardingLinkWrap} onPress={() => router.push('/(auth)/welcome' as any)}>
            <Text style={styles.onboardingLinkText}>Need a guided setup? Start onboarding</Text>
          </TouchableOpacity>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: withOpacity(colors.primary, 0.25),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoImage: {
    width: 58,
    height: 58,
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
  fieldSpacer: {
    height: spacing.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.captionBold,
    color: colors.accent,
  },
  loginButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.smallBold,
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
    letterSpacing: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  registerLink: {
    ...typography.bodyBold,
    color: colors.accent,
  },
  onboardingLinkWrap: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  onboardingLinkText: {
    ...typography.captionBold,
    color: colors.textTertiary,
  },
});
