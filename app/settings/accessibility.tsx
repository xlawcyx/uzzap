import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';
import { useAppTheme } from '@/hooks/useAppTheme';

const fontScaleOptions = [0.9, 1.0, 1.2, 1.4];

export default function AccessibilitySettingsScreen() {
  const { fontScale, setFontScale, highContrast, setHighContrast, reduceMotion, setReduceMotion } = useAppSettingsStore();
  const { colors: themeColors } = useAppTheme();

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Accessibility', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <View style={styles.content}>
        <Card variant="elevated" style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }]}>
          <Card.Content>
            <Text style={[styles.subHeader, { color: themeColors.textSecondary }]}>Font size ({fontScale.toFixed(1)}x)</Text>
            {fontScaleOptions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.option,
                  { borderColor: themeColors.border },
                  fontScale === item && {
                    borderColor: themeColors.optionActiveText,
                    backgroundColor: themeColors.optionActiveBackground,
                  },
                ]}
                onPress={() => setFontScale(item)}
              >
                <Text style={[styles.optionText, { color: themeColors.text }]}>{item.toFixed(1)}x</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.row}>
              <Text style={[styles.label, { color: themeColors.text }]}>High contrast mode</Text>
              <Switch value={highContrast} onValueChange={setHighContrast} />
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: themeColors.text }]}>Reduce motion</Text>
              <Switch value={reduceMotion} onValueChange={setReduceMotion} />
            </View>
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
  subHeader: { ...typography.captionBold, marginBottom: spacing.sm },
  option: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  optionText: { ...typography.body },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  label: { ...typography.body },
});
