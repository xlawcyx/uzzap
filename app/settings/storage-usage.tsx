import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Container, Card, Button } from '@/components/ui';
import { spacing, typography } from '@/constants/design';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function StorageUsageScreen() {
  const { mediaCacheMB, clearMediaCache } = useAppSettingsStore();
  const { colors: themeColors } = useAppTheme();

  const handleClear = () => {
    clearMediaCache();
    Alert.alert('Cache cleared', 'Media cache was removed from this device.');
  };

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Storage Usage', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <View style={styles.content}>
        <Card variant="elevated" style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }]}>
          <Card.Content>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Media cache</Text>
            <Text style={[styles.value, { color: themeColors.text }]}>{mediaCacheMB} MB</Text>
            <Text style={[styles.helper, { color: themeColors.textSecondary }]}>Cached media helps open images faster. You can clear it anytime.</Text>
            <Button variant="outline" onPress={handleClear}>
              Clear media cache
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
  label: { ...typography.captionBold },
  value: { ...typography.h2, marginVertical: spacing.xs },
  helper: { ...typography.caption, marginBottom: spacing.md },
});
