import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Container, Card } from '@/components/ui';
import { spacing, typography } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function PrivacySettingsScreen() {
  const { colors: themeColors } = useAppTheme();

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Privacy & Security', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <View style={styles.content}>
        <Card variant="elevated" style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }]}>
          <Card.Content>
            <Text style={[styles.title, { color: themeColors.text }]}>Privacy controls</Text>
            <Text style={[styles.item, { color: themeColors.textSecondary }]}>• Buddy-only direct chats are supported.</Text>
            <Text style={[styles.item, { color: themeColors.textSecondary }]}>• Presence is tracked while signed in.</Text>
            <Text style={[styles.item, { color: themeColors.textSecondary }]}>• Additional privacy controls can be configured in Supabase RLS.</Text>
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
  title: { ...typography.h4, marginBottom: spacing.sm },
  item: { ...typography.body, marginBottom: spacing.xs },
});
