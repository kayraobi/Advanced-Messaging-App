import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useNotifications } from '../contexts/NotificationContext';

/** Marks which chat room is on screen so foreground socket alerts are suppressed. */
export function useActiveChatRoom(roomId: string | null | undefined) {
  const { setActiveChatRoom } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      const id = roomId?.trim() || null;
      setActiveChatRoom(id);
      return () => setActiveChatRoom(null);
    }, [roomId, setActiveChatRoom]),
  );
}
