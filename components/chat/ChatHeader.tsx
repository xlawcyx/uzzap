import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, withOpacity } from '@/constants/design';

interface ChatHeaderProps {
  room: any;
  isDark: boolean;
  themeColors: any;
  onLeave: () => void;
  roomRegion: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  room,
  isDark,
  themeColors,
  onLeave,
  roomRegion,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: withOpacity(colors.primary, 0.15) }]}>
          <Ionicons name="location" size={14} color={colors.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
            {room?.name || 'Chatroom'}
          </Text>
          <Text style={[styles.meta, { color: themeColors.textTertiary }]}>
            {room?.member_count || 0} members • #{roomRegion}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => Alert.alert(room?.name, room?.description || 'No description')}
          style={[styles.btn, { backgroundColor: themeColors.backgroundTertiary }]}
        >
          <Ionicons name="information-circle-outline" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onLeave} 
          style={[styles.btn, { backgroundColor: themeColors.backgroundTertiary }]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.sm,
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.smallBold,
    fontSize: 15,
  },
  meta: {
    ...typography.tiny,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
