import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NewNotification, Notification } from '../types/notification.types';

const STORAGE_KEY = '@sarajevo_notifications';
const MAX_STORED = 50;

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeNotification(input: NewNotification): Notification {
  return {
    id: input.id ?? makeId(),
    title: input.title,
    body: input.body,
    emoji: input.emoji || '🔔',
    isRead: input.isRead ?? false,
    createdAt: input.createdAt ?? new Date().toISOString(),
    roomId: input.roomId,
    type: input.type,
  };
}

async function readStored(): Promise<Notification[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is Notification =>
        !!n &&
        typeof n === 'object' &&
        typeof (n as Notification).id === 'string' &&
        typeof (n as Notification).title === 'string',
    );
  } catch {
    return [];
  }
}

async function writeStored(list: Notification[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_STORED)));
}

/** AsyncStorage-backed notification list (use inside NotificationProvider). */
export function useNotificationsState() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadNotifications = useCallback(async () => {
    const list = await readStored();
    setNotifications(list);
    setLoaded(true);
    return list;
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const persist = useCallback(async (next: Notification[]) => {
    setNotifications(next);
    await writeStored(next);
  }, []);

  const addNotification = useCallback(
    async (input: NewNotification) => {
      const item = normalizeNotification(input);
      setNotifications((prev) => {
        const next = [item, ...prev.filter((n) => n.id !== item.id)].slice(0, MAX_STORED);
        void writeStored(next);
        return next;
      });
      return item;
    },
    [],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        void writeStored(next);
        return next;
      });
    },
    [],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  return {
    notifications,
    unreadCount,
    loaded,
    loadNotifications,
    addNotification,
    markAsRead,
  };
}

export { useNotifications } from '../contexts/NotificationContext';
