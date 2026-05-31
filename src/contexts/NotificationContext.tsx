import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuth } from './AuthContext';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { socketService } from '../services/socketService';
import { newsService } from '../services/newsService';
import { eventService } from '../services/eventService';
import { diffAndRecordSeen } from '../services/contentNotificationService';
import { useNotificationsState } from '../hooks/useNotifications';
import type { NewNotification, Notification } from '../types/notification.types';

/** Delay the first content check so it never blocks app startup/login. */
const CONTENT_FIRST_SYNC_DELAY_MS = 8 * 1000;
/** How often to re-check the API for newly published news / events. */
const CONTENT_POLL_MS = 5 * 60 * 1000;
/** Avoid flooding: cap how many new-content notifications we add per sync. */
const MAX_CONTENT_NOTIFS_PER_SYNC = 5;

/** AsyncStorage key for the last date we sent a weather notification (YYYY-MM-DD). */
const WEATHER_LAST_DATE_KEY = '@sarajevo_last_weather_date';
/** Delay before the first weather check so it doesn't compete with app startup. */
const WEATHER_FIRST_DELAY_MS = 5 * 1000;

// Sarajevo coordinates — same as useWeather.ts
const WEATHER_LAT = 43.8564;
const WEATHER_LON = 18.4131;

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

async function shouldSendWeatherToday(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(WEATHER_LAST_DATE_KEY);
    return stored !== todayDateString();
  } catch {
    return true; // if storage fails, allow the notification
  }
}

async function markWeatherSentToday(): Promise<void> {
  try {
    await AsyncStorage.setItem(WEATHER_LAST_DATE_KEY, todayDateString());
  } catch {
    // non-fatal
  }
}

function weatherEmoji(code: number): string {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌦️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 85 && code <= 86) return '🌨️';
  if (code >= 95 && code <= 99) return '⛈️';
  return '🌡️';
}

function weatherDescription(code: number): string {
  if (code === 0 || code === 1) return 'Clear and sunny';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Light drizzle';
  if (code >= 61 && code <= 65) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 80 && code <= 82) return 'Heavy rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Variable conditions';
}

async function fetchAndNotifyWeather(addNotification: (n: import('../types/notification.types').NewNotification) => Promise<unknown>): Promise<void> {
  try {
    const shouldSend = await shouldSendWeatherToday();
    if (!shouldSend) return;

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}` +
      `&current=temperature_2m,weather_code` +
      `&timezone=Europe%2FSarajevo` +
      `&forecast_days=1`;

    const res = await fetch(url);
    if (!res.ok) return;
    const json = await res.json() as { current?: { temperature_2m?: number; weather_code?: number } };

    const temp = Math.round(json.current?.temperature_2m ?? 0);
    const code = json.current?.weather_code ?? -1;
    if (code < 0) return;

    const emoji = weatherEmoji(code);
    const desc = weatherDescription(code);

    await addNotification({
      type: 'weather',
      emoji,
      title: `Sarajevo Weather ${emoji}`,
      body: `${desc} · ${temp}°C today`,
    });

    await markWeatherSentToday();
  } catch {
    // never throw — a weather failure must not affect the rest of the app
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type NotificationContextValue = {
  notifications: Notification[];
  unreadCount: number;
  loaded: boolean;
  loadNotifications: () => Promise<Notification[]>;
  addNotification: (input: NewNotification) => Promise<Notification>;
  markAsRead: (id: string) => Promise<void>;
  setActiveChatRoom: (roomId: string | null) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

function readRoomId(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const m = payload as Record<string, unknown>;
  const roomId = m.roomId ?? m.room_id;
  return typeof roomId === 'string' && roomId.trim() ? roomId.trim() : undefined;
}

function readSenderId(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const m = payload as Record<string, unknown>;
  const senderId = m.senderId ?? m.sender_id;
  return typeof senderId === 'string' && senderId.trim() ? senderId.trim() : undefined;
}

function buildChatNotification(payload: unknown): NewNotification | null {
  const roomId = readRoomId(payload);
  if (!roomId) return null;
  const m = payload as Record<string, unknown>;
  const senderName = String(m.senderName ?? m.sender_name ?? 'Someone').trim() || 'Someone';
  const text = String(m.message ?? m.content ?? '').trim();
  const preview = text.length > 120 ? `${text.slice(0, 117)}...` : text;

  return {
    type: 'chat',
    roomId,
    emoji: '💬',
    title: `${senderName} sent a message`,
    body: preview || undefined,
  };
}

function firstNonEmptyLine(value: unknown): string {
  const text = Array.isArray(value) ? value.join(' ') : String(value ?? '');
  const line = text.split('\n').map((s) => s.trim()).find((s) => s.length > 0) ?? '';
  return line.length > 100 ? `${line.slice(0, 97)}...` : line;
}

function buildNewsNotification(item: unknown): NewNotification | null {
  if (!item || typeof item !== 'object') return null;
  const m = item as Record<string, unknown>;
  const id = typeof m._id === 'string' ? m._id : undefined;
  const title = String(m.title ?? '').trim() || 'New article';
  return {
    id: id ? `news-${id}` : undefined,
    type: 'news',
    emoji: '📰',
    title: 'New article published',
    body: title,
  };
}

function buildEventNotification(item: unknown): NewNotification | null {
  if (!item || typeof item !== 'object') return null;
  const m = item as Record<string, unknown>;
  const id = typeof m._id === 'string' ? m._id : undefined;
  const preview = firstNonEmptyLine(m.content) || 'A new event was added';
  return {
    id: id ? `event-${id}` : undefined,
    type: 'event',
    emoji: '📅',
    title: 'New event added',
    body: preview,
  };
}

function buildPushNotification(
  notification: Notifications.Notification,
): NewNotification {
  const content = notification.request.content;
  const data = (content.data ?? {}) as Record<string, unknown>;
  const emoji =
    typeof data.emoji === 'string' && data.emoji.trim() ? data.emoji.trim() : '🔔';

  return {
    id: notification.request.identifier,
    type: 'push',
    emoji,
    title: content.title?.trim() || 'Notification',
    body: content.body?.trim() || undefined,
    roomId: typeof data.roomId === 'string' ? data.roomId : undefined,
  };
}

async function ensurePushPermissions(): Promise<void> {
  if (Platform.OS === 'web' || !Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return;

  await Notifications.requestPermissionsAsync();
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useAuth();
  const api = useNotificationsState();
  const activeRoomIdRef = useRef<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  const setActiveChatRoom = useCallback((roomId: string | null) => {
    activeRoomIdRef.current = roomId?.trim() || null;
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      currentUserIdRef.current = null;
      activeRoomIdRef.current = null;
      return;
    }
    void authService.getStoredUser().then((user) => {
      currentUserIdRef.current = user?._id?.trim() || null;
    });
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const joinAllChatRooms = async () => {
      await socketService.connect();
      const user = await authService.getStoredUser();
      const publicRooms = await chatService.getRooms().catch(() => []);
      for (const room of publicRooms) {
        if (room._id) socketService.joinRoom(room._id);
      }
      if (user?._id) {
        const dmRooms = await chatService.getDmRooms(user._id).catch(() => []);
        for (const room of dmRooms) {
          if (room._id) socketService.joinRoom(room._id);
        }
      }
    };

    void joinAllChatRooms();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    let mounted = true;

    const handleReceive = (payload: unknown) => {
      if (!mounted) return;

      const roomId = readRoomId(payload);
      if (!roomId || roomId === activeRoomIdRef.current) return;

      const senderId = readSenderId(payload);
      if (senderId && senderId === currentUserIdRef.current) return;

      const notif = buildChatNotification(payload);
      if (notif) void api.addNotification(notif);
    };

    const setup = async () => {
      await socketService.connect();
      if (!mounted) return;
      socketService.on('receive_message', handleReceive);
    };

    void setup();

    return () => {
      mounted = false;
      socketService.off('receive_message', handleReceive);
    };
  }, [isLoggedIn, api.addNotification]);

  useEffect(() => {
    if (!isLoggedIn) return;
    void ensurePushPermissions();
  }, [isLoggedIn]);

  // Poll News & Events; notify when the API has content not yet seen locally.
  // Deliberately defensive: delayed first run, every async path guarded, so a
  // failure here can never crash or block the app.
  useEffect(() => {
    if (!isLoggedIn) return;

    let mounted = true;

    const syncContent = async () => {
      try {
        const news = await newsService.getAll().catch(() => []);
        const newsDiff = await diffAndRecordSeen('news', news);
        if (mounted && !newsDiff.isBaseline) {
          for (const item of newsDiff.newItems.slice(0, MAX_CONTENT_NOTIFS_PER_SYNC)) {
            const notif = buildNewsNotification(item);
            if (notif) void api.addNotification(notif);
          }
        }
      } catch {
        // ignore — never let content sync surface an error
      }

      try {
        // Use the wider window so freshly added events (whose post date may be
        // old, pushing them out of the small default page) are still detected.
        const events = await eventService.getAllForSync(500).catch(() => []);
        const eventDiff = await diffAndRecordSeen('event', events);
        if (mounted && !eventDiff.isBaseline) {
          for (const item of eventDiff.newItems.slice(0, MAX_CONTENT_NOTIFS_PER_SYNC)) {
            const notif = buildEventNotification(item);
            if (notif) void api.addNotification(notif);
          }
        }
      } catch {
        // ignore
      }
    };

    const firstTimer = setTimeout(() => void syncContent(), CONTENT_FIRST_SYNC_DELAY_MS);
    const interval = setInterval(() => void syncContent(), CONTENT_POLL_MS);

    return () => {
      mounted = false;
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [isLoggedIn, api.addNotification]);

  // Send a single daily weather notification on first app open of the day.
  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) void fetchAndNotifyWeather(api.addNotification);
    }, WEATHER_FIRST_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isLoggedIn, api.addNotification]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      void api.addNotification(buildPushNotification(notification));
    });

    return () => {
      receivedSub.remove();
    };
  }, [isLoggedIn, api.addNotification]);

  const value: NotificationContextValue = {
    ...api,
    setActiveChatRoom,
  };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
};

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}
