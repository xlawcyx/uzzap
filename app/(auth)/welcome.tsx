import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Container, Button } from '@/components/ui';
import { borderRadius, colors, spacing, typography, withOpacity, shadows } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ONBOARDING_SLIDES } from '@/constants/onboardingData';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors: themeColors, isDark } = useAppTheme();
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
    <Container style={styles.container} backgroundColor={themeColors.background}>
      <LinearGradient
        colors={isDark ? ['#1E1B4B', '#000000'] : ['#F5F3FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Decorative Blur Circles */}
      <View style={[styles.blurCircle, { top: -50, right: -50, backgroundColor: withOpacity(colors.primary, 0.15) }]} />
      <View style={[styles.blurCircle, { bottom: 100, left: -100, backgroundColor: withOpacity(colors.accent, 0.1) }]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Skip */}
        <Animated.View entering={FadeIn.delay(300)}>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login' as any)}
            style={[styles.skipBtn, { backgroundColor: withOpacity(themeColors.backgroundTertiary, 0.5), borderColor: themeColors.border }]}
          >
            <Text style={[styles.skipText, { color: themeColors.textSecondary }]}>Skip</Text>
            <Ionicons name="chevron-forward" size={14} color={themeColors.textTertiary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Icon area */}
        <Animated.View key={index} entering={FadeIn.duration(600)} style={styles.iconSection}>
          <LinearGradient
            colors={[withOpacity(themeColors.bubbleMe, 0.18), withOpacity(themeColors.bubbleMe, 0.04)]}
            style={styles.heroIconWrap}
          >
            <Ionicons name={slide.icon as any} size={64} color={colors.primary} />
          </LinearGradient>

          {/* Decorative Animated Rings */}
          <Animated.View entering={FadeIn.delay(200)} style={[styles.ring, styles.ring1, { borderColor: withOpacity(colors.primary, 0.15) }]} />
          <Animated.View entering={FadeIn.delay(400)} style={[styles.ring, styles.ring2, { borderColor: withOpacity(colors.primary, 0.08) }]} />
        </Animated.View>

        {/* Text */}
        <View style={styles.textSection}>
          <Animated.Text 
            key={`title-${index}`} 
            entering={FadeInUp.duration(600)} 
            style={[styles.title, { color: themeColors.text }]}
          >
            {slide.title}
          </Animated.Text>
          <Animated.Text 
            key={`desc-${index}`} 
            entering={FadeInUp.delay(100).duration(600)} 
            style={[styles.subtitle, { color: themeColors.textSecondary }]}
          >
            {slide.description}
          </Animated.Text>
        </View>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {ONBOARDING_SLIDES.map((_, dotIndex) => (
            <TouchableOpacity key={dotIndex} onPress={() => setIndex(dotIndex)} activeOpacity={0.7}>
              <View 
                style={[
                  styles.dot, 
                  { backgroundColor: themeColors.border }, 
                  index === dotIndex && [styles.dotActive, { backgroundColor: colors.primary }]
                ]} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTAs */}
        <View style={styles.ctaWrap}>
          <Animated.View entering={FadeInUp.delay(200).duration(600)}>
            <Button variant="primary" size="lg" onPress={next} style={styles.mainBtn}>
              {isLast ? 'Get Started' : 'Continue'}
            </Button>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(300).duration(600)}>
            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={() => router.push('/(auth)/login' as any)}
            >
              <Text style={[styles.ghostBtnText, { color: themeColors.textTertiary }]}>
                Already have an account? <Text style={{ color: colors.primary }}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
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
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.5,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  skipText: { ...typography.smallBold },

  iconSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xxxl,
    position: 'relative',
  },
  heroIconWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: withOpacity(colors.primary, 0.4),
    zIndex: 2,
    ...shadows.glow,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  ring1: {
    width: 200,
    height: 200,
  },
  ring2: {
    width: 260,
    height: 260,
  },

  textSection: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  title: {
    ...typography.display,
    textAlign: 'center',
    lineHeight: 48,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    opacity: 0.5,
  },
  dotActive: {
    width: 32,
    opacity: 1,
  },

  ctaWrap: { gap: spacing.sm },
  mainBtn: {
    height: 56,
    borderRadius: borderRadius.xl,
  },
  ghostBtn: {
    alignItems: 'center',
    padding: spacing.md,
  },
  ghostBtnText: {
    ...typography.captionBold,
  },
});
