import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Avatar } from '@/components/ui';
import { colors, spacing, typography, borderRadius, withOpacity } from '@/constants/design';
import Animated, { FadeInUp, FadeOut, Layout } from 'react-native-reanimated';

interface ChatMessageProps {
  item: any;
  isMe: boolean;
  onDelete?: (id: string) => void;
  onReply?: (message: any) => void;
  isDark: boolean;
  themeColors: any;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  item,
  isMe,
  onDelete,
  onReply,
  isDark,
  themeColors,
}) => {
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (item.is_deleted) {
    return (
      <View style={[styles.wrapper, isMe ? styles.myWrapper : styles.theirWrapper]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble, { opacity: 0.5, backgroundColor: themeColors.backgroundElevated }]}>
          <Text style={[styles.deletedText, { color: themeColors.textTertiary }]}>
            Message deleted
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View 
      entering={FadeInUp.duration(400).springify()} 
      layout={Layout.springify()}
      style={[styles.wrapper, isMe ? styles.myWrapper : styles.theirWrapper]}
    >
      <TouchableOpacity
        onLongPress={() => isMe && onDelete?.(item.id)}
        onPress={() => onReply?.(item)}
        delayLongPress={300}
        activeOpacity={0.9}
        style={[styles.touchable, isMe && { flexDirection: 'row-reverse' }]}
      >
        {!isMe && (
          <Avatar
            source={item.sender?.avatar_url ? { uri: item.sender.avatar_url } : undefined}
            size="sm"
            style={styles.avatar}
          />
        )}
        
        <View style={[
          styles.bubble,
          isMe ? styles.myBubble : styles.theirBubble,
          { 
            backgroundColor: isMe ? colors.primary : isDark ? 'rgba(45, 45, 50, 0.6)' : 'rgba(240, 240, 245, 0.8)',
          },
          isMe && shadows.md
        ]}>
          {!isMe && (
            <Text style={[styles.userName, { color: colors.primary }]}>{item.sender?.display_name || 'Buddy'}</Text>
          )}
          
          {item.type === 'image' && item.metadata?.imageUrl ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.metadata.imageUrl }} 
                style={styles.image} 
                contentFit="cover" 
                transition={300}
              />
              <View style={styles.imageOverlay}>
                <Text style={[styles.time, { color: '#FFF', opacity: 0.8 }]}>
                  {formatTime(item.created_at)}
                </Text>
              </View>
            </View>
          ) : (
            <View>
              {item.reply_to_message && (
                <View style={[styles.replyPreview, { backgroundColor: isMe ? 'rgba(255,255,255,0.15)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  <Text style={[styles.replyUser, { color: isMe ? '#FFF' : colors.primary }]} numberOfLines={1}>
                    {item.reply_to_message.sender?.display_name || 'Buddy'}
                  </Text>
                  <Text style={[styles.replyText, { color: isMe ? 'rgba(255,255,255,0.8)' : themeColors.textSecondary }]} numberOfLines={1}>
                    {item.reply_to_message.content}
                  </Text>
                </View>
              )}
              <Text style={[
                styles.text,
                { color: isMe ? '#FFF' : themeColors.text }
              ]}>
                {item.content}
              </Text>
              <Text style={[styles.time, isMe ? styles.myTime : styles.theirTime]}>
                {formatTime(item.created_at)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
    width: '100%',
  },
  myWrapper: {
    alignItems: 'flex-end',
  },
  theirWrapper: {
    alignItems: 'flex-start',
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  avatar: {
    marginRight: spacing.sm,
    marginBottom: 2,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    borderBottomLeftRadius: 4,
  },
  userName: {
    ...typography.tinyBold,
    marginBottom: 2,
    fontSize: 11,
  },
  text: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 20,
  },
  time: {
    ...typography.tiny,
    marginTop: 2,
    alignSelf: 'flex-end',
    fontSize: 10,
  },
  myTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTime: {
    color: colors.textTertiary,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: 240,
    height: 240,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopLeftRadius: 12,
  },
  replyPreview: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  replyUser: {
    ...typography.tinyBold,
    fontSize: 11,
  },
  replyText: {
    ...typography.tiny,
    fontSize: 12,
  },
  deletedText: {
    ...typography.caption,
    fontStyle: 'italic',
    fontSize: 13,
  },
});