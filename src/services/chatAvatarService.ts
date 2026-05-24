import { getCachedProfilePhoto, setCachedProfilePhoto } from './profilePhotoCache';
import { usersService } from './usersService';

const memory = new Map<string, string | undefined>();
const inFlight = new Map<string, Promise<string | undefined>>();

export function peekChatUserAvatarUrl(userId: string): string | undefined {
  if (!userId) return undefined;
  return memory.get(userId);
}

export function seedChatUserAvatar(userId: string, displayUrl?: string): void {
  if (!userId) return;
  memory.set(userId, displayUrl);
}

/** Resolve avatar URL: memory → local profile cache → GET /api/users/{id}. */
export async function getChatUserAvatarUrl(userId: string): Promise<string | undefined> {
  if (!userId) return undefined;
  if (memory.has(userId)) return memory.get(userId);

  const existing = inFlight.get(userId);
  if (existing) return existing;

  const task = (async () => {
    const local = await getCachedProfilePhoto(userId);
    if (local) {
      memory.set(userId, local);
      return local;
    }

    try {
      const user = await usersService.getById(userId);
      memory.set(userId, user.displayUrl);
      if (user.displayUrl) await setCachedProfilePhoto(userId, user.displayUrl);
      return user.displayUrl;
    } catch {
      memory.set(userId, undefined);
      return undefined;
    } finally {
      inFlight.delete(userId);
    }
  })();

  inFlight.set(userId, task);
  return task;
}

export async function prefetchChatUserAvatars(userIds: string[]): Promise<void> {
  const unique = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))].filter(
    (id) => !memory.has(id),
  );
  if (unique.length === 0) return;
  await Promise.all(unique.map((id) => getChatUserAvatarUrl(id)));
}
