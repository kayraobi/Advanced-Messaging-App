/**
 * storageService — Merkezi local cache yöneticisi
 *
 * Nasıl çalışır:
 *  1. Ekran açılınca önce cache'e bakar → varsa anında gösterir
 *  2. Arka planda sunucudan taze veriyi çeker → cache'i günceller
 *  3. Cache süresi dolmuşsa sadece sunucudan çeker
 *
 * TTL (ne kadar süre geçerli):
 *  - events    → 5 dakika
 *  - places    → 10 dakika
 *  - news      → 10 dakika
 *  - chat      → 2 dakika
 *  - diğerleri → 10 dakika
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Her veri türü için cache süresi (milisaniye)
const TTL: Record<string, number> = {
  events:       5  * 60 * 1000,  // 5 dakika
  places:       10 * 60 * 1000,  // 10 dakika
  realEstate:   10 * 60 * 1000,
  services:     10 * 60 * 1000,
  trips:        10 * 60 * 1000,
  news:         10 * 60 * 1000,
  sponsors:     10 * 60 * 1000,
  chat_messages: 2 * 60 * 1000,  // 2 dakika
};

interface CacheEntry<T> {
  data: T;
  savedAt: number; // timestamp
}

export const storageService = {

  /**
   * Veriyi cache'e yaz
   * Örnek: storageService.set('events', [...])
   */
  async set<T>(key: string, data: T): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      savedAt: Date.now(),
    };
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(entry));
  },

  /**
   * Cache'den oku — süresi dolmuşsa null döner
   * Örnek: const events = await storageService.get('events')
   */
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(`cache_${key}`);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const ttl = TTL[key] ?? TTL['places'];
    const isExpired = Date.now() - entry.savedAt > ttl;

    if (isExpired) return null;
    return entry.data;
  },

  /**
   * Cache var mı ve süresi geçti mi? (göstermek için yeterli ama eskimiş)
   * Süresi dolmuş ama veri var → true (arka planda yenile)
   */
  async isStale(key: string): Promise<boolean> {
    const raw = await AsyncStorage.getItem(`cache_${key}`);
    if (!raw) return false;
    const entry: CacheEntry<unknown> = JSON.parse(raw);
    const ttl = TTL[key] ?? TTL['places'];
    return Date.now() - entry.savedAt > ttl;
  },

  /**
   * Süresi dolmuş olsa bile veriyi döner (offline fallback)
   * İnternet yokken bile son bilinen veriyi göstermek için
   */
  async getStale<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(`cache_${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  },

  /**
   * Belirli bir cache'i temizle
   */
  async clear(key: string): Promise<void> {
    await AsyncStorage.removeItem(`cache_${key}`);
  },

  /**
   * Tüm cache'i temizle (logout'ta kullan)
   */
  async clearAll(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith('cache_'));
    await AsyncStorage.multiRemove(cacheKeys);
  },
};


/**
 * useCachedFetch — Ekranlarda kullanmak için hazır hook
 *
 * Örnek kullanım:
 *   const { data, loading, refresh } = useCachedFetch(
 *     'events',
 *     () => eventService.getAll()
 *   );
 */
import { useState, useEffect, useCallback } from 'react';

export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    try {
      // 1. Cache'e bak — varsa hemen göster
      if (!forceRefresh) {
        const cached = await storageService.getStale<T>(key);
        if (cached) {
          setData(cached);
          setLoading(false);

          // Süresi dolmadıysa sunucuya gitme
          const stale = await storageService.isStale(key);
          if (!stale) return;
        }
      }

      // 2. Sunucudan çek
      setLoading(true);
      const fresh = await fetcher();
      setData(fresh);
      await storageService.set(key, fresh);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? 'Bir hata oluştu');
      // Hata olsa bile eski cache'i göster
      if (!data) {
        const stale = await storageService.getStale<T>(key);
        if (stale) setData(stale);
      }
    } finally {
      setLoading(false);
    }
  }, [key, ...deps]);

  useEffect(() => { load(); }, [load]);

  return {
    data,
    loading,
    error,
    refresh: () => load(true), // Pull-to-refresh için
  };
}
