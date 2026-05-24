import { useCallback, useState } from 'react';
import {
  getChatUserAvatarUrl,
  peekChatUserAvatarUrl,
  prefetchChatUserAvatars,
  seedChatUserAvatar,
} from '../services/chatAvatarService';

/** Loads and caches profile photo URLs for chat senders (Global Chat, DMs, …). */
export function useChatUserAvatars() {
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((n) => n + 1), []);

  const seedFromMessages = useCallback(
    (rows: Array<{ senderId?: string; displayUrl?: string }>) => {
      let changed = false;
      for (const row of rows) {
        if (!row.senderId || !row.displayUrl) continue;
        if (peekChatUserAvatarUrl(row.senderId) !== row.displayUrl) {
          seedChatUserAvatar(row.senderId, row.displayUrl);
          changed = true;
        }
      }
      if (changed) bump();
    },
    [bump],
  );

  const prefetchForMessages = useCallback(
    async (rows: Array<{ senderId?: string; displayUrl?: string }>) => {
      seedFromMessages(rows);
      const ids = rows.map((r) => r.senderId).filter(Boolean) as string[];
      await prefetchChatUserAvatars(ids);
      bump();
    },
    [seedFromMessages, bump],
  );

  const getAvatarUrl = useCallback(
    (userId?: string, inlineUrl?: string) => {
      if (inlineUrl) return inlineUrl;
      if (!userId) return undefined;
      return peekChatUserAvatarUrl(userId);
    },
    [tick],
  );

  const resolveAvatarUrl = useCallback(async (userId: string) => {
    const url = await getChatUserAvatarUrl(userId);
    bump();
    return url;
  }, [bump]);

  return {
    getAvatarUrl,
    resolveAvatarUrl,
    prefetchForMessages,
    seedFromMessages,
  };
};
