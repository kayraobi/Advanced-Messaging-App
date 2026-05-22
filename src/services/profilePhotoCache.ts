import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types/user.types';

const KEY_PREFIX = 'profile_photo_url:';

export async function getCachedProfilePhoto(userId: string): Promise<string | undefined> {
  if (!userId) return undefined;
  const raw = await AsyncStorage.getItem(`${KEY_PREFIX}${userId}`);
  return raw && raw.trim().length > 0 ? raw.trim() : undefined;
}

export async function setCachedProfilePhoto(userId: string, url: string): Promise<void> {
  if (!userId || !url.trim()) return;
  await AsyncStorage.setItem(`${KEY_PREFIX}${userId}`, url.trim());
}

/** Prefer server URL; fall back to per-user cache (survives logout/login on this device). */
export async function enrichUserWithProfilePhoto(user: User): Promise<User> {
  const id = user._id?.trim();
  if (!id) return user;
  if (user.displayUrl) {
    await setCachedProfilePhoto(id, user.displayUrl);
    return user;
  }
  const cached = await getCachedProfilePhoto(id);
  return cached ? { ...user, displayUrl: cached } : user;
}
