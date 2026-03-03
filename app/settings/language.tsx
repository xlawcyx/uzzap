import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { AppLanguage, useAppSettingsStore } from '@/store/useAppSettingsStore';
import { useAppTheme } from '@/hooks/useAppTheme';

const languages: AppLanguage[] = ['English', 'Filipino', 'Bisaya', 'Spanish'];

export default function LanguageSettingsScreen() {
  const { language, setLanguage } = useAppSettingsStore();
  const { colors: themeColors } = useAppTheme();

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Language', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <View style={styles.content}>
        <Card variant="elevated" style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }]}>
          <Card.Content>
            <Text style={[styles.header, { color: themeColors.text }]}>App language</Text>
            {languages.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.option, { borderColor: themeColors.border, backgroundColor: themeColors.background }, language === item && styles.optionActive]}
                onPress={() => setLanguage(item)}
              >
                <Text style={[styles.optionText, { color: themeColors.text }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {},
  content: { padding: spacing.md },
  card: {},
  header: { ...typography.h4, marginBottom: spacing.sm },
  option: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  optionText: { ...typography.body },
});
