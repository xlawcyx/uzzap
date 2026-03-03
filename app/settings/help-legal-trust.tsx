import React from 'react';
import { Href, Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';

type SettingsLink = {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  href: Href;
};

const helpItems: SettingsLink[] = [
  { title: 'Help center / FAQ', icon: 'help-buoy-outline', href: '/settings/help-center' as Href },
  { title: 'Contact support / ticket submission', icon: 'mail-outline', href: '/settings/contact-support' as Href },
  { title: 'In-app feedback / feature requests', icon: 'bulb-outline', href: '/settings/feedback' as Href },
  { title: 'Changelog / What’s new', icon: 'sparkles-outline', href: '/settings/changelog' as Href },
  { title: 'About this app', icon: 'information-circle-outline', href: '/settings/about' as Href },
];

const legalItems: SettingsLink[] = [
  { title: 'Terms of service', icon: 'document-text-outline', href: '/settings/terms-of-service' as Href },
  { title: 'Privacy policy', icon: 'lock-closed-outline', href: '/settings/privacy-policy' as Href },
  { title: 'Community guidelines', icon: 'people-outline', href: '/settings/community-guidelines' as Href },
  { title: 'Open-source licenses', icon: 'code-slash-outline', href: '/settings/open-source-licenses' as Href },
];

export default function HelpLegalTrustScreen() {
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Help, Legal & Trust', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <View style={styles.content}>
        <Card variant="elevated" style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Help</Text>
            {helpItems.map((item) => (
              <TouchableOpacity key={String(item.href)} style={styles.row} onPress={() => router.push(item.href)}>
                <View style={styles.rowLeft}>
                  <Ionicons name={item.icon} size={18} color={colors.accent} />
                  <Text style={[styles.rowLabel, { color: themeColors.textSecondary }]}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={themeColors.textTertiary} />
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionTitle, styles.sectionSpacing, { color: themeColors.text }]}>Legal & Trust</Text>
            {legalItems.map((item) => (
              <TouchableOpacity key={String(item.href)} style={styles.row} onPress={() => router.push(item.href)}>
                <View style={styles.rowLeft}>
                  <Ionicons name={item.icon} size={18} color={colors.primary} />
                  <Text style={[styles.rowLabel, { color: themeColors.textSecondary }]}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={themeColors.textTertiary} />
              </TouchableOpacity>
            ))}
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
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionSpacing: {
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
});
