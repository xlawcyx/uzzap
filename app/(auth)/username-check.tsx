import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Container, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function UsernameCheckScreen() {
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const normalized = useMemo(() => username.trim().toLowerCase(), [username]);

  const checkAvailability = async () => {
    if (!normalized) return;
    setChecking(true);
    const { data } = await supabase.from('profiles').select('id').eq('username', normalized).maybeSingle();
    setAvailable(!data);
    setChecking(false);
  };

  return (
    <Container style={styles.container} backgroundColor={themeColors.background}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]}>Username availability checker</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Reserve a handle that people can easily find and remember.</Text>

        <Input
          label="Username"
          placeholder="e.g. juan_does_chat"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          clearable
        />

        <Button variant="outline" onPress={checkAvailability} loading={checking}>
          Check availability
        </Button>

        {available !== null ? (
          <Text style={[styles.status, { color: available ? colors.success : colors.error }]}>
            {available ? `@${normalized} is available` : `@${normalized} is already taken`}
          </Text>
        ) : null}


        <View style={styles.footer}>
          <Button variant="outline" onPress={() => router.back()}>
            Back
          </Button>
          <Button variant="primary" onPress={() => router.push('/(auth)/email-verification' as any)} disabled={!available}>
            Continue
          </Button>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {},
  content: { flex: 1, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h2 },
  subtitle: { ...typography.body },
  status: { ...typography.captionBold },
  footer: { marginTop: 'auto', flexDirection: 'row', gap: spacing.sm },
});
