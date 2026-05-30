import { diffAndRecordSeen } from '../services/contentNotificationService';

// In-memory AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((k: string) => Promise.resolve(store[k] ?? null)),
      setItem: jest.fn((k: string, v: string) => {
        store[k] = v;
        return Promise.resolve();
      }),
      multiRemove: jest.fn((keys: string[]) => {
        keys.forEach((k) => delete store[k]);
        return Promise.resolve();
      }),
      __reset: () => {
        store = {};
      },
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

beforeEach(() => {
  AsyncStorage.__reset();
});

describe('diffAndRecordSeen', () => {
  it('treats the first sync as a baseline and notifies nothing', async () => {
    const res = await diffAndRecordSeen('news', [{ _id: 'a' }, { _id: 'b' }]);
    expect(res.isBaseline).toBe(true);
    expect(res.newItems).toHaveLength(0);
  });

  it('detects only the items not seen before', async () => {
    await diffAndRecordSeen('news', [{ _id: 'a' }, { _id: 'b' }]); // baseline
    const res = await diffAndRecordSeen('news', [
      { _id: 'a' },
      { _id: 'b' },
      { _id: 'c' },
    ]);
    expect(res.isBaseline).toBe(false);
    expect(res.newItems.map((i: any) => i._id)).toEqual(['c']);
  });

  it('returns no new items when nothing changed', async () => {
    await diffAndRecordSeen('event', [{ _id: 'x' }]); // baseline
    const res = await diffAndRecordSeen('event', [{ _id: 'x' }]);
    expect(res.newItems).toHaveLength(0);
  });

  it('does not re-notify the same new item on a later sync', async () => {
    await diffAndRecordSeen('news', [{ _id: 'a' }]); // baseline
    const first = await diffAndRecordSeen('news', [{ _id: 'a' }, { _id: 'b' }]);
    expect(first.newItems.map((i: any) => i._id)).toEqual(['b']);
    const second = await diffAndRecordSeen('news', [{ _id: 'a' }, { _id: 'b' }]);
    expect(second.newItems).toHaveLength(0);
  });

  it('supports the `id` field as well as `_id`', async () => {
    await diffAndRecordSeen('event', [{ id: '1' }]); // baseline
    const res = await diffAndRecordSeen('event', [{ id: '1' }, { id: '2' }]);
    expect(res.newItems.map((i: any) => i.id)).toEqual(['2']);
  });

  it('keeps news and events tracking independent', async () => {
    await diffAndRecordSeen('news', [{ _id: 'shared' }]); // baseline for news only
    // events has never synced → its first call is a baseline, not a diff
    const res = await diffAndRecordSeen('event', [{ _id: 'shared' }]);
    expect(res.isBaseline).toBe(true);
    expect(res.newItems).toHaveLength(0);
  });

  it('never throws on malformed input', async () => {
    const res = await diffAndRecordSeen('news', undefined as any);
    expect(res.newItems).toHaveLength(0);
  });
});
