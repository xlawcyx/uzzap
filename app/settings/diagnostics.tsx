import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import Constants from 'expo-constants';
import { Container, Card, Button } from '@/components/ui';
import { spacing, typography } from '@/constants/design';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function DiagnosticsScreen() {
  const { diagnosticsMode, setDiagnosticsMode, crashReports, setCrashReports } = useAppSettingsStore();
  const { colors: themeColors } = useAppTheme();

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Diagnostics', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <View style={styles.content}>
        <Card variant="elevated" style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }]}>
          <Card.Content>
            <Text style={[styles.title, { color: themeColors.text }]}>Support diagnostics</Text>
            <Text style={[styles.meta, { color: themeColors.textSecondary }]}>App version: {Constants.expoConfig?.version ?? 'unknown'}</Text>
            <Text style={[styles.meta, { color: themeColors.textSecondary }]}>Runtime: {Constants.executionEnvironment}</Text>

            <View style={styles.row}>
              <Text style={[styles.label, { color: themeColors.text }]}>Enable debug mode</Text>
              <Switch value={diagnosticsMode} onValueChange={setDiagnosticsMode} />
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: themeColors.text }]}>Share crash reports</Text>
              <Switch value={crashReports} onValueChange={setCrashReports} />
            </View>

            <Button variant="outline" onPress={() => Alert.alert('Copied', 'Diagnostic payload copied for support (simulated).')}>
              Copy diagnostic payload
            </Button>
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
  title: { ...typography.h4, marginBottom: spacing.xs },
  meta: { ...typography.caption },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  label: { ...typography.body },
});
