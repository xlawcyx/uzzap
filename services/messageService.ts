import { supabase } from '../lib/supabase';
import { Message, MessageRead } from '../types/database.types';

export const messageService = {
  async getMessages(chatroomId: string, limit: number = 30, before?: string): Promise<any[]> {
    let query = supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('chatroom_id', chatroomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data.reverse();
  },

  async sendMessage(message: Partial<Message>): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data;
  },

  async markAsRead(messageId: string, userId: string): Promise<MessageRead | null> {
    const { data, error } = await supabase
      .from('message_reads')
      .upsert(
        { message_id: messageId, user_id: userId, read_at: new Date().toISOString() },
        { onConflict: 'message_id,user_id', ignoreDuplicates: true }
      )
      .select()
      .maybeSingle();

    if (error) {
      // 23505 is the error code for unique constraint violation in Postgres/Supabase
      // If the duplicate error persists despite ignoreDuplicates: true, we handle it gracefully here
      if (error.code === '23505') {
        return null;
      }
      console.error('Error marking message as read:', error);
      return null;
    }

    return data;
  },

  async markMultipleAsRead(messageIds: string[], userId: string): Promise<void> {
    if (!messageIds.length) return;
    
    const records = messageIds.map(id => ({
      message_id: id,
      user_id: userId,
      read_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('message_reads')
      .upsert(records, { onConflict: 'message_id,user_id', ignoreDuplicates: true });

    if (error) {
      if (error.code === '23505') {
        return;
      }
      console.error('Error marking multiple messages as read:', error);
    }
  },

  async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
    }
  },

  async uploadMessageImage(uri: string, userId: string): Promise<string | null> {
    try {
      // Detect extension from URI
      const uriParts = uri.split('.');
      const rawExt = uriParts[uriParts.length - 1]?.toLowerCase().split('?')[0] || 'jpg';
      const ext = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(rawExt) ? rawExt : 'jpg';
      const mimeMap: Record<string, string> = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
        gif: 'image/gif', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif',
      };
      const contentType = mimeMap[ext] || 'image/jpeg';
      const filename = `${userId}-${Date.now()}.${ext === 'heic' || ext === 'heif' ? 'jpg' : ext}`;

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('message-images')
        .upload(filename, arrayBuffer, { contentType, upsert: false });

      if (error) {
        console.error('Error uploading message image:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('message-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (err) {
      console.error('Unexpected error uploading message image:', err);
      return null;
    }
  }
};