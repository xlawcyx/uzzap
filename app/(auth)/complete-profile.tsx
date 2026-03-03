import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Container, Input } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { spacing, typography } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function CompleteProfileWizardScreen() {
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();
  const { updateProfile } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Display name required', 'Please enter your display name to continue.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        status_message: statusMessage.trim() || null,
        bio: bio.trim() || null,
      });
      router.push('/(auth)/invite-friends' as any);
    } catch {
      Alert.alert('Unable to save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container style={styles.container} backgroundColor={themeColors.background}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]}>Complete your profile</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>This helps buddies recognize you and start better conversations.</Text>

        <Input label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Your display name" />
        <Input label="Status message" value={statusMessage} onChangeText={setStatusMessage} placeholder="What are you up to?" />
        <Input
          label="Short bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Share your hobbies or goals"
          multiline
          numberOfLines={3}
        />

        <View style={styles.footer}>
          <Button variant="primary" onPress={saveProfile} loading={saving}>
            Save & continue
          </Button>
          <Button variant="ghost" onPress={() => router.replace('/(tabs)')}>
            Skip for now
          </Button>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {},
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h2 },
  subtitle: { ...typography.body },
  footer: { marginTop: 'auto', gap: spacing.sm },
});
