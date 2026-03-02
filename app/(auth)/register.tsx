import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows, withOpacity } from '@/constants/design';
import { Button, Input, Container } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const REGIONS = ['Metro Manila', 'Luzon', 'Visayas', 'Mindanao', 'International'];

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [region, setRegion] = useState('Metro Manila');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedDisplayName = displayName.trim();

    if (!normalizedEmail || !password || !normalizedDisplayName || !normalizedUsername || !confirmPassword) {
      Alert.alert('Incomplete form', 'Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Failed to create user');

      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        username: normalizedUsername,
        display_name: normalizedDisplayName,
        region,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedUsername}`,
      });

      if (profileError) throw profileError;

      Alert.alert('Success', 'Account created successfully! Please verify your email to continue.', [{ text: 'Continue', onPress: () => router.replace('/(auth)/email-verification' as any) }]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(150).duration(700)} style={styles.headerWrap}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={[withOpacity(colors.primary, 0.2), withOpacity(colors.secondary, 0.95)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Set up your profile and join the Uzzap community.</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(700)} style={styles.formCard}>
          <Input
            label="Username"
            placeholder="Unique username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            leftIcon={<Ionicons name="at-outline" size={20} color={colors.textSecondary} />}
          />
          <View style={styles.fieldSpacer} />

          <Input
            label="Display Name"
            placeholder="What should we call you?"
            value={displayName}
            onChangeText={setDisplayName}
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
          />
          <View style={styles.fieldSpacer} />

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
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          />
          <View style={styles.fieldSpacer} />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />}
          />

          <Text style={styles.label}>Region</Text>
          <View style={styles.regionsGrid}>
            {REGIONS.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRegion(r)}
                style={[styles.regionOption, region === r && styles.regionOptionActive]}
              >
                <Text style={[styles.regionOptionText, region === r && styles.regionOptionTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.helperText}>By creating an account, you agree to keep conversations respectful and authentic.</Text>

          <TouchableOpacity style={styles.guidedSetupLink} onPress={() => router.push('/(auth)/welcome' as any)}>
            <Text style={styles.guidedSetupText}>Prefer step-by-step setup? Open onboarding wizard</Text>
          </TouchableOpacity>

          <View style={styles.registerButton}>
            <Button variant="primary" size="lg" onPress={handleRegister} loading={loading}>
              Create Account
            </Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  label: {
    ...typography.smallBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  regionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  regionOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  regionOptionActive: {
    backgroundColor: withOpacity(colors.primary, 0.2),
    borderColor: colors.accent,
  },
  regionOptionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  regionOptionTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  helperText: {
    ...typography.small,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  guidedSetupLink: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  guidedSetupText: {
    ...typography.captionBold,
    color: colors.textTertiary,
  },
  registerButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.bodyBold,
    color: colors.accent,
  },
});
