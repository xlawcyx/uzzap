import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Container, Card } from '@/components/ui';
import { spacing, typography, borderRadius } from '@/constants/design';
import { DownloadRule, useAppSettingsStore } from '@/store/useAppSettingsStore';
import { useAppTheme } from '@/hooks/useAppTheme';

const downloadRules: { label: string; value: DownloadRule }[] = [
  { label: 'Always download', value: 'always' },
  { label: 'Wi-Fi only', value: 'wifi-only' },
  { label: 'Never auto-download', value: 'never' },
];

export default function DataSaverSettingsScreen() {
  const { imageAutoplay, setImageAutoplay, mediaDownloadRule, setMediaDownloadRule } = useAppSettingsStore();
  const { colors: themeColors } = useAppTheme();

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Data Saver', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <View style={styles.content}>
        <Card variant="elevated" style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }]}>
          <Card.Content>
            <View style={styles.row}>
              <Text style={[styles.label, { color: themeColors.text }]}>Image autoplay</Text>
              <Switch value={imageAutoplay} onValueChange={setImageAutoplay} />
            </View>
            <Text style={[styles.subHeader, { color: themeColors.textSecondary }]}>Media download rule</Text>
            {downloadRules.map((rule) => (
              <TouchableOpacity
                key={rule.value}
                style={[
                  styles.option,
                  { borderColor: themeColors.border },
                  mediaDownloadRule === rule.value && {
                    borderColor: themeColors.optionActiveText,
                    backgroundColor: themeColors.optionActiveBackground,
                  },
                ]}
                onPress={() => setMediaDownloadRule(rule.value)}
              >
                <Text style={[styles.optionText, { color: themeColors.text }]}>{rule.label}</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: { ...typography.body },
  subHeader: { ...typography.captionBold, marginBottom: spacing.sm },
  option: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  optionText: { ...typography.body },
});
