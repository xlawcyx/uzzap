import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_KEY = 'chatroom:recent:v1';

const loadList = async (key: string): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveList = async (key: string, list: string[]) => {
  await AsyncStorage.setItem(key, JSON.stringify(list));
};

export const markRoomVisited = async (roomId: string) => {
  const current = await loadList(RECENT_KEY);
  const next = [roomId, ...current.filter((id) => id !== roomId)].slice(0, 20);
  await saveList(RECENT_KEY, next);
  return next;
};
