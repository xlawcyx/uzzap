import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { ThemePreference, useAppSettingsStore } from '@/store/useAppSettingsStore';
import { useAppTheme } from '@/hooks/useAppTheme';

const themes: ThemePreference[] = ['system', 'light', 'dark'];

export default function AppearanceSettingsScreen() {
  const { theme, setTheme } = useAppSettingsStore();
  const { resolvedTheme, colors: themeColors } = useAppTheme();

  return (
    <Container style={{ ...styles.container, backgroundColor: themeColors.background }}>
      <Stack.Screen options={{ headerShown: true, title: 'Appearance', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <View style={styles.content}>
        <Card variant="elevated" style={{ ...styles.card, backgroundColor: themeColors.backgroundSecondary }}>
          <Card.Content>
            <Text style={[styles.header, { color: themeColors.text }]}>Choose theme</Text>
            {themes.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.option,
                  { backgroundColor: themeColors.background, borderColor: themeColors.border },
                  theme === item && {
                    borderColor: colors.primary,
                    backgroundColor: themeColors.optionActiveBackground,
                  },
                ]}
                onPress={() => setTheme(item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: theme === item ? themeColors.optionActiveText : themeColors.text },
                  ]}
                >
                  {item[0].toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={[styles.helper, { color: themeColors.textSecondary }]}>Current applied theme: {resolvedTheme}</Text>
          </Card.Content>
        </Card>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { padding: spacing.md },
  card: { backgroundColor: colors.backgroundSecondary },
  header: { ...typography.h4, color: colors.text, marginBottom: spacing.sm },
  option: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  optionText: { ...typography.body, color: colors.text },
  helper: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.md },
});
