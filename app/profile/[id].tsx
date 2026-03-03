import React from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Container, Avatar, Card, Button } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { buddyService } from '@/services/buddyService';
import { chatroomService } from '@/services/chatroomService';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile: currentUserProfile } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors: themeColors } = useAppTheme();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: buddyRelationship } = useQuery({
    queryKey: ['buddyRelationship', id, currentUserProfile?.id],
    queryFn: async () => {
      if (!currentUserProfile || !id) return 'none';
      return buddyService.getBuddyRelationship(currentUserProfile.id, id);
    },
    enabled: !!currentUserProfile && !!id,
  });

  const handleAddBuddy = async () => {
    if (!currentUserProfile || !id) return;

    try {
      await buddyService.sendBuddyRequest(currentUserProfile.id, id as string);

      Alert.alert('Success', 'Buddy request sent!');
      queryClient.invalidateQueries({ queryKey: ['buddyRelationship', id] });
      queryClient.invalidateQueries({ queryKey: ['buddyRequests'] });
    } catch {
      Alert.alert('Error', 'Failed to add buddy');
    }
  };

  const handleStartDirectChat = async () => {
    if (!currentUserProfile || !id) return;
    try {
      const room = await chatroomService.createDirectChat(currentUserProfile.id, id as string);
      if (room) {
        router.push(`/chatroom/${room.id}`);
      }
    } catch {
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  if (isLoading) {
    return (
      <Container style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Container>
    );
  }

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Profile', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: themeColors.backgroundSecondary }]}>
          <Avatar source={profile?.avatar_url ? { uri: profile.avatar_url } : undefined} size="xl" />
          <Text style={[styles.userName, { color: themeColors.text }]}>{profile?.display_name || 'Buddy'}</Text>
          <Text style={[styles.userRegion, { color: themeColors.textSecondary }]}>{profile?.region || 'International'}</Text>

          {id !== currentUserProfile?.id && (
            <View style={styles.actions}>
              {buddyRelationship === 'accepted' ? (
                <Button
                  variant="outline"
                  leftIcon={<Ionicons name="chatbubble-outline" size={20} color={colors.primary} />}
                  onPress={handleStartDirectChat}
                  style={styles.actionBtn}
                >
                  Message
                </Button>
              ) : (
                <Button
                  variant="primary"
                  leftIcon={<Ionicons name="person-add-outline" size={20} color={colors.white} />}
                  onPress={handleAddBuddy}
                  style={styles.actionBtn}
                  disabled={buddyRelationship === 'pending'}
                >
                  {buddyRelationship === 'pending' ? 'Request Sent' : 'Add Buddy'}
                </Button>
              )}
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Card variant="elevated" style={[styles.infoCard, { backgroundColor: themeColors.backgroundSecondary }]}>
            <Card.Content>
              <Text style={[styles.infoLabel, { color: themeColors.textTertiary }]}>Status Message</Text>
              <Text style={[styles.infoValue, { color: themeColors.text }]}>
                {profile?.status_message || 'No status message set.'}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    ...shadows.md,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  userRegion: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actionBtn: {
    minWidth: 140,
  },
  content: {
    padding: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.backgroundSecondary,
  },
  infoLabel: {
    ...typography.tiny,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
  },
});
