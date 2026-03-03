import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

type LinkRow = {
  title: string;
  subtitle: string;
  route: '/settings/appearance' | '/settings/language' | '/settings/data-saver' | '/settings/accessibility' | '/settings/storage-usage' | '/settings/connected-accounts' | '/settings/backup-export' | '/settings/diagnostics';
  icon: keyof typeof Ionicons.glyphMap;
};

const appControlItems: LinkRow[] = [
  { title: 'Appearance', subtitle: 'Dark, light, or system theme', route: '/settings/appearance', icon: 'color-palette-outline' },
  { title: 'Language', subtitle: 'Set your app language', route: '/settings/language', icon: 'language-outline' },
  { title: 'Data Saver', subtitle: 'Autoplay and media download rules', route: '/settings/data-saver', icon: 'cellular-outline' },
  { title: 'Accessibility', subtitle: 'Font size, contrast, and motion', route: '/settings/accessibility', icon: 'accessibility-outline' },
  { title: 'Storage Usage', subtitle: 'Check and clear media cache', route: '/settings/storage-usage', icon: 'folder-open-outline' },
  { title: 'Connected Accounts', subtitle: 'Manage linked sign-in providers', route: '/settings/connected-accounts', icon: 'link-outline' },
  { title: 'Backup & Export', subtitle: 'Backup schedule and export data', route: '/settings/backup-export', icon: 'cloud-upload-outline' },
  { title: 'Diagnostics', subtitle: 'Debug details for support', route: '/settings/diagnostics', icon: 'bug-outline' },
];

export default function AppControlsSettingsScreen() {
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Settings & App Controls', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card variant="elevated" style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }]}>
          <Card.Content>
            {appControlItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                style={[styles.row, { borderColor: themeColors.border }, index === appControlItems.length - 1 && styles.lastRow]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.iconWrap, { backgroundColor: themeColors.backgroundTertiary }]}>
                  <Ionicons name={item.icon} size={18} color={colors.accent} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.title, { color: themeColors.text }]}>{item.title}</Text>
                  <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={themeColors.border} />
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {},
  content: { padding: spacing.md },
  card: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  lastRow: { borderBottomWidth: 0 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: { flex: 1 },
  title: { ...typography.bodyBold },
  subtitle: { ...typography.caption },
});
