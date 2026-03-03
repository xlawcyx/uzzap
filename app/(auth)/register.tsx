import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows, withOpacity } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button, Input, Container } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const REGIONS = ['Metro Manila', 'Luzon', 'Visayas', 'Mindanao', 'International'];

export default function RegisterScreen() {
  const router = useRouter();
  const { colors: themeColors, isDark } = useAppTheme();
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

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        username: normalizedUsername,
        display_name: normalizedDisplayName,
        region,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedUsername}`,
      }, { onConflict: 'id' });

      if (profileError) throw profileError;

      // Auto-confirm is enabled — user is logged in immediately
      // The auth state listener in _layout.tsx will redirect to (tabs)
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Check your details and try again.');
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
      <View style={[styles.blurCircle, { top: -150, right: -100, backgroundColor: withOpacity(colors.primary, 0.2) }]} />
      <View style={[styles.blurCircle, { bottom: 200, left: -150, backgroundColor: withOpacity(colors.accent, 0.1) }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.headerWrap}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: withOpacity(themeColors.backgroundSecondary, 0.5), borderColor: themeColors.border }]} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={themeColors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: themeColors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Join our community and meet new people</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(300).duration(800)} 
          style={[
            styles.formCard, 
            { 
              backgroundColor: isDark ? 'rgba(28, 28, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)', 
              borderColor: themeColors.border 
            }
          ]}
        >
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Public Profile</Text>
            <Input
              label="Username"
              placeholder="unique_username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              leftIcon={<Ionicons name="at-outline" size={20} color={colors.primary} />}
            />
            <View style={styles.fieldSpacer} />
            <Input
              label="Display Name"
              placeholder="Your full name"
              value={displayName}
              onChangeText={setDisplayName}
              leftIcon={<Ionicons name="person-outline" size={20} color={colors.primary} />}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Account Security</Text>
            <Input
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.primary} />}
            />
            <View style={styles.fieldSpacer} />
            <Input
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.primary} />}
            />
            <View style={styles.fieldSpacer} />
            <Input
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Location</Text>
            <View style={styles.regionsGrid}>
              {REGIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRegion(r)}
                  style={[
                    styles.regionOption,
                    { borderColor: themeColors.border, backgroundColor: themeColors.backgroundTertiary },
                    region === r && {
                      backgroundColor: withOpacity(colors.primary, 0.15),
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.regionOptionText,
                      { color: themeColors.textSecondary },
                      region === r && { color: colors.primary, fontWeight: '700' },
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button 
            variant="primary" 
            size="lg" 
            onPress={handleRegister} 
            loading={loading}
            style={styles.registerButton}
          >
            Create Account
          </Button>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Sign in</Text>
            </TouchableOpacity>
          </View>
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
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerWrap: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xs,
    opacity: 0.8,
  },
  formCard: {
    borderRadius: borderRadius.xxxl,
    padding: spacing.xl,
    borderWidth: 1,
    ...shadows.lg,
  },
  formSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.captionBold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  fieldSpacer: {
    height: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
    opacity: 0.5,
  },
  regionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  regionOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  regionOptionText: {
    ...typography.caption,
  },
  registerButton: {
    marginTop: spacing.xxl,
    height: 56,
    borderRadius: borderRadius.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
  },
  loginLink: {
    ...typography.bodyBold,
  },
});
