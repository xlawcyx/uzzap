import { supabase } from '../lib/supabase';
import { BuddyRequest, Profile } from '../types/database.types';

export const buddyService = {
  async getBuddies(userId: string): Promise<Profile[]> {
    const { data: buddyRows, error } = await supabase
      .from('buddies')
      .select('buddy_id')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching buddies:', error);
      return [];
    }

    // Also check buddy_requests for mutual acceptance that might not be in buddies table yet
    const { data: requestRows, error: requestError } = await supabase
      .from('buddy_requests')
      .select('sender_id, receiver_id')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    const buddyIdsSet = new Set<string>();
    
    if (buddyRows) {
      buddyRows.forEach((item: { buddy_id: string }) => buddyIdsSet.add(item.buddy_id));
    }
    
    if (!requestError && requestRows) {
      requestRows.forEach((row: any) => {
        if (row.sender_id === userId) {
          buddyIdsSet.add(row.receiver_id);
        } else {
          buddyIdsSet.add(row.sender_id);
        }
      });
    }

    const buddyIds = Array.from(buddyIdsSet);
    if (buddyIds.length === 0) {
      return [];
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', buddyIds);

    if (profilesError) {
      console.error('Error fetching buddy profiles:', profilesError);
      return [];
    }

    return profiles;
  },

  async sendBuddyRequest(senderId: string, receiverId: string): Promise<BuddyRequest | null> {
    const { data, error } = await supabase
      .from('buddy_requests')
      .upsert([{ sender_id: senderId, receiver_id: receiverId, status: 'pending' }])
      .select()
      .single();

    if (error) {
      console.error('Error sending buddy request:', error);
      return null;
    }

    return data;
  },

  async getBuddyRequests(userId: string): Promise<(BuddyRequest & { sender?: Profile | null })[]> {
    const { data, error } = await supabase
      .from('buddy_requests')
      .select('*, sender:profiles!buddy_requests_sender_id_fkey(*)')
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching buddy requests:', error);
      return [];
    }

    return data;
  },

  async acceptBuddyRequest(requestId: string, senderId: string, receiverId: string) {
    await supabase.from('buddy_requests').update({ status: 'accepted' }).eq('id', requestId);

    await supabase.from('buddies').upsert([
      { user_id: senderId, buddy_id: receiverId, status: 'accepted' },
      { user_id: receiverId, buddy_id: senderId, status: 'accepted' },
    ]);
  },

  async declineBuddyRequest(requestId: string) {
    const { error } = await supabase.from('buddy_requests').update({ status: 'declined' }).eq('id', requestId);

    if (error) {
      console.error('Error declining buddy request:', error);
    }
  },

  async getBuddyRelationship(userId: string, otherUserId: string): Promise<'accepted' | 'pending' | 'none'> {
    const { data: buddy } = await supabase
      .from('buddies')
      .select('status')
      .eq('user_id', userId)
      .eq('buddy_id', otherUserId)
      .maybeSingle();

    if (buddy?.status === 'accepted') return 'accepted';

    const { data: request } = await supabase
      .from('buddy_requests')
      .select('status')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .eq('status', 'pending')
      .maybeSingle();

    if (request?.status === 'pending') return 'pending';
    return 'none';
  },

  async removeBuddy(userId: string, buddyId: string) {
    await supabase
      .from('buddies')
      .delete()
      .or(`and(user_id.eq.${userId},buddy_id.eq.${buddyId}),and(user_id.eq.${buddyId},buddy_id.eq.${userId})`);
  },

  async searchBuddies(query: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Error searching buddies:', error);
      return [];
    }

    return data;
  },
};
