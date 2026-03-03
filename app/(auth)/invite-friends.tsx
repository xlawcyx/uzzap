import React from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, Container } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';

const REFERRAL_CODE = 'UZZAP-BUDDY-2026';

export default function InviteFriendsScreen() {
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();

  const handleShare = async () => {
    await Share.share({
      message: `Join me on Uzzap Buddy Chat! Use my referral code: ${REFERRAL_CODE}`,
    });
  };

  return (
    <Container style={styles.container} backgroundColor={themeColors.background}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]}>Invite friends</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Grow your network faster by inviting friends with your referral code.</Text>

        <Card variant="elevated" style={{ ...styles.card, backgroundColor: themeColors.backgroundSecondary }}>
          <Card.Content>
            <Text style={[styles.codeLabel, { color: themeColors.textTertiary }]}>Referral code</Text>
            <Text style={[styles.codeValue, { color: colors.primary }]}>{REFERRAL_CODE}</Text>
          </Card.Content>
        </Card>

        <Button variant="primary" onPress={handleShare}>
          Share invite link
        </Button>
        <Button variant="outline" onPress={() => router.replace('/(tabs)')}>
          Finish setup
        </Button>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {},
  content: { flex: 1, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h2 },
  subtitle: { ...typography.body },
  card: {},
  codeLabel: { ...typography.caption },
  codeValue: { ...typography.h3, color: colors.primary, marginTop: spacing.xs },
});
