import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl, ScrollView, Modal, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows, withOpacity } from '@/constants/design';
import { Card, Container, Button, Input } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useChatStore } from '@/store/useChatStore';
import { LinearGradient } from 'expo-linear-gradient';

type ChatroomItem = {
  id: string;
  name: string;
  description?: string | null;
  region?: string | null;
  province?: string | null;
  category?: string | null;
  member_count?: number;
};

const PHILIPPINES_REGIONS: Record<string, string[]> = {
  'NCR (Metro Manila)': [
    'Caloocan',
    'Las Piñas',
    'Makati',
    'Malabon',
    'Mandaluyong',
    'Manila',
    'Marikina',
    'Muntinlupa',
    'Navotas',
    'Parañaque',
    'Pasay',
    'Pasig',
    'Quezon City',
    'San Juan',
    'Taguig',
    'Valenzuela',
    'Pateros',
  ],
  'CAR (Cordillera Administrative Region)': ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province'],
  'Region I (Ilocos Region)': ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'],
  'Region II (Cagayan Valley)': ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'],
  'Region III (Central Luzon)': ['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales'],
  'Region IV-A (CALABARZON)': ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal'],
  'Region IV-B (MIMAROPA)': ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon'],
  'Region V (Bicol Region)': ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'],
  'Region VI (Western Visayas)': ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo', 'Negros Occidental'],
  'Region VII (Central Visayas)': ['Bohol', 'Cebu', 'Negros Oriental', 'Siquijor'],
  'Region VIII (Eastern Visayas)': ['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte'],
  'Region IX (Zamboanga Peninsula)': ['Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'],
  'Region X (Northern Mindanao)': ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental'],
  'Region XI (Davao Region)': ['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental'],
  'Region XII (SOCCSARGEN)': ['Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat'],
  'Region XIII (Caraga)': ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur'],
  'BARMM': ['Basilan', 'Lanao del Sur', 'Maguindanao del Norte', 'Maguindanao del Sur', 'Sulu', 'Tawi-Tawi', 'Cotabato City'],
};

const REGION_OPTIONS = ['All Regions', ...Object.keys(PHILIPPINES_REGIONS)];

const PROVINCE_TO_REGION = Object.entries(PHILIPPINES_REGIONS).reduce<Record<string, string>>((acc, [region, provinces]) => {
  provinces.forEach((province) => {
    acc[province.toLowerCase()] = region;
  });
  return acc;
}, {});

const parseRoomLocation = (room: ChatroomItem) => {
  const description = room.description || '';
  const match = description.match(/^(.+?)\s*>\s*(.+?)(?::\s*|$)/);

  if (room.region && room.province) {
    return { region: room.region, province: room.province };
  }

  if (room.region && !room.province) {
    return { region: room.region, province: 'Unspecified Province' };
  }

  if (match) {
    return { region: match[1].trim(), province: match[2].trim() };
  }

  const fallbackRegion = Object.keys(PHILIPPINES_REGIONS).find((region) => room.name.includes(region));
  if (fallbackRegion) {
    return { region: fallbackRegion, province: 'Unspecified Province' };
  }

  const matchingProvince = Object.keys(PROVINCE_TO_REGION).find((province) =>
    `${room.name} ${description}`.toLowerCase().includes(province),
  );

  if (matchingProvince) {
    return { region: PROVINCE_TO_REGION[matchingProvince], province: matchingProvince };
  }

  return { region: 'Uncategorized', province: 'Unspecified Province' };
};

export default function ChatroomListScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { chatrooms, fetchChatrooms, isLoading } = useChatStore();
  const { colors: themeColors, isDark } = useAppTheme();

  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [searchQuery, setSearchQuery] = useState('');

  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'region' | 'province'>('region');
  const [joiningProvince, setJoiningProvince] = useState<string | null>(null);

  const ensureProvinceChatroom = async (province: string, regionHint?: string) => {
    if (joiningProvince) return;

    // Use the Supabase auth user ID (auth.uid()) for RLS compliance
    const authUserId = user?.id;

    if (!authUserId) {
      Alert.alert('Login required', 'Please log in to join a provincial chatroom.');
      return;
    }

    const region = regionHint || PROVINCE_TO_REGION[province.toLowerCase()] || 'Uncategorized';

    // Check in local state first
    const existingRoom = (chatrooms as ChatroomItem[]).find((room) => {
      const location = parseRoomLocation(room);
      return location.province.toLowerCase() === province.toLowerCase() && location.region === region;
    });

    if (existingRoom) {
      router.push(`/chatroom/${existingRoom.id}` as any);
      return;
    }

    // Also check Supabase directly in case store is stale
    const { data: dbRoom } = await supabase
      .from('chatrooms')
      .select('id')
      .eq('province', province)
      .eq('region', region)
      .maybeSingle();

    if (dbRoom) {
      await fetchChatrooms();
      router.push(`/chatroom/${dbRoom.id}` as any);
      return;
    }

    setJoiningProvince(province);

    try {
      const finalRoomName = `${province} Community`;
      const slug = `${province.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-community-${Date.now()}`;

      const { data, error } = await supabase
        .from('chatrooms')
        .insert({
          name: finalRoomName,
          slug,
          description: `${region} > ${province}: Local community chatroom`,
          type: 'public',
          region,
          province,
          category: 'Community',
          created_by: authUserId,
        })
        .select()
        .single();

      if (error) {
        console.error('Chatroom insert error:', error);
        throw error;
      }

      // Add creator as admin member
      await supabase
        .from('chatroom_members')
        .insert({ chatroom_id: data.id, user_id: authUserId, role: 'admin' });

      await fetchChatrooms();
      router.push(`/chatroom/${data.id}` as any);
    } catch (err: any) {
      console.error('ensureProvinceChatroom error:', err);
      Alert.alert('Error', 'Unable to join this province right now. Please try again.');
    } finally {
      setJoiningProvince(null);
    }
  };

  useEffect(() => {
    fetchChatrooms();
  }, [fetchChatrooms]);

  const regionProvinces = useMemo(
    () => ['All Provinces', ...(selectedRegion === 'All Regions' ? [] : PHILIPPINES_REGIONS[selectedRegion] || [])],
    [selectedRegion],
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const hasActiveFilters = selectedRegion !== 'All Regions' || selectedProvince !== 'All Provinces' || normalizedSearch.length > 0;
  const filteredChatrooms = (chatrooms as ChatroomItem[]).filter((room) => {
    const location = parseRoomLocation(room);
    const regionMatch = selectedRegion === 'All Regions' || location.region === selectedRegion;
    const provinceMatch = selectedProvince === 'All Provinces' || location.province.toLowerCase() === selectedProvince.toLowerCase();

    if (!normalizedSearch) return regionMatch && provinceMatch;

    return (
      regionMatch
      && provinceMatch
      && `${room.name} ${room.description || ''} ${location.region} ${location.province}`.toLowerCase().includes(normalizedSearch)
    );
  });

  const openPicker = (type: 'region' | 'province') => {
    setPickerType(type);
    setPickerModalVisible(true);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedRegion('All Regions');
    setSelectedProvince('All Provinces');
  };

  const applyRegion = (region: string) => {
    setSelectedRegion(region);
    setSelectedProvince('All Provinces');
    setPickerModalVisible(false);
  };

  const quickJoinProvinces = useMemo(
    () => (selectedRegion === 'All Regions' ? [] : (PHILIPPINES_REGIONS[selectedRegion] || []).slice(0, 6)),
    [selectedRegion],
  );

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(province);
    setPickerModalVisible(false);

    if (province === 'All Provinces') return;

    const region = selectedRegion === 'All Regions' ? PROVINCE_TO_REGION[province.toLowerCase()] : selectedRegion;
    ensureProvinceChatroom(province, region);
  };

  const renderChatroom = ({ item, index }: { item: ChatroomItem; index: number }) => {
    return (
      <Animated.View entering={FadeInUp.delay(index * 50).duration(500)}>
        <DiscoveryRoomCard
          room={item as any}
          onPress={() => router.push(`/chatroom/${item.id}`)}
        />
      </Animated.View>
    );
  };

  return (
    <Container style={styles.container} safeArea edges={['top']}>
      <LinearGradient
        colors={isDark ? ['#1E1B4B', '#000000'] : ['#F5F3FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: themeColors.textSecondary }]}>Hello, Buddy!</Text>
          <Text style={[styles.title, { color: themeColors.text }]}>Chatrooms</Text>
        </View>
        <TouchableOpacity
          style={[styles.profileBtn, { borderColor: themeColors.border, backgroundColor: themeColors.backgroundElevated }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <Input
          placeholder="Find a community..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search" size={20} color={colors.primary} />}
          clearable
          containerStyle={styles.searchInput}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: themeColors.backgroundElevated, borderColor: themeColors.border },
              selectedRegion !== 'All Regions' && styles.filterChipActive
            ]}
            onPress={() => openPicker('region')}
          >
            <Text style={[styles.filterChipText, { color: themeColors.textSecondary }, selectedRegion !== 'All Regions' && { color: colors.primary }]}>
              {selectedRegion === 'All Regions' ? 'Region' : selectedRegion}
            </Text>
            <Ionicons name="chevron-down" size={14} color={selectedRegion !== 'All Regions' ? colors.primary : themeColors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: themeColors.backgroundElevated, borderColor: themeColors.border },
              selectedProvince !== 'All Provinces' && styles.filterChipActive,
              selectedRegion === 'All Regions' && styles.filterChipDisabled
            ]}
            disabled={selectedRegion === 'All Regions'}
            onPress={() => openPicker('province')}
          >
            <Text style={[styles.filterChipText, { color: themeColors.textSecondary }, selectedProvince !== 'All Provinces' && { color: colors.primary }]}>
              {selectedProvince === 'All Provinces' ? 'Province' : selectedProvince}
            </Text>
            <Ionicons name="chevron-down" size={14} color={selectedProvince !== 'All Provinces' ? colors.primary : themeColors.textTertiary} />
          </TouchableOpacity>

          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearAllFilters}>
              <Text style={{ color: colors.error, ...typography.smallBold }}>Clear</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <FlashList
        data={filteredChatrooms}
        renderItem={renderChatroom}
        estimatedItemSize={180}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={themeColors.textDisabled} />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No rooms found</Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>Try adjusting your filters or search query</Text>
            <Button variant="outline" size="sm" onPress={clearAllFilters} style={{ marginTop: spacing.md }}>
              Reset Filters
            </Button>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchChatrooms}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      {/* Picker Modal */}
      <Modal
        visible={pickerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: themeColors.backgroundElevated }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                Select {pickerType === 'region' ? 'Region' : 'Province'}
              </Text>
              <TouchableOpacity onPress={() => setPickerModalVisible(false)}>
                <Ionicons name="close" size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {(pickerType === 'region' ? REGION_OPTIONS : regionProvinces).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.pickerItem, { borderBottomColor: themeColors.border }]}
                  onPress={() => (pickerType === 'region' ? applyRegion(item) : handleProvinceSelect(item))}
                >
                  <Text style={[styles.pickerText, { color: themeColors.text }, (pickerType === 'region' ? selectedRegion : selectedProvince) === item && { color: colors.primary, fontWeight: '700' }]}>
                    {item}
                  </Text>
                  {(pickerType === 'region' ? selectedRegion : selectedProvince) === item && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.smallBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...typography.h1,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  searchInput: {
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: withOpacity(colors.primary, 0.1),
  },
  filterChipDisabled: {
    opacity: 0.5,
  },
  filterChipText: {
    ...typography.smallBold,
  },
  clearBtn: {
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    paddingTop: spacing.xxxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
  },
  modalList: {
    paddingHorizontal: spacing.xl,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  pickerText: {
    ...typography.body,
  },
});