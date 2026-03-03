import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, withOpacity, shadows } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Card, Avatar, Container, Button, Input } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/store/useAuthStore';
import { buddyService } from '@/services/buddyService';
import { chatroomService } from '@/services/chatroomService';

export default function BuddiesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const { colors: themeColors, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('My Buddies');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: buddies, isLoading: buddiesLoading, refetch: refetchBuddies } = useQuery({
    queryKey: ['buddies', profile?.id],
    queryFn: async () => {
      return buddyService.getBuddies(profile!.id);
    },
    enabled: !!profile?.id,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['searchProfiles', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      return buddyService.searchBuddies(searchQuery);
    },
    enabled: !!searchQuery,
  });

  const { data: buddyRequests, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ['buddyRequests', profile?.id],
    queryFn: async () => buddyService.getBuddyRequests(profile!.id),
    enabled: !!profile?.id,
  });

  const handleAddBuddy = async (buddyId: string) => {
    if (!profile) return;
    try {
      await buddyService.sendBuddyRequest(profile.id, buddyId);
      
      Alert.alert('Success', 'Buddy request sent!');
      queryClient.invalidateQueries({ queryKey: ['buddies'] });
      queryClient.invalidateQueries({ queryKey: ['buddyRequests'] });
    } catch {
      Alert.alert('Error', 'Failed to add buddy');
    }
  };

  const handleAcceptRequest = async (requestId: string, senderId: string) => {
    if (!profile) return;
    try {
      await buddyService.acceptBuddyRequest(requestId, senderId, profile.id);
      Alert.alert('Success', 'Buddy request accepted!');
      queryClient.invalidateQueries({ queryKey: ['buddies'] });
      queryClient.invalidateQueries({ queryKey: ['buddyRequests'] });
    } catch {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await buddyService.declineBuddyRequest(requestId);
      queryClient.invalidateQueries({ queryKey: ['buddyRequests'] });
    } catch {
      Alert.alert('Error', 'Failed to decline request');
    }
  };

  const handleStartDirectChat = async (buddyId: string) => {
    if (!profile) return;
    try {
      const room = await chatroomService.createDirectChat(profile.id, buddyId);
      if (room) {
        router.push(`/chatroom/${room.id}`);
      }
    } catch {
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const renderBuddy = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
      <Card variant="elevated" style={[styles.buddyCard, { backgroundColor: themeColors.backgroundCard, borderColor: themeColors.border }]}>
        <Card.Content style={styles.buddyContent}>
          <Avatar source={{ uri: item.avatar_url }} size="md" />
          <View style={styles.buddyInfo}>
            <Text style={[styles.buddyName, { color: themeColors.text }]}>{item.display_name || 'User'}</Text>
            <Text style={[styles.buddyStatus, { color: themeColors.textSecondary }]} numberOfLines={1}>
              {item.status_message || 'Online'}
            </Text>
          </View>
          <View style={styles.buddyActions}>
            <TouchableOpacity style={[styles.actionIcon, { backgroundColor: withOpacity(colors.primary, 0.1), borderColor: withOpacity(colors.primary, 0.2) }]} onPress={() => handleStartDirectChat(item.id)}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionIcon, { backgroundColor: withOpacity(colors.primary, 0.1), borderColor: withOpacity(colors.primary, 0.2) }]} onPress={() => router.push(`/profile/${item.id}`)}>
              <Ionicons name="person-outline" size={22} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderSearchResult = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
      <Card variant="elevated" style={[styles.buddyCard, { backgroundColor: themeColors.backgroundCard, borderColor: themeColors.border }]}>
        <Card.Content style={styles.buddyContent}>
          <Avatar source={{ uri: item.avatar_url }} size="md" />
          <View style={styles.buddyInfo}>
            <Text style={[styles.buddyName, { color: themeColors.text }]}>{item.display_name || 'User'}</Text>
            <Text style={[styles.buddyStatus, { color: themeColors.textSecondary }]} numberOfLines={1}>{item.region}</Text>
          </View>
          {item.id !== profile?.id && (
            <Button
              variant="primary"
              size="sm"
              onPress={() => handleAddBuddy(item.id)}
              style={styles.addBtn}
            >
              Add
            </Button>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderBuddyCard = ({ item, index }: { item: any; index: number }) => (
    activeTab === 'My Buddies'
      ? renderBuddy({ item, index })
      : activeTab === 'Find Buddies'
        ? renderSearchResult({ item, index })
        : renderRequest({ item, index })
  );

  const renderRequest = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
      <Card variant="elevated" style={[styles.buddyCard, { backgroundColor: themeColors.backgroundCard, borderColor: themeColors.border }]}>
        <Card.Content style={styles.buddyContent}>
          <Avatar source={{ uri: item.sender?.avatar_url }} size="md" />
          <View style={styles.buddyInfo}>
            <Text style={[styles.buddyName, { color: themeColors.text }]}>{item.sender?.display_name || item.sender?.username || 'User'}</Text>
            <Text style={[styles.buddyStatus, { color: themeColors.textSecondary }]}>Sent you a buddy request</Text>
          </View>
          <View style={styles.requestActions}>
            <Button variant="primary" size="sm" onPress={() => handleAcceptRequest(item.id, item.sender_id)}>Accept</Button>
            <Button variant="ghost" size="sm" onPress={() => handleDeclineRequest(item.id)}>Decline</Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
        <View style={[styles.summaryCard, { backgroundColor: themeColors.backgroundCard }]}>
          <Text style={[styles.summaryTitle, { color: themeColors.text }]}>Your buddy hub</Text>
          <Text style={[styles.summarySubtitle, { color: themeColors.textSecondary }]}>Manage connections, discover new people, and never miss a request.</Text>
          <View style={styles.summaryStats}>
            <View style={[styles.summaryStatItem, { backgroundColor: isDark ? withOpacity(colors.primary, 0.1) : themeColors.backgroundTertiary, borderColor: isDark ? withOpacity(colors.primary, 0.2) : themeColors.border }]}>
              <Text style={[styles.summaryStatValue, { color: colors.primary }]}>{buddies?.length || 0}</Text>
              <Text style={[styles.summaryStatLabel, { color: themeColors.textTertiary }]}>Buddies</Text>
            </View>
            <View style={[styles.summaryStatItem, { backgroundColor: isDark ? withOpacity(colors.primary, 0.1) : themeColors.backgroundTertiary, borderColor: isDark ? withOpacity(colors.primary, 0.2) : themeColors.border }]}>
              <Text style={[styles.summaryStatValue, { color: colors.primary }]}>{buddyRequests?.length || 0}</Text>
              <Text style={[styles.summaryStatLabel, { color: themeColors.textTertiary }]}>Requests</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setActiveTab('My Buddies')}
            style={[styles.tab, { borderColor: themeColors.border, backgroundColor: themeColors.backgroundCard }, activeTab === 'My Buddies' && [styles.activeTab, { backgroundColor: colors.primary, borderColor: colors.primaryDark }]]}
          >
            <Text style={[styles.tabText, { color: themeColors.textTertiary }, activeTab === 'My Buddies' && [styles.activeTabText, { color: colors.textInverse }]]}>My Buddies</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('Find Buddies')}
            style={[styles.tab, { borderColor: themeColors.border, backgroundColor: themeColors.backgroundCard }, activeTab === 'Find Buddies' && [styles.activeTab, { backgroundColor: colors.primary, borderColor: colors.primaryDark }]]}
          >
            <Text style={[styles.tabText, { color: themeColors.textTertiary }, activeTab === 'Find Buddies' && [styles.activeTabText, { color: colors.textInverse }]]}>Find Buddies</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('Requests')}
            style={[styles.tab, { borderColor: themeColors.border, backgroundColor: themeColors.backgroundCard }, activeTab === 'Requests' && [styles.activeTab, { backgroundColor: colors.primary, borderColor: colors.primaryDark }]]}
          >
            <Text style={[styles.tabText, { color: themeColors.textTertiary }, activeTab === 'Requests' && [styles.activeTabText, { color: colors.textInverse }]]}>Requests</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Find Buddies' && (
          <View style={styles.searchBar}>
            <Input
              placeholder="Search buddies by name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Ionicons name="search" size={20} color={themeColors.textTertiary} />}
              clearable
            />
          </View>
        )}
      </View>

      <FlashList
        data={activeTab === 'My Buddies' ? buddies : activeTab === 'Find Buddies' ? searchResults : buddyRequests}
        renderItem={renderBuddyCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          activeTab === 'My Buddies' ? (
            <RefreshControl refreshing={buddiesLoading} onRefresh={refetchBuddies} tintColor={colors.accent} />
          ) : activeTab === 'Requests' ? (
            <RefreshControl refreshing={requestsLoading} onRefresh={refetchRequests} tintColor={colors.accent} />
          ) : undefined
        }
        ListEmptyComponent={
          !buddiesLoading && !searchLoading && !requestsLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name={
                  activeTab === 'My Buddies' ? 'people-outline' : activeTab === 'Find Buddies' ? 'search-outline' : 'mail-outline'
                }
                size={80}
                color={themeColors.border}
              />
              <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
                {activeTab === 'My Buddies' ? 'No buddies yet' : activeTab === 'Find Buddies' ? 'Search for buddies' : 'No requests'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
                {activeTab === 'My Buddies'
                  ? 'Start by finding new buddies and sending requests!'
                  : activeTab === 'Find Buddies'
                    ? 'Enter a name in the search bar to find people to chat with.'
                    : 'Incoming buddy requests will appear here.'}
              </Text>
            </View>
          ) : null
        }
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  summaryTitle: {
    ...typography.h4,
    color: colors.text,
  },
  summarySubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  summaryStatItem: {
    flex: 1,
    backgroundColor: withOpacity(colors.primary, 0.06),
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.15),
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  summaryStatValue: {
    ...typography.h4,
    color: colors.primary,
  },
  summaryStatLabel: {
    ...typography.tiny,
    color: colors.textTertiary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  tabText: {
    ...typography.smallBold,
    color: colors.textTertiary,
    fontSize: 11,
  },
  activeTabText: {
    color: colors.textInverse,
  },
  searchBar: {
    padding: spacing.md,
    paddingTop: 0,
  },
  listContent: {
    padding: spacing.md,
  },
  buddyCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buddyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  buddyInfo: {
    flex: 1,
  },
  buddyName: {
    ...typography.h4,
    color: colors.text,
  },
  buddyStatus: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  buddyActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  requestActions: {
    gap: spacing.xs,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withOpacity(colors.primary, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  addBtn: {
    paddingHorizontal: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xxl,
  },
});
