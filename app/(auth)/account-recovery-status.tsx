import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, Container } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function AccountRecoveryStatusScreen() {
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();

  return (
    <Container style={styles.container} backgroundColor={themeColors.background}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]}>Account recovery status</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Track your recovery request and next actions.</Text>

        <Card variant="elevated" style={{ ...styles.card, backgroundColor: themeColors.backgroundSecondary }}>
          <Card.Content>
            <View style={styles.row}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.rowText, { color: themeColors.text }]}>Recovery request received</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="time-outline" size={20} color={colors.warning} />
              <Text style={[styles.rowText, { color: themeColors.text }]}>Identity review in progress</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="mail-outline" size={20} color={themeColors.textSecondary} />
              <Text style={[styles.rowText, { color: themeColors.text }]}>Estimated update: within 24 hours</Text>
            </View>
          </Card.Content>
        </Card>

        <Button variant="primary" onPress={() => router.push('/(auth)/forgot-password' as any)}>
          Resend reset email
        </Button>
        <Button variant="ghost" onPress={() => router.replace('/(auth)/login' as any)}>
          Back to login
        </Button>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  card: { backgroundColor: colors.backgroundSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  rowText: { ...typography.caption, color: colors.text },
});
