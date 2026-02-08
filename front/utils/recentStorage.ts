import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENTLY_VIEWED_KEY = '@recently_viewed_boxes';
const RECENT_SEARCHED_KEY = '@recent_searched_boxes';
const MAX_ITEMS = 5;

export interface RecentBox {
  id: number;
  name: string;
  timestamp: number;
}

async function getItems(key: string): Promise<RecentBox[]> {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

async function saveItem(key: string, item: { id: number; name: string }): Promise<void> {
  try {
    const items = await getItems(key);
    const filtered = items.filter((i) => i.id !== item.id);
    const updated = [{ id: item.id, name: item.name, timestamp: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export async function saveRecentlyViewedBox(id: number, name: string): Promise<void> {
  return saveItem(RECENTLY_VIEWED_KEY, { id, name });
}

export async function getRecentlyViewedBoxes(): Promise<RecentBox[]> {
  return getItems(RECENTLY_VIEWED_KEY);
}

export async function saveRecentSearchedBox(id: number, name: string): Promise<void> {
  return saveItem(RECENT_SEARCHED_KEY, { id, name });
}

export async function getRecentSearchedBoxes(): Promise<RecentBox[]> {
  return getItems(RECENT_SEARCHED_KEY);
}
