import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, withOpacity } from '@/constants/design';
import { Chatroom } from '@/types/database.types';

type Props = {
  room: Chatroom;
  onPress: () => void;
  onSave?: () => void;
  saved?: boolean;
};

export function DiscoveryRoomCard({ room, onPress, onSave, saved }: Props) {
  const tags = room.tags || [];
  const about = room.description || 'No description yet.';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.titleRow}>
        <View style={styles.roomIconWrap}>
          <Ionicons name="location-sharp" size={14} color={colors.primary} />
        </View>
        <Text style={styles.name} numberOfLines={1}>{room.name}</Text>
        {!!onSave && (
          <TouchableOpacity onPress={onSave} style={styles.saveBtn}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={saved ? colors.primary : colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.meta}>
        #{room.category || 'General'} • {room.region || 'Unknown region'} • {room.type}
      </Text>
      <Text style={styles.about} numberOfLines={2}>{about}</Text>

      <View style={styles.footer}>
        <View style={styles.membersBadge}>
          <Ionicons name="people-outline" size={12} color={colors.primary} />
          <Text style={styles.members}>{room.member_count.toLocaleString()} members</Text>
        </View>
        <View style={styles.tagsRow}>
          {tags.slice(0, 2).map((tag: string) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  roomIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: withOpacity(colors.primary, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  name: { ...typography.captionBold, color: colors.text, flex: 1, fontSize: 15 },
  saveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
  },
  meta: { ...typography.small, color: colors.primary, marginBottom: spacing.xs },
  about: { ...typography.small, color: colors.textSecondary, lineHeight: 18 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  membersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  members: { ...typography.smallBold, color: colors.primary },
  tagsRow: { flexDirection: 'row', gap: spacing.xs },
  tag: {
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.primary, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: { ...typography.tiny, color: colors.primary },
});
