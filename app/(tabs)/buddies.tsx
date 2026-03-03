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
import { LinearGradient } from 'expo-linear-gradient';

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
    <Animated.View entering={FadeInUp.delay(index * 50).duration(500)}>
      <TouchableOpacity 
        style={[
          styles.buddyCard, 
          { 
            backgroundColor: isDark ? 'rgba(28, 28, 30, 0.4)' : 'rgba(255, 255, 255, 0.8)', 
            borderColor: themeColors.border 
          }
        ]}
        onPress={() => router.push(`/profile/${item.id}`)}
        activeOpacity={0.8}
      >
        <Avatar source={{ uri: item.avatar_url }} size="lg" />
        <View style={styles.buddyInfo}>
          <Text style={[styles.buddyName, { color: themeColors.text }]}>{item.display_name || 'Buddy'}</Text>
          <Text style={[styles.buddyStatus, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {item.status_message || 'Online'}
          </Text>
        </View>
        <View style={styles.buddyActions}>
          <TouchableOpacity 
            style={[styles.actionIcon, { backgroundColor: withOpacity(colors.primary, 0.1) }]} 
            onPress={() => handleStartDirectChat(item.id)}
          >
            <Ionicons name="chatbubble" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSearchResult = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(500)}>
      <TouchableOpacity 
        style={[
          styles.buddyCard, 
          { 
            backgroundColor: isDark ? 'rgba(28, 28, 30, 0.4)' : 'rgba(255, 255, 255, 0.8)', 
            borderColor: themeColors.border 
          }
        ]}
        onPress={() => router.push(`/profile/${item.id}`)}
        activeOpacity={0.8}
      >
        <Avatar source={{ uri: item.avatar_url }} size="lg" />
        <View style={styles.buddyInfo}>
          <Text style={[styles.buddyName, { color: themeColors.text }]}>{item.display_name || 'Buddy'}</Text>
          <Text style={[styles.buddyStatus, { color: themeColors.textSecondary }]} numberOfLines={1}>{item.region || 'Philippines'}</Text>
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
      </TouchableOpacity>
    </Animated.View>
  );

  const renderRequest = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(500)}>
      <View 
        style={[
          styles.buddyCard, 
          { 
            backgroundColor: isDark ? 'rgba(28, 28, 30, 0.4)' : 'rgba(255, 255, 255, 0.8)', 
            borderColor: themeColors.border 
          }
        ]}
      >
        <Avatar source={{ uri: item.sender?.avatar_url }} size="lg" />
        <View style={styles.buddyInfo}>
          <Text style={[styles.buddyName, { color: themeColors.text }]}>{item.sender?.display_name || 'Buddy'}</Text>
          <Text style={[styles.buddyStatus, { color: themeColors.textSecondary }]}>Wants to be your buddy</Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity onPress={() => handleAcceptRequest(item.id, item.sender_id)} style={[styles.requestBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeclineRequest(item.id)} style={[styles.requestBtn, { backgroundColor: themeColors.backgroundTertiary }]}>
            <Ionicons name="close" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderBuddyCard = ({ item, index }: { item: any; index: number }) => (
    activeTab === 'My Buddies'
      ? renderBuddy({ item, index })
      : activeTab === 'Find Buddies'
        ? renderSearchResult({ item, index })
        : renderRequest({ item, index })
  );

  return (
    <Container style={styles.container} safeArea edges={['top']}>
      <LinearGradient
        colors={isDark ? ['#1E1B4B', '#000000'] : ['#F5F3FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Buddies</Text>
        
        <View style={[styles.tabsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
          {['My Buddies', 'Find Buddies', 'Requests'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && [styles.activeTab, { backgroundColor: themeColors.backgroundElevated }]
              ]}
            >
              <Text style={[
                styles.tabText, 
                { color: themeColors.textSecondary },
                activeTab === tab && { color: colors.primary }
              ]}>
                {tab === 'Requests' && buddyRequests?.length ? `${tab} (${buddyRequests.length})` : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Find Buddies' && (
          <View style={styles.searchSection}>
            <Input
              placeholder="Search by name or username..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Ionicons name="search" size={20} color={colors.primary} />}
              clearable
              containerStyle={styles.searchInput}
            />
          </View>
        )}
      </View>

      <FlashList
        data={activeTab === 'My Buddies' ? buddies : activeTab === 'Find Buddies' ? searchResults : buddyRequests}
        renderItem={renderBuddyCard}
        estimatedItemSize={100}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  title: { ...typography.h1 },
  tabsContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    ...shadows.sm,
  },
  tabText: { ...typography.smallBold },
  searchSection: {
    marginTop: -spacing.sm,
  },
  searchInput: {
    borderRadius: borderRadius.xl,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  buddyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  buddyInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  buddyName: { ...typography.h4 },
  buddyStatus: { ...typography.caption, marginTop: 2 },
  buddyActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    height: 36,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  requestBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyContainer: {
    paddingTop: spacing.xxxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  emptyTitle: { ...typography.h3, marginTop: spacing.md },
  emptySubtitle: { ...typography.body, textAlign: 'center', opacity: 0.7, paddingHorizontal: spacing.xxl },
});
