import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet, View, Text,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, withOpacity } from '@/constants/design';
import { Container } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useChatStore } from '@/store/useChatStore';
import { messageService } from '@/services/messageService';
import { chatroomService } from '@/services/chatroomService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { markRoomVisited } from '@/lib/chatroomHistory';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { TypingIndicator } from '@/components/chat/TypingIndicator';

export default function ChatroomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { colors: themeColors, isDark } = useAppTheme();
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

  if (roomLoading) {
    return (
      <Container style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading chatroom...</Text>
      </Container>
    );
  }


  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: themeColors.backgroundSecondary },
          headerTintColor: themeColors.text,
          headerTitle: () => (
            <ChatHeader 
              room={room} 
              isDark={isDark} 
              themeColors={themeColors} 
              onLeave={handleLeaveRoom}
              roomRegion={roomRegion}
            />
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
          renderItem={({ item }) => (
            <ChatMessage 
              item={item} 
              isMe={item.sender_id === profile?.id} 
              onDelete={handleDeleteMessage}
              onReply={(m) => !m.is_deleted && setReplyTo(m)}
              isDark={isDark}
              themeColors={themeColors}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            <View style={[styles.detailCard, { borderColor: themeColors.borderAccent }]}>
              <LinearGradient
                colors={isDark ? ['rgba(62,207,142,0.12)', 'rgba(62,207,142,0.02)'] : ['#F0FDF4', '#FFFFFF']}
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

        <TypingIndicator typingUsers={activeTyping} themeColors={themeColors} />

        <ChatInput 
          message={message}
          onMessageChange={handleTyping}
          onSend={handleSendMessage}
          onImagePicker={handleSendImage}
          sending={sending}
          themeColors={themeColors}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  loadingText: { ...typography.caption },

  // Message list
  messageList: { padding: spacing.md, paddingBottom: spacing.lg },

  // Detail card at top of chat
  detailCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
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
  detailTitle: { ...typography.h4, textAlign: 'center' },
  roomMetaText: {
    ...typography.small,
    marginTop: 4,
    textAlign: 'center',
  },
  detailAbout: {
    ...typography.caption,
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
  emptyStateTitle: { ...typography.h4, marginTop: spacing.sm },
  emptyStateSub: { ...typography.caption, textAlign: 'center' },
});
