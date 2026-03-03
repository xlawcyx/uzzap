import React from 'react';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';

type InfoScreenProps = {
  title: string;
  subtitle?: string;
  sections: { heading: string; body: string[] }[];
};

export function InfoScreen({ title, subtitle, sections }: InfoScreenProps) {
  const { colors: themeColors } = useAppTheme();

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: true, title, headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }]}>
          <Card.Content>
            {subtitle ? <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text> : null}
            {sections.map((section) => (
              <View key={section.heading} style={styles.section}>
                <Text style={[styles.heading, { color: themeColors.text }]}>{section.heading}</Text>
                {section.body.map((line) => (
                  <Text key={line} style={[styles.body, { color: themeColors.textSecondary }]}>
                    • {line}
                  </Text>
                ))}
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { padding: spacing.md },
  card: { backgroundColor: colors.backgroundSecondary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  section: { marginBottom: spacing.md },
  heading: { ...typography.h4, color: colors.text, marginBottom: spacing.xs },
  body: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
});
