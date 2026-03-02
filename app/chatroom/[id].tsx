import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Container, Avatar } from '@/components/ui';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
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
        if (!joined) throw new Error('Unable to join this chatroom.');

        const roomData = await chatroomService.getChatroomById(id as string);
        if (!roomData) throw new Error('Unable to load chatroom details.');

        if (!isMounted) return;
        setRoom(roomData);

        await fetchMessages(id as string);

        const savedDraft = await AsyncStorage.getItem(draftKey);
        if (isMounted && savedDraft) {
          setMessage(savedDraft);
        }

        if (isMounted) {
          unsubscribe = subscribeToChatroom(id as string);
        }
      } catch (error) {
        console.error('Error setting up chatroom:', error);
        if (isMounted) {
          Alert.alert('Unable to load chatroom', 'Please try again.');
          router.back();
        }
      } finally {
        if (isMounted) {
          setRoomLoading(false);
        }
      }
    };

    setupChat();
    setActiveChatroom(id as string);

    return () => {
      isMounted = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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
      .forEach((m) => {
        messageService.markAsRead(m.id, profile.id);
      });
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

      if (!sentMessage) {
        throw new Error('Unable to send message right now.');
      }

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

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === profile?.id;

    return (
      <TouchableOpacity
        style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}
        onLongPress={() => isMe && handleDeleteMessage(item.id)}
        onPress={() => setReplyTo(item)}
        delayLongPress={300}
      >
        {!isMe && <Avatar source={item.sender?.avatar_url ? { uri: item.sender.avatar_url } : undefined} size="sm" style={styles.messageAvatar} />}
        <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.theirMessageBubble]}>
          {!isMe && <Text style={styles.messageUser}>{item.sender?.display_name || 'Anonymous'}</Text>}
          {item.is_deleted ? (
            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>Message deleted</Text>
          ) : item.type === 'image' && item.metadata?.imageUrl ? (
            <Image source={{ uri: item.metadata.imageUrl }} style={styles.messageImage} contentFit="cover" />
          ) : (
            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>{item.content}</Text>
          )}
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (roomLoading) {
    return (
      <Container style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: room?.name || 'Chatroom',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.backgroundSecondary },
          headerTitleStyle: { ...typography.h4, color: colors.text },
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TouchableOpacity onPress={() => Alert.alert('Room Info', room?.description)}>
                <Ionicons name="information-circle-outline" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLeaveRoom}>
                <Ionicons name="log-out-outline" size={24} color={colors.error} />
              </TouchableOpacity>
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
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>{room?.name}</Text>
              <Text style={styles.roomMetaText}>#{roomRegion} • {room?.member_count || 0} members • {messages.length} messages</Text>
              <Text style={styles.detailAbout}>{room?.description || 'No room description yet.'}</Text>
              <Text style={styles.detailAdmins}>Language: {room?.language || 'Not specified'}</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={44} color={colors.border} />
              <Text style={styles.emptyStateTitle}>No messages yet</Text>
              <Text style={styles.emptyStateSub}>Start the conversation and break the ice 👋</Text>
            </View>
          }
        />

        {activeTyping.length > 0 && (
          <Text style={styles.typingText}>Someone is typing...</Text>
        )}

        {replyTo && (
          <View style={styles.replyBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.replyLabel}>Replying to {replyTo.sender?.display_name || 'message'}</Text>
              <Text style={styles.replySnippet} numberOfLines={1}>{replyTo.content}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.mediaBtn} onPress={handleSendImage}>
            <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            value={message}
            onChangeText={handleTyping}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim() || sending}
          >
            {sending ? <ActivityIndicator size="small" color={colors.white} /> : <Ionicons name="send" size={20} color={colors.white} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  messageList: { padding: spacing.md, paddingBottom: spacing.xl },

  detailCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailTitle: { ...typography.h4, color: colors.text },
  detailAbout: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  detailRule: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  detailAdmins: { ...typography.smallBold, color: colors.accent, marginTop: spacing.sm },
  roomMetaText: {
    ...typography.small,
    color: colors.textTertiary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxxl,
    gap: spacing.xs,
  },
  emptyStateTitle: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptyStateSub: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  messageWrapper: { flexDirection: 'row', marginBottom: spacing.md, maxWidth: '80%' },
  myMessageWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  theirMessageWrapper: { alignSelf: 'flex-start' },
  messageAvatar: { marginRight: spacing.xs, marginTop: spacing.xs },
  messageBubble: { padding: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.lg, ...shadows.xs },
  myMessageBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 2 },
  theirMessageBubble: { backgroundColor: colors.backgroundTertiary, borderBottomLeftRadius: 2, marginLeft: spacing.xs },
  messageUser: { ...typography.tiny, color: colors.accent, fontWeight: '700', marginBottom: 2 },
  messageText: { ...typography.body, fontSize: 15 },
  myMessageText: { color: colors.white },
  theirMessageText: { color: colors.text },
  messageTime: { ...typography.tiny, color: 'rgba(255,255,255,0.5)', alignSelf: 'flex-end', marginTop: 2 },
  messageImage: { width: 180, height: 180, borderRadius: borderRadius.md },
  typingText: { ...typography.caption, color: colors.textSecondary, marginLeft: spacing.md, marginBottom: spacing.xs },
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
    padding: spacing.sm,
  },
  replyLabel: { ...typography.tiny, color: colors.accent },
  replySnippet: { ...typography.caption, color: colors.textSecondary },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  mediaBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    color: colors.text,
    ...typography.body,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: { opacity: 0.5 },
});
