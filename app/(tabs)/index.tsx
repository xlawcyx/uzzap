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

const PROVINCE_NAME_BY_NORMALIZED = Object.values(PHILIPPINES_REGIONS)
  .flat()
  .reduce<Record<string, string>>((acc, province) => {
    acc[province.toLowerCase()] = province;
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
    return {
      region: PROVINCE_TO_REGION[matchingProvince],
      province: PROVINCE_NAME_BY_NORMALIZED[matchingProvince] ?? matchingProvince,
    };
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
    () => {
      if (selectedRegion === 'All Regions') {
        return Object.values(PHILIPPINES_REGIONS).flat().slice(0, 8);
      }

      return (PHILIPPINES_REGIONS[selectedRegion] || []).slice(0, 8);
    },
    [selectedRegion],
  );

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(province);
    setPickerModalVisible(false);

    if (province === 'All Provinces') return;

    const region = selectedRegion === 'All Regions' ? PROVINCE_TO_REGION[province.toLowerCase()] : selectedRegion;
    ensureProvinceChatroom(province, region);
  };

  const dynamicStyles = {
    container: { backgroundColor: themeColors.background },
    header: {
      backgroundColor: themeColors.background,
      borderBottomColor: themeColors.border,
    },
    hero: {
      backgroundColor: themeColors.backgroundCard,
      borderColor: withOpacity(colors.primary, 0.2),
    },
    heroTitle: { color: themeColors.text },
    heroSubtitle: { color: themeColors.textSecondary },
    statCard: {
      borderColor: isDark ? withOpacity(colors.primary, 0.15) : themeColors.border,
      backgroundColor: isDark ? withOpacity(colors.primary, 0.06) : themeColors.backgroundSecondary,
    },
    statLabel: { color: themeColors.textTertiary },
    resultsPill: {
      borderColor: themeColors.border,
      backgroundColor: themeColors.backgroundSecondary,
    },
    resultsPillText: { color: themeColors.textSecondary },
    resetBtn: {
      borderColor: themeColors.border,
    },
    resetBtnText: { color: themeColors.textSecondary },
    regionTab: {
      borderColor: themeColors.border,
      backgroundColor: themeColors.backgroundCard,
    },
    regionTabText: { color: themeColors.textTertiary },
    filterBtn: {
      borderColor: themeColors.border,
      backgroundColor: themeColors.backgroundSecondary,
    },
    filterLabel: { color: themeColors.textTertiary },
    filterValue: { color: themeColors.text },
    quickJoinWrap: { borderTopColor: themeColors.border },
    quickJoinTitle: { color: themeColors.text },
    quickJoinHint: { color: themeColors.textSecondary },
    activeFilterChip: {
      borderColor: withOpacity(colors.primary, 0.35),
      backgroundColor: withOpacity(colors.primary, 0.1),
    },
    activeFilterText: { color: colors.primary },
    roomCard: {
      backgroundColor: themeColors.backgroundCard,
      borderColor: themeColors.border,
    },
    roomName: { color: themeColors.text },
    roomDescription: { color: themeColors.textTertiary },
    emptyTitle: { color: themeColors.text },
    emptySubtitle: { color: themeColors.textSecondary },
    modalContent: {
      backgroundColor: themeColors.backgroundSecondary,
    },
    modalTitle: { color: themeColors.text },
    label: { color: themeColors.textSecondary },
    regionOption: {
      borderColor: themeColors.border,
      backgroundColor: themeColors.background,
    },
    regionOptionText: { color: themeColors.textSecondary },
    provinceOption: {
      borderColor: themeColors.border,
      backgroundColor: themeColors.background,
    },
    provinceOptionText: { color: themeColors.textSecondary },
    pickerContent: {
      backgroundColor: themeColors.backgroundSecondary,
      borderColor: themeColors.border,
    },
    pickerTitle: { color: themeColors.text },
    pickerItem: {
      borderBottomColor: themeColors.border,
    },
    pickerText: { color: themeColors.text },
  };

  const renderChatroom = ({ item, index }: { item: ChatroomItem; index: number }) => {
    const location = parseRoomLocation(item);

    return (
      <Animated.View entering={FadeInUp.delay(index * 80).duration(450)}>
        <Card
          variant="elevated"
          onPress={() => router.push(`/chatroom/${item.id}`)}
          style={[styles.roomCard, dynamicStyles.roomCard]}
        >
          <Card.Content style={styles.roomContent}>
            <View style={styles.roomIcon}>
              <Ionicons name="location" size={20} color={colors.accent} />
            </View>

            <View style={styles.roomInfo}>
              <Text style={[styles.roomName, dynamicStyles.roomName]}>{item.name}</Text>
              <Text style={styles.roomLocation}>{location.province} • {location.region}</Text>
              <Text style={[styles.roomDescription, dynamicStyles.roomDescription]} numberOfLines={1}>
                {item.description || 'Provincial community chatroom'}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={themeColors.textTertiary} />
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  return (
    <Container style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.screenTitle, dynamicStyles.heroTitle]}>Chatrooms</Text>

        <View style={styles.searchWrap}>
          <Input
            placeholder="Search by room, region, or province"
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Ionicons name="search" size={18} color={themeColors.textTertiary} />}
            clearable
          />
        </View>

        {hasActiveFilters ? (
          <View style={styles.activeFilterRow}>
            {selectedRegion !== 'All Regions' ? (
              <View style={[styles.activeFilterChip, dynamicStyles.activeFilterChip]}>
                <Text style={[styles.activeFilterText, dynamicStyles.activeFilterText]}>{selectedRegion}</Text>
              </View>
            ) : null}

            {selectedProvince !== 'All Provinces' ? (
              <View style={[styles.activeFilterChip, dynamicStyles.activeFilterChip]}>
                <Text style={[styles.activeFilterText, dynamicStyles.activeFilterText]}>{selectedProvince}</Text>
              </View>
            ) : null}

            {normalizedSearch.length > 0 ? (
              <View style={[styles.activeFilterChip, dynamicStyles.activeFilterChip]}>
                <Text style={[styles.activeFilterText, dynamicStyles.activeFilterText]}>“{searchQuery.trim()}”</Text>
              </View>
            ) : null}

            <TouchableOpacity onPress={clearAllFilters} style={styles.clearFilterBtn}>
              <Text style={[styles.clearFilterText, dynamicStyles.resetBtnText]}>Clear all</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={[styles.quickJoinWrap, dynamicStyles.quickJoinWrap]}>
          <Text style={[styles.quickJoinTitle, dynamicStyles.quickJoinTitle]}>Quick join</Text>
          <Text style={[styles.quickJoinHint, dynamicStyles.quickJoinHint]}>
            {selectedRegion === 'All Regions' ? 'Popular provinces across the Philippines.' : `Top provinces in ${selectedRegion}.`}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickJoinRow}>
            {quickJoinProvinces.map((province) => (
              <TouchableOpacity
                key={province}
                style={styles.quickJoinChip}
                onPress={() => handleProvinceSelect(province)}
                disabled={joiningProvince !== null}
              >
                <Text style={styles.quickJoinChipText}>{province}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.resultsHeader}>
          <View style={[styles.resultsPill, dynamicStyles.resultsPill]}>
            <Ionicons name="layers-outline" size={14} color={colors.accent} />
            <Text style={[styles.resultsPillText, dynamicStyles.resultsPillText]}>
              {filteredChatrooms.length} {filteredChatrooms.length === 1 ? 'room found' : 'rooms found'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.resetBtn, dynamicStyles.resetBtn]} onPress={() => openPicker('region')}>
            <Ionicons name="options-outline" size={14} color={themeColors.textSecondary} />
            <Text style={[styles.resetBtnText, dynamicStyles.resetBtnText]}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlashList
        data={filteredChatrooms}
        renderItem={renderChatroom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchChatrooms} tintColor={colors.accent} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="map-outline" size={76} color={themeColors.border} />
              <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>No rooms in this filter yet</Text>
              <Text style={[styles.emptySubtitle, dynamicStyles.emptySubtitle]}>Try another province to auto-create and join its chatroom.</Text>
              {hasActiveFilters ? (
                <Button variant="ghost" onPress={clearAllFilters} style={styles.emptyGhostButton}>
                  Clear Filters
                </Button>
              ) : null}
            </View>
          ) : null
        }
      />

      {selectedProvince !== 'All Provinces' ? (
        <View style={styles.stickyJoinWrap}>
          <Button
            variant="primary"
            onPress={() => ensureProvinceChatroom(selectedProvince, selectedRegion === 'All Regions' ? undefined : selectedRegion)}
            disabled={joiningProvince !== null}
          >
            {joiningProvince === selectedProvince ? 'Joining province...' : `Join ${selectedProvince}`}
          </Button>
        </View>
      ) : null}

      <Modal visible={pickerModalVisible} animationType="fade" transparent onRequestClose={() => setPickerModalVisible(false)}>
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContent, dynamicStyles.pickerContent]}>
            <Text style={[styles.pickerTitle, dynamicStyles.pickerTitle]}>{pickerType === 'region' ? 'Choose Region' : 'Choose Province'}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.pickerList}>
              {(pickerType === 'region' ? REGION_OPTIONS : regionProvinces).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    if (pickerType === 'region') {
                      applyRegion(option);
                    } else {
                      handleProvinceSelect(option);
                    }
                  }}
                  style={[styles.pickerItem, dynamicStyles.pickerItem]}
                >
                  <Text style={[styles.pickerText, dynamicStyles.pickerText]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button variant="ghost" onPress={() => setPickerModalVisible(false)}>Close</Button>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  screenTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
  },
  hero: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  heroTitle: { ...typography.h4, color: colors.text, fontWeight: '700' },
  heroSubtitle: { ...typography.small, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 18 },
  heroStats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  statCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.15),
    backgroundColor: withOpacity(colors.primary, 0.06),
  },
  statValue: { ...typography.h4, color: colors.primary },
  statLabel: { ...typography.tiny, color: colors.textTertiary, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  searchWrap: { paddingHorizontal: spacing.md },
  resultsHeader: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  resultsPillText: { ...typography.smallBold, color: colors.textSecondary },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  resetBtnText: { ...typography.smallBold, color: colors.textSecondary },
  regionsContainer: { paddingHorizontal: spacing.md, gap: spacing.sm },
  regionTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  regionTabActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  regionTabText: { ...typography.smallBold, color: colors.textTertiary },
  regionTabTextActive: { color: colors.textInverse, fontWeight: '700' },
  filterRow: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  filterBtnDisabled: { opacity: 0.55 },
  filterLabel: { ...typography.tiny, color: colors.textTertiary },
  filterValue: { ...typography.smallBold, color: colors.text, marginTop: 2 },
  quickJoinWrap: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  quickJoinTitle: { ...typography.smallBold, color: colors.text },
  quickJoinHint: { ...typography.caption, color: colors.textSecondary },
  quickJoinRow: { gap: spacing.sm, paddingVertical: 2 },
  quickJoinChip: {
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.3),
    backgroundColor: withOpacity(colors.primary, 0.08),
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  quickJoinChipText: { ...typography.smallBold, color: colors.primary },
  clearFilterBtn: { paddingHorizontal: spacing.xs, paddingVertical: 6 },
  clearFilterText: { ...typography.smallBold, color: colors.textSecondary },
  joinActionWrap: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  activeFilterRow: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activeFilterChip: {
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.35),
    backgroundColor: withOpacity(colors.primary, 0.1),
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  activeFilterText: { ...typography.smallBold, color: colors.primary },
  listContent: { padding: spacing.md, paddingBottom: 140 },
  stickyJoinWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.xl + 52,
  },
  roomCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundCard,
    borderColor: colors.border,
    borderWidth: 1,
  },
  roomContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  roomIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: withOpacity(colors.primary, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  roomInfo: { flex: 1 },
  roomName: { ...typography.captionBold, color: colors.text, fontSize: 16 },
  roomLocation: { ...typography.small, color: colors.primary, marginTop: 2 },
  roomDescription: { ...typography.small, color: colors.textTertiary, marginTop: 3 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xxl,
  },
  emptyGhostButton: { marginTop: spacing.lg },
  createButton: { marginTop: spacing.xl, paddingHorizontal: spacing.xl },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    elevation: 10,
    zIndex: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 44, 34, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.h2, color: colors.text, flex: 1, marginRight: spacing.md },
  modalBody: { marginBottom: spacing.md },
  label: {
    ...typography.smallBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  regionOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  regionOptionActive: { backgroundColor: colors.primary, borderColor: colors.accent },
  regionOptionText: { ...typography.caption, color: colors.textSecondary },
  regionOptionTextActive: { color: colors.text, fontWeight: '700' },
  provinceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  provinceOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  provinceOptionActive: { backgroundColor: colors.backgroundTertiary, borderColor: colors.accent },
  provinceOptionText: { ...typography.caption, color: colors.textSecondary },
  provinceOptionTextActive: { color: colors.text, fontWeight: '700' },
  modalCreateBtn: { marginTop: spacing.lg, marginBottom: spacing.xl },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  pickerContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.md },
  pickerList: { marginBottom: spacing.md },
  pickerItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerText: { ...typography.body, color: colors.text },
});
