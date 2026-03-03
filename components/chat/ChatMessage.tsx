import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Avatar } from '@/components/ui';
import { colors, spacing, typography, borderRadius, withOpacity } from '@/constants/design';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

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
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble, { opacity: 0.6 }]}>
          <Text style={[styles.deletedText, { color: themeColors.textTertiary }]}>
            This message was deleted
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View 
      entering={FadeInUp.duration(300).springify()} 
      layout={Layout.springify()}
      style={[styles.wrapper, isMe ? styles.myWrapper : styles.theirWrapper]}
    >
      <TouchableOpacity
        onLongPress={() => isMe && onDelete?.(item.id)}
        onPress={() => onReply?.(item)}
        delayLongPress={300}
        activeOpacity={0.85}
        style={styles.touchable}
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
          { backgroundColor: isMe ? colors.bubbleMe : colors.bubbleThem },
          !isMe && { borderColor: themeColors.border, borderWidth: 1 }
        ]}>
          {!isMe && (
            <Text style={styles.userName}>{item.sender?.display_name || 'Anonymous'}</Text>
          )}
          
          {item.type === 'image' && item.metadata?.imageUrl ? (
            <View>
              <Image 
                source={{ uri: item.metadata.imageUrl }} 
                style={styles.image} 
                contentFit="cover" 
                transition={200}
              />
              <Text style={[styles.time, isMe ? styles.myTime : styles.theirTime]}>
                {formatTime(item.created_at)}
              </Text>
            </View>
          ) : (
            <>
              <Text style={[
                styles.text,
                isMe ? styles.myText : styles.theirText,
              ]}>
                {item.content}
              </Text>
              <Text style={[styles.time, isMe ? styles.myTime : styles.theirTime]}>
                {formatTime(item.created_at)}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    maxWidth: '85%',
  },
  myWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  theirWrapper: {
    alignSelf: 'flex-start',
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatar: {
    marginRight: spacing.xs,
    marginBottom: 2,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: borderRadius.xl,
    maxWidth: '100%',
  },
  myBubble: {
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  theirBubble: {
    borderBottomLeftRadius: 4,
    marginLeft: spacing.xs,
  },
  userName: {
    ...typography.tinyBold,
    color: colors.primary,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  text: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  myText: {
    color: colors.bubbleMeText,
  },
  theirText: {
    color: colors.bubbleThemText,
  },
  time: {
    ...typography.tiny,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTime: {
    color: withOpacity(colors.primary, 0.6),
  },
  theirTime: {
    color: colors.textTertiary,
  },
  image: {
    width: 240,
    height: 240,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  deletedText: {
    ...typography.caption,
    fontStyle: 'italic',
  },
});
