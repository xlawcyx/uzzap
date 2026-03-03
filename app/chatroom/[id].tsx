import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows, gradients, withOpacity } from '@/constants/design';
import { Container, Avatar } from '@/components/ui';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useChatStore } from '@/store/useChatStore';
import { messageService } from '@/services/messageService';
import { chatroomService } from '@/services/chatroomService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { markRoomVisited } from '@/lib/chatroomHistory';

export default function ChatroomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { colors: themeColors } = useAppTheme();
  const { messages: chatroomMessages, fetchMessages, subscribeToChatroom, setActiveChatroom, setTyping, typingUsers, leaveChatroom } = useChatStore();
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState<any>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const flatListRef = useRef<FlashListRef<any>>(null);
  const typingTimeoutRef = useRef<any>(null);
  const draftKey = `draft:${id}`;

  const messages = useMemo(() => chatroomMessages[id as string] || [], [chatroomMessages, id]);
  const activeTyping = Array.from(typingUsers[id as string] || []).filter((userId) => userId !== profile?.id);
  const roomRegion = room?.region || room?.category || 'General';

  useEffect(() => {
    if (!id || !profile) return;

    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const setupChat = async () => {
      setRoomLoading(true);
      try {
        await markRoomVisited(id as string);
        const joined = await chatroomService.joinChatroom(id as string, profile.id);
        if (!joined) console.warn('joinChatroom returned null — attempting to load room anyway');

        const roomData = await chatroomService.getChatroomById(id as string);
        if (!roomData) throw new Error('Unable to load chatroom details.');
        if (!isMounted) return;
        setRoom(roomData);

        await fetchMessages(id as string);

        const savedDraft = await AsyncStorage.getItem(draftKey);
        if (isMounted && savedDraft) setMessage(savedDraft);
        if (isMounted) unsubscribe = subscribeToChatroom(id as string);
      } catch (error) {
        console.error('Error setting up chatroom:', error);
        if (isMounted) {
          Alert.alert('Unable to load chatroom', 'Please try again.');
          router.back();
        }
      } finally {
        if (isMounted) setRoomLoading(false);
      }
    };

    setupChat();
    setActiveChatroom(id as string);

    return () => {
      isMounted = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setTyping(id as string, profile.id, false);
      unsubscribe?.();
      setActiveChatroom(null);
    };
  }, [draftKey, id, profile, fetchMessages, setActiveChatroom, setTyping, subscribeToChatroom, router]);

  useEffect(() => {
    if (!id) return;
    AsyncStorage.setItem(draftKey, message);
  }, [draftKey, id, message]);

  useEffect(() => {
    if (!profile || !messages.length) return;
    messages
      .filter((m) => m.sender_id !== profile.id)
      .slice(-20)
      .forEach((m) => messageService.markAsRead(m.id, profile.id));
  }, [messages, profile]);

  const handleTyping = (nextValue: string) => {
    setMessage(nextValue);
    if (!profile || !id) return;
    setTyping(id as string, profile.id, !!nextValue.trim());
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(id as string, profile.id, false);
    }, 1200);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !profile || !id) return;

    setSending(true);
    try {
      const sentMessage = await messageService.sendMessage({
        chatroom_id: id as string,
        sender_id: profile.id,
        content: message.trim(),
        type: 'text',
        reply_to: replyTo?.id || null,
      });

      if (!sentMessage) throw new Error('Unable to send message right now.');
      setMessage('');
      setReplyTo(null);
      await AsyncStorage.removeItem(draftKey);
      setTyping(id as string, profile.id, false);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Message failed', 'Unable to send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSendImage = async () => {
    if (!profile || !id) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to send images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets[0]?.uri) return;

    setSending(true);
    try {
      const imageUrl = await messageService.uploadMessageImage(result.assets[0].uri, profile.id);
      if (!imageUrl) throw new Error('Unable to upload image');

      await messageService.sendMessage({
        chatroom_id: id as string,
        sender_id: profile.id,
        content: '📷 Image',
        type: 'image',
        reply_to: replyTo?.id || null,
        metadata: { imageUrl },
      });
      setReplyTo(null);
    } catch (error: any) {
      Alert.alert('Image send failed', error.message || 'Unable to send image.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert('Delete message', 'Do you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await messageService.deleteMessage(messageId);
          await fetchMessages(id as string);
        },
      },
    ]);
  };

  const handleLeaveRoom = async () => {
    if (!profile || !id) return;
    Alert.alert('Leave Chatroom', 'Are you sure you want to leave this chatroom?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveChatroom(id as string, profile.id);
            router.replace('/(tabs)/' as any);
          } catch {
            Alert.alert('Error', 'Failed to leave chatroom. Please try again.');
          }
        },
      },
    ]);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === profile?.id;

    return (
      <TouchableOpacity
        style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}
        onLongPress={() => isMe && handleDeleteMessage(item.id)}
        onPress={() => !item.is_deleted && setReplyTo(item)}
        delayLongPress={300}
        activeOpacity={0.85}
      >
        {!isMe && (
          <Avatar
            source={item.sender?.avatar_url ? { uri: item.sender.avatar_url } : undefined}
            size="sm"
            style={styles.messageAvatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessageBubble : styles.theirMessageBubble,
          isMe
            ? { backgroundColor: themeColors.bubbleMe }
            : { backgroundColor: themeColors.bubbleThem, borderColor: themeColors.border },
        ]}>
          {!isMe && (
            <Text style={styles.messageUser}>{item.sender?.display_name || 'Anonymous'}</Text>
          )}
          {item.is_deleted ? (
            <Text style={[styles.deletedText, { color: themeColors.textTertiary }]}>This message was deleted</Text>
          ) : item.type === 'image' && item.metadata?.imageUrl ? (
            <View>
              <Image source={{ uri: item.metadata.imageUrl }} style={styles.messageImage} contentFit="cover" />
              <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime, !isMe && { color: themeColors.textTertiary }]}>
                {formatTime(item.created_at)}
              </Text>
            </View>
          ) : (
            <>
              <Text style={[
                styles.messageText,
                isMe ? styles.myMessageText : styles.theirMessageText,
                isMe ? { color: themeColors.bubbleMeText } : { color: themeColors.bubbleThemText },
              ]}>
                {item.content}
              </Text>
              <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime, !isMe && { color: themeColors.textTertiary }]}>
                {formatTime(item.created_at)}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (roomLoading) {
    return (
      <Container style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading chatroom...</Text>
      </Container>
    );
  }

  const canSend = message.trim().length > 0 && !sending;

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: themeColors.backgroundSecondary },
          headerTintColor: themeColors.text,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => Alert.alert(room?.name, room?.description || 'No description')}
                style={[styles.headerIconBtn, { backgroundColor: themeColors.backgroundTertiary }]}
              >
                <Ionicons name="information-circle-outline" size={22} color={themeColors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLeaveRoom} style={[styles.headerIconBtn, { backgroundColor: themeColors.backgroundTertiary }]}>
                <Ionicons name="log-out-outline" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          ),
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <View style={styles.headerRoomIcon}>
                <Ionicons name="location" size={14} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.headerRoomName, { color: themeColors.text }]} numberOfLines={1}>{room?.name}</Text>
                <Text style={[styles.headerRoomMeta, { color: themeColors.textTertiary }]}>{room?.member_count || 0} members • #{roomRegion}</Text>
              </View>
            </View>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlashList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListHeaderComponent={
            <View style={styles.detailCard}>
              <LinearGradient
                colors={['rgba(62,207,142,0.12)', 'rgba(62,207,142,0.02)']}
                style={styles.detailCardGradient}
              >
                <View style={styles.detailRoomIcon}>
                  <Ionicons name="location-sharp" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.detailTitle, { color: themeColors.text }]}>{room?.name}</Text>
                <Text style={[styles.roomMetaText, { color: themeColors.textTertiary }]}>
                  #{roomRegion} • {room?.member_count || 0} members
                </Text>
                {room?.description ? (
                  <Text style={[styles.detailAbout, { color: themeColors.textSecondary }]}>{room.description}</Text>
                ) : null}
                {room?.language ? (
                  <View style={styles.langBadge}>
                    <Ionicons name="globe-outline" size={12} color={colors.primary} />
                    <Text style={styles.langBadgeText}>{room.language}</Text>
                  </View>
                ) : null}
              </LinearGradient>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="chatbubble-ellipses-outline" size={36} color={colors.primary} />
              </View>
              <Text style={[styles.emptyStateTitle, { color: themeColors.text }]}>No messages yet</Text>
              <Text style={[styles.emptyStateSub, { color: themeColors.textSecondary }]}>Be the first to break the ice! 👋</Text>
            </View>
          }
        />

        {activeTyping.length > 0 && (
          <View style={styles.typingWrap}>
            <View style={styles.typingDots}>
              <View style={[styles.typingDot, styles.typingDot1]} />
              <View style={[styles.typingDot, styles.typingDot2]} />
              <View style={[styles.typingDot, styles.typingDot3]} />
            </View>
            <Text style={[styles.typingText, { color: themeColors.textTertiary }]}>Someone is typing...</Text>
          </View>
        )}

        {replyTo && (
          <View style={[styles.replyBar, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}>
            <View style={styles.replyBarAccent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.replyLabel}>
                Replying to {replyTo.sender?.display_name || 'message'}
              </Text>
              <Text style={[styles.replySnippet, { color: themeColors.textSecondary }]} numberOfLines={1}>{replyTo.content}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)} style={styles.replyClose}>
              <Ionicons name="close" size={16} color={themeColors.textTertiary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.inputContainer, { backgroundColor: themeColors.backgroundSecondary, borderTopColor: themeColors.border }]}>
          <TouchableOpacity
            style={[styles.mediaBtn, { backgroundColor: themeColors.backgroundTertiary, borderColor: themeColors.border }]}
            onPress={handleSendImage}
            disabled={sending}
          >
            <Ionicons name="image-outline" size={22} color={sending ? themeColors.textDisabled : themeColors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.backgroundTertiary, borderColor: themeColors.border, color: themeColors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={themeColors.textTertiary}
            value={message}
            onChangeText={handleTyping}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendButton, canSend ? styles.sendButtonActive : [styles.sendButtonDisabled, { backgroundColor: themeColors.backgroundElevated, borderColor: themeColors.border }]]}
            onPress={handleSendMessage}
            disabled={!canSend}
          >
            {sending
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Ionicons name="send" size={18} color={canSend ? colors.white : themeColors.textTertiary} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  loadingText: { ...typography.caption, color: colors.textSecondary },

  // Header
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerRoomIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: withOpacity(colors.primary, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRoomName: {
    ...typography.smallBold,
    color: colors.text,
    fontSize: 15,
    maxWidth: 180,
  },
  headerRoomMeta: {
    ...typography.tiny,
    color: colors.textTertiary,
    marginTop: 1,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
  },

  // Message list
  messageList: { padding: spacing.md, paddingBottom: spacing.lg },

  // Detail card at top of chat
  detailCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  detailCardGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  detailRoomIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withOpacity(colors.primary, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailTitle: { ...typography.h4, color: colors.text, textAlign: 'center' },
  roomMetaText: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 4,
    textAlign: 'center',
  },
  detailAbout: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    backgroundColor: withOpacity(colors.primary, 0.1),
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.25),
  },
  langBadgeText: { ...typography.tinyBold, color: colors.primary, textTransform: 'uppercase' },

  // Empty state
  emptyState: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: withOpacity(colors.primary, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: { ...typography.h4, color: colors.text, marginTop: spacing.sm },
  emptyStateSub: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },

  // Message bubbles
  messageWrapper: { flexDirection: 'row', marginBottom: spacing.sm, maxWidth: '82%' },
  myMessageWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  theirMessageWrapper: { alignSelf: 'flex-start' },
  messageAvatar: { marginRight: spacing.xs, alignSelf: 'flex-end', marginBottom: 2 },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: borderRadius.xl,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: colors.bubbleMe,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  theirMessageBubble: {
    backgroundColor: colors.bubbleThem,
    borderBottomLeftRadius: 4,
    marginLeft: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageUser: {
    ...typography.tinyBold,
    color: colors.primary,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  messageText: { ...typography.body, fontSize: 15, lineHeight: 22 },
  myMessageText: { color: colors.bubbleMeText },
  theirMessageText: { color: colors.bubbleThemText },
  messageTime: { ...typography.tiny, marginTop: 4, alignSelf: 'flex-end' },
  myMessageTime: { color: withOpacity(colors.primary, 0.6) },
  theirMessageTime: { color: colors.textTertiary },
  deletedText: { ...typography.caption, color: colors.textTertiary, fontStyle: 'italic' },
  messageImage: { width: 200, height: 200, borderRadius: borderRadius.lg },

  // Typing indicator
  typingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  typingDots: { flexDirection: 'row', gap: 4 },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
  typingDot1: {},
  typingDot2: { opacity: 0.5 },
  typingDot3: { opacity: 0.3 },
  typingText: { ...typography.small, color: colors.textTertiary },

  // Reply bar
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  replyBarAccent: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
  },
  replyLabel: { ...typography.tinyBold, color: colors.primary, letterSpacing: 0.2 },
  replySnippet: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  replyClose: {
    padding: spacing.sm,
  },

  // Input bar
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  mediaBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    color: colors.text,
    ...typography.body,
    maxHeight: 120,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
    ...shadows.glow,
  },
  sendButtonDisabled: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
