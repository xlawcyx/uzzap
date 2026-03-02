import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl, ScrollView, Modal, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Card, Container, Button, Input } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/store/useAuthStore';
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
  const { user, profile } = useAuthStore();
  const { chatrooms, fetchChatrooms, isLoading } = useChatStore();

  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [searchQuery, setSearchQuery] = useState('');

  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'region' | 'province'>('region');

  const ensureProvinceChatroom = async (province: string, regionHint?: string) => {
    const memberId = profile?.id || user?.id;

    if (!memberId) {
      Alert.alert('Login required', 'Please log in to join a provincial chatroom.');
      return;
    }

    const region = regionHint || PROVINCE_TO_REGION[province.toLowerCase()] || 'Uncategorized';
    const existingRoom = (chatrooms as ChatroomItem[]).find((room) => {
      const location = parseRoomLocation(room);
      return location.province.toLowerCase() === province.toLowerCase() && location.region === region;
    });

    if (existingRoom) {
      router.push(`/chatroom/${existingRoom.id}` as any);
      return;
    }

    try {
      const finalRoomName = `${province} Community`;
      const { data, error } = await supabase
        .from('chatrooms')
        .insert({
          name: finalRoomName,
          slug: `${finalRoomName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')}-${Date.now()}`,
          description: `${region} > ${province} Community chatroom`,
          type: 'public',
          region,
          province,
          category: 'Lifestyle',
          created_by: memberId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchChatrooms();
      router.push(`/chatroom/${data.id}` as any);
    } catch {
      Alert.alert('Error', 'Unable to join this province right now. Please try again.');
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

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(province);
    setPickerModalVisible(false);

    if (province === 'All Provinces') return;

    const region = selectedRegion === 'All Regions' ? PROVINCE_TO_REGION[province.toLowerCase()] : selectedRegion;
    Alert.alert('Join Chatroom', `Do you want to join ${province}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Join',
        onPress: () => ensureProvinceChatroom(province, region),
      },
    ]);
  };

  const renderChatroom = ({ item, index }: { item: ChatroomItem; index: number }) => {
    const location = parseRoomLocation(item);

    return (
      <Animated.View entering={FadeInUp.delay(index * 80).duration(450)}>
        <Card variant="elevated" onPress={() => router.push(`/chatroom/${item.id}`)} style={styles.roomCard}>
          <Card.Content style={styles.roomContent}>
            <View style={styles.roomIcon}>
              <Ionicons name="location" size={20} color={colors.accent} />
            </View>

            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{item.name}</Text>
              <Text style={styles.roomLocation}>{location.province} • {location.region}</Text>
              <Text style={styles.roomDescription} numberOfLines={1}>
                {item.description || 'Provincial community chatroom'}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  return (
    <Container style={styles.container}>
      <View style={styles.header}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Philippines Chatrooms</Text>
          <Text style={styles.heroSubtitle}>Choose a region, pick a province, and join local conversations faster.</Text>
          <View style={styles.heroStats}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Object.keys(PHILIPPINES_REGIONS).length}</Text>
              <Text style={styles.statLabel}>Regions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{filteredChatrooms.length}</Text>
              <Text style={styles.statLabel}>Matching rooms</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <TouchableOpacity style={styles.discoveryBtn} onPress={() => router.push('/chatrooms/discover' as any)}>
            <Ionicons name="compass-outline" size={18} color={colors.text} />
            <Text style={styles.discoveryBtnText}>Open Discovery & Growth</Text>
          </TouchableOpacity>

          <View style={styles.filterSummaryRow}>
            <View style={styles.resultsPill}>
              <Ionicons name="layers-outline" size={14} color={colors.accent} />
              <Text style={styles.resultsPillText}>{filteredChatrooms.length} rooms shown</Text>
            </View>
            {hasActiveFilters ? (
              <TouchableOpacity style={styles.resetBtn} onPress={clearAllFilters}>
                <Ionicons name="refresh-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.resetBtnText}>Reset filters</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Input
            placeholder="Search by room, region, or province"
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Ionicons name="search" size={18} color={colors.textTertiary} />}
            clearable
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionsContainer}>
          {REGION_OPTIONS.map((region) => (
            <TouchableOpacity
              key={region}
              onPress={() => applyRegion(region)}
              style={[styles.regionTab, selectedRegion === region && styles.regionTabActive]}
            >
              <Text style={[styles.regionTabText, selectedRegion === region && styles.regionTabTextActive]}>{region}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => openPicker('region')}>
            <Text style={styles.filterLabel}>Region</Text>
            <Text style={styles.filterValue} numberOfLines={1}>{selectedRegion}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, selectedRegion === 'All Regions' && styles.filterBtnDisabled]}
            onPress={() => openPicker('province')}
            disabled={selectedRegion === 'All Regions'}
          >
            <Text style={styles.filterLabel}>Province</Text>
            <Text style={styles.filterValue} numberOfLines={1}>{selectedProvince}</Text>
          </TouchableOpacity>
        </View>

        {hasActiveFilters ? (
          <View style={styles.activeFilterRow}>
            {selectedRegion !== 'All Regions' ? (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>{selectedRegion}</Text>
              </View>
            ) : null}

            {selectedProvince !== 'All Provinces' ? (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>{selectedProvince}</Text>
              </View>
            ) : null}

            {normalizedSearch.length > 0 ? (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>“{searchQuery.trim()}”</Text>
              </View>
            ) : null}
          </View>
        ) : null}
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
              <Ionicons name="map-outline" size={76} color={colors.border} />
              <Text style={styles.emptyTitle}>No rooms in this filter yet</Text>
              <Text style={styles.emptySubtitle}>Try another province to auto-create and join its chatroom.</Text>
              {hasActiveFilters ? (
                <Button variant="ghost" onPress={clearAllFilters} style={styles.emptyGhostButton}>
                  Clear Filters
                </Button>
              ) : null}
            </View>
          ) : null
        }
      />

      <Modal visible={pickerModalVisible} animationType="fade" transparent onRequestClose={() => setPickerModalVisible(false)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>{pickerType === 'region' ? 'Choose Region' : 'Choose Province'}</Text>
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
                  style={styles.pickerItem}
                >
                  <Text style={styles.pickerText}>{option}</Text>
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
  },
  hero: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  heroTitle: { ...typography.h3, color: colors.text },
  heroSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  heroStats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  statCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  statValue: { ...typography.h4, color: colors.accent },
  statLabel: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  searchWrap: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  discoveryBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  discoveryBtnText: { ...typography.smallBold, color: colors.text },
  filterSummaryRow: {
    marginBottom: spacing.sm,
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
    backgroundColor: colors.backgroundSecondary,
  },
  regionTabActive: { backgroundColor: colors.primary, borderColor: colors.accent },
  regionTabText: { ...typography.smallBold, color: colors.textSecondary },
  regionTabTextActive: { color: colors.text },
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
  activeFilterRow: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activeFilterChip: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  activeFilterText: { ...typography.smallBold, color: colors.accentLight },
  listContent: { padding: spacing.md, paddingBottom: 100 },
  roomCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
    borderWidth: 1,
  },
  roomContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  roomIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomInfo: { flex: 1 },
  roomName: { ...typography.h4, color: colors.text },
  roomLocation: { ...typography.small, color: colors.accent, marginTop: 2 },
  roomDescription: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
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
    borderRadius: borderRadius.xl,
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
