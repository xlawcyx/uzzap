import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, withOpacity, shadows } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Chatroom } from '@/types/database.types';

type Props = {
  room: Chatroom;
  onPress: () => void;
  onSave?: () => void;
  saved?: boolean;
};

export function DiscoveryRoomCard({ room, onPress, onSave, saved }: Props) {
  const { colors: themeColors, isDark } = useAppTheme();
  const tags = room.tags || [];
  const about = room.description || 'No description yet.';

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: isDark ? 'rgba(28, 28, 30, 0.4)' : 'rgba(255, 255, 255, 0.8)', 
          borderColor: themeColors.border 
        }
      ]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View style={styles.contentRow}>
        <View style={[styles.imagePlaceholder, { backgroundColor: withOpacity(colors.primary, 0.1) }]}>
          <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
        </View>

        <View style={styles.infoCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>{room.name}</Text>
            {!!onSave && (
              <TouchableOpacity onPress={onSave} style={styles.saveBtn}>
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={saved ? colors.primary : themeColors.textTertiary}
                />
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.category, { color: colors.primary }]}>
            {room.category || 'General'} Community
          </Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={12} color={themeColors.textTertiary} />
              <Text style={[styles.metaText, { color: themeColors.textTertiary }]}>{room.province || 'Philippines'}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={12} color={themeColors.textTertiary} />
              <Text style={[styles.metaText, { color: themeColors.textTertiary }]}>{room.member_count?.toLocaleString() || 0}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={[styles.about, { color: themeColors.textSecondary }]} numberOfLines={2}>{about}</Text>

      <View style={styles.footer}>
        <View style={styles.tagsRow}>
          {tags.slice(0, 3).map((tag: string) => (
            <View key={tag} style={[styles.tag, { backgroundColor: withOpacity(colors.primary, 0.08) }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
            </View>
          ))}
        </View>
        <Ionicons name="chevron-forward" size={16} color={themeColors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  contentRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: { 
    ...typography.h4, 
    flex: 1,
  },
  saveBtn: {
    padding: 4,
  },
  category: {
    ...typography.smallBold,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.tinyBold,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textDisabled,
  },
  about: { 
    ...typography.small, 
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: withOpacity(colors.border, 0.5),
  },
  tagsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: spacing.xs,
    flex: 1,
  },
  tag: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: { 
    ...typography.tinyBold,
  },
});
