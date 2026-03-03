import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { Container, Card, Button } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';
import { useAppTheme } from '@/hooks/useAppTheme';

const frequencies: ('daily' | 'weekly' | 'monthly')[] = ['daily', 'weekly', 'monthly'];

export default function BackupExportScreen() {
  const { autoBackup, setAutoBackup, backupFrequency, setBackupFrequency } = useAppSettingsStore();
  const { colors: themeColors } = useAppTheme();

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Backup & Export', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <View style={styles.content}>
        <Card variant="elevated" style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }]}>
          <Card.Content>
            <View style={styles.row}>
              <Text style={[styles.label, { color: themeColors.text }]}>Auto-backup</Text>
              <Switch value={autoBackup} onValueChange={setAutoBackup} />
            </View>

            <Text style={[styles.subHeader, { color: themeColors.textSecondary }]}>Backup frequency</Text>
            {frequencies.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.option,
                  { borderColor: themeColors.border },
                  backupFrequency === item && {
                    borderColor: themeColors.optionActiveText,
                    backgroundColor: themeColors.optionActiveBackground,
                  },
                ]}
                onPress={() => setBackupFrequency(item)}
              >
                <Text style={[styles.optionText, { color: themeColors.text }]}>
                  {item[0].toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}

            <Button variant="outline" onPress={() => Alert.alert('Export queued', 'Your data export will be delivered to your account email.') }>
              Export account data
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
