import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tracks which News / Events the user has already "seen" on this device, so we
 * can detect items that exist on the API but not in local storage and surface
 * them as notifications.
 *
 * Strategy: keep a set of seen ids per kind in AsyncStorage. On each sync we
 * diff the freshly fetched ids against the stored set; whatever is new becomes
 * a notification. The first sync (no stored set yet) is treated as a baseline —
 * everything is marked seen WITHOUT notifying, so the user is not flooded with
 * dozens of alerts for content that already existed before the feature shipped.
 */

export type ContentKind = 'news' | 'event';

const STORAGE_KEYS: Record<ContentKind, string> = {
  news: '@sarajevo_seen_news_ids',
  event: '@sarajevo_seen_event_ids',
};

// Cap the stored set so it can't grow without bound.
const MAX_STORED_IDS = 500;

async function readSeenIds(kind: ContentKind): Promise<string[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS[kind]);
    if (raw == null) return null; // null => never synced (baseline pending)
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

async function writeSeenIds(kind: ContentKind, ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS[kind],
      JSON.stringify(ids.slice(0, MAX_STORED_IDS)),
    );
  } catch {
    // storage failures are non-fatal; we just won't dedupe next time
  }
}

function extractId(item: unknown): string | null {
  if (!item || typeof item !== 'object') return null;
  const m = item as Record<string, unknown>;
  const id = m._id ?? m.id;
  return typeof id === 'string' && id.trim() ? id.trim() : null;
}

export interface ContentDiffResult<T> {
  /** Items present on the API but not previously seen on this device. */
  newItems: T[];
  /** True when this was the very first sync (baseline) — caller must NOT notify. */
  isBaseline: boolean;
}

/**
 * Compares freshly fetched items against the locally stored "seen" ids.
 * Persists the merged id set and returns the items that are new.
 *
 * Defensive: never throws — on any internal error it returns an empty,
 * non-baseline result so the caller simply notifies nothing this round.
 *
 * @param kind   'news' | 'event'
 * @param items  freshly fetched API items (each must have `_id` or `id`)
 */
export async function diffAndRecordSeen<T>(
  kind: ContentKind,
  items: T[],
): Promise<ContentDiffResult<T>> {
  try {
    const safeItems = Array.isArray(items) ? items : [];
    const fetchedIds: string[] = [];
    const itemById = new Map<string, T>();
    for (const item of safeItems) {
      const id = extractId(item);
      if (id) {
        fetchedIds.push(id);
        if (!itemById.has(id)) itemById.set(id, item);
      }
    }

    const stored = await readSeenIds(kind);

    // First sync ever → baseline: remember everything, notify nothing.
    if (stored == null) {
      await writeSeenIds(kind, fetchedIds);
      return { newItems: [], isBaseline: true };
    }

    const seen = new Set(stored);
    const newItems: T[] = [];
    for (const id of fetchedIds) {
      if (!seen.has(id)) {
        const item = itemById.get(id);
        if (item) newItems.push(item);
      }
    }

    if (newItems.length > 0) {
      // Newest ids first so the cap keeps the most recent ones.
      const merged = [...fetchedIds, ...stored];
      const deduped = Array.from(new Set(merged));
      await writeSeenIds(kind, deduped);
    }

    return { newItems, isBaseline: false };
  } catch {
    return { newItems: [], isBaseline: false };
  }
}

/** Clears tracking (e.g. on logout) so the next sync re-baselines. */
export async function resetContentTracking(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.news, STORAGE_KEYS.event]);
  } catch {
    // ignore
  }
}
