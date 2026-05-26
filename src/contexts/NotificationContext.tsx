import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuth } from './AuthContext';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { socketService } from '../services/socketService';
import { useNotificationsState } from '../hooks/useNotifications';
import type { NewNotification, Notification } from '../types/notification.types';

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
