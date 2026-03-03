import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Container, Button } from '@/components/ui';
import { borderRadius, colors, spacing, typography, withOpacity } from '@/constants/design';
import { ONBOARDING_SLIDES } from '@/constants/onboardingData';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = ONBOARDING_SLIDES[index];
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      return;
    }
    router.push('/(auth)/interests' as any);
  };

  return (
    <Container style={styles.container}>
      <LinearGradient
        colors={['#0E1A13', '#0E0E0E']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Skip */}
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login' as any)}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Icon area */}
        <Animated.View key={index} entering={FadeIn.duration(500)} style={styles.iconSection}>
          <LinearGradient
            colors={[withOpacity(colors.primary, 0.18), withOpacity(colors.primary, 0.04)]}
            style={styles.heroIconWrap}
          >
            <Ionicons name={slide.icon as any} size={52} color={colors.primary} />
          </LinearGradient>

          {/* Decorative rings */}
          <View style={styles.ring1} />
          <View style={styles.ring2} />
        </Animated.View>

        {/* Text */}
        <Animated.View key={`text-${index}`} entering={FadeInUp.delay(100).duration(450)} style={styles.textSection}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.description}</Text>
        </Animated.View>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {ONBOARDING_SLIDES.map((_, dotIndex) => (
            <TouchableOpacity key={dotIndex} onPress={() => setIndex(dotIndex)}>
              <View style={[styles.dot, index === dotIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTAs */}
        <View style={styles.ctaWrap}>
          <Button variant="primary" size="lg" onPress={next}>
            {isLast ? 'Start Setup' : 'Next'}
          </Button>
          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => router.push('/(auth)/register' as any)}
          >
            <Text style={styles.ghostBtnText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipText: { ...typography.smallBold, color: colors.textTertiary },

  iconSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xxl,
    position: 'relative',
  },
  heroIconWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: withOpacity(colors.primary, 0.35),
    zIndex: 2,
  },
  ring1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.12),
  },
  ring2: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.06),
  },

  textSection: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.md,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.primary,
  },

  ctaWrap: { gap: spacing.md },
  ghostBtn: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  ghostBtnText: {
    ...typography.captionBold,
    color: colors.textTertiary,
  },
});
