import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { messageService } from '../services/messageService';
import { chatroomService } from '../services/chatroomService';
import { notificationService } from '../services/notificationService';
import { Message, Chatroom, Profile } from '../types/database.types';

type ChatState = {
  chatrooms: Chatroom[];
  messages: Record<string, Message[]>;
  members: Record<string, Profile[]>;
  isLoading: boolean;
  typingUsers: Record<string, Set<string>>;
  activeChatroomId: string | null;
  channels: Record<string, any>;

  setChatrooms: (chatrooms: Chatroom[]) => void;
  setActiveChatroom: (chatroomId: string | null) => void;
  fetchChatrooms: () => Promise<void>;
  fetchMessages: (chatroomId: string) => Promise<void>;
  fetchMembers: (chatroomId: string) => Promise<void>;
  addMessage: (chatroomId: string, message: Message) => void;
  setTyping: (chatroomId: string, userId: string, isTyping: boolean) => void;
  subscribeToChatroom: (chatroomId: string) => () => void;
  leaveChatroom: (chatroomId: string, userId: string) => Promise<void>;
};

export const useChatStore = create<ChatState>((set, get) => ({
  chatrooms: [],
  messages: {},
  members: {},
  isLoading: false,
  typingUsers: {},
  activeChatroomId: null,
  channels: {},

  setChatrooms: (chatrooms) => set({ chatrooms }),
  setActiveChatroom: (chatroomId) => set({ activeChatroomId: chatroomId }),

  fetchChatrooms: async () => {
    set({ isLoading: true });
    const chatrooms = await chatroomService.getChatrooms();
    set({ chatrooms, isLoading: false });
  },

  fetchMessages: async (chatroomId) => {
    const messages = await messageService.getMessages(chatroomId);
    set((state) => ({
      messages: { ...state.messages, [chatroomId]: messages },
    }));
  },

  fetchMembers: async (chatroomId) => {
    const members = await chatroomService.getChatroomMembers(chatroomId);
    set((state) => ({
      members: { ...state.members, [chatroomId]: members },
    }));
  },

  addMessage: (chatroomId, message) => {
    set((state) => {
      const currentMessages = state.messages[chatroomId] || [];
      if (currentMessages.find((m) => m.id === message.id)) return state;

      return {
        messages: {
          ...state.messages,
          [chatroomId]: [...currentMessages, message],
        },
      };
    });
  },

  setTyping: (chatroomId, userId, isTyping) => {
    set((state) => {
      const currentTyping = state.typingUsers[chatroomId] || new Set();
      const nextTyping = new Set(currentTyping);
      if (isTyping) nextTyping.add(userId);
      else nextTyping.delete(userId);

      return {
        typingUsers: {
          ...state.typingUsers,
          [chatroomId]: nextTyping,
        },
      };
    });

    const channel = get().channels[chatroomId];
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping },
      });
    }
  },

  subscribeToChatroom: (chatroomId) => {
    const existing = get().channels[chatroomId];
    if (existing) {
      return () => {
        existing.unsubscribe();
        set((state) => {
          const next = { ...state.channels };
          delete next[chatroomId];
          return { channels: next };
        });
      };
    }

    const channel = supabase
      .channel(`chatroom:${chatroomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chatroom_id=eq.${chatroomId}`,
        },
        async (payload) => {
          const { data: sender } = await supabase.from('profiles').select('*').eq('id', payload.new.sender_id).maybeSingle();

          const messageWithSender = { ...payload.new, sender };
          get().addMessage(chatroomId, messageWithSender as any);

          if (get().activeChatroomId !== chatroomId) {
            notificationService.sendLocalNotification('New message', sender?.display_name ? `${sender.display_name}: ${payload.new.content}` : payload.new.content);
          }
        }
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { userId, isTyping } = payload;
        set((state) => {
          const currentTyping = state.typingUsers[chatroomId] || new Set();
          const nextTyping = new Set(currentTyping);
          if (isTyping) nextTyping.add(userId);
          else nextTyping.delete(userId);
          return {
            typingUsers: {
              ...state.typingUsers,
              [chatroomId]: nextTyping,
            },
          };
        });
      })
      .subscribe();

    set((state) => ({ channels: { ...state.channels, [chatroomId]: channel } }));

    return () => {
      channel.unsubscribe();
      set((state) => {
        const next = { ...state.channels };
        delete next[chatroomId];
        return { channels: next };
      });
    };
  },

  leaveChatroom: async (chatroomId, userId) => {
    try {
      await chatroomService.leaveChatroom(chatroomId, userId);
      set((state) => ({
        chatrooms: state.chatrooms.filter((c) => c.id !== chatroomId),
      }));
    } catch (error) {
      console.error('Error in leaveChatroom store action:', error);
      throw error;
    }
  },
}));
