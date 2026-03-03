import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Container } from '@/components/ui';
import { borderRadius, colors, spacing, typography, withOpacity } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';
import { INTEREST_OPTIONS } from '@/constants/onboardingData';

export default function InterestsScreen() {
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();
  const [selected, setSelected] = useState<string[]>([]);

  const canContinue = useMemo(() => selected.length >= 3, [selected.length]);

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest].slice(-8),
    );
  };

  return (
    <Container style={styles.container} backgroundColor={themeColors.background}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>Choose your interests</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Pick at least 3 topics so we can recommend better buddies and chatrooms.</Text>
        </View>

        <View style={styles.tagsWrap}>
          {INTEREST_OPTIONS.map((interest) => {
            const active = selected.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.tag,
                  { borderColor: themeColors.border, backgroundColor: themeColors.backgroundSecondary },
                  active && {
                    backgroundColor: themeColors.optionActiveBackground,
                    borderColor: themeColors.optionActiveText,
                  },
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: themeColors.textSecondary },
                    active && { color: themeColors.optionActiveText, fontWeight: '700' },
                  ]}
                >
                  {interest}
                </Text>
                {active ? (
                  <Ionicons name="checkmark-circle" size={16} color={themeColors.optionActiveText} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.helper, { color: themeColors.textTertiary }]}>{selected.length} selected (max 8)</Text>

        <View style={styles.footer}>
          <Button variant="outline" onPress={() => router.back()}>
            Back
          </Button>
          <Button variant="primary" onPress={() => router.push('/(auth)/location' as any)} disabled={!canContinue}>
            Continue
          </Button>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {},
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.md },
  header: { gap: spacing.sm },
  title: { ...typography.h2 },
  subtitle: { ...typography.body },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tagActive: {
    backgroundColor: colors.primary,
    borderColor: withOpacity(colors.primary, 0.8),
  },
  tagText: { ...typography.captionBold },
  tagTextActive: { color: '#FFFFFF' },
  helper: { ...typography.small },
  footer: { marginTop: 'auto', flexDirection: 'row', gap: spacing.sm },
});