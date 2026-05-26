import { unwrapApiEntity, unwrapApiList } from '../utils/apiUnwrap';

// ── unwrapApiEntity ──────────────────────────────────────────────────────────

describe('unwrapApiEntity', () => {

  // ── Positive test cases ────────────────────────────────────────────────

  test('returns raw non-object value (string) as-is', () => {
    const result = unwrapApiEntity<string>('hello');
    expect(result).toBe('hello');
  });

  test('returns raw non-object value (number) as-is', () => {
    const result = unwrapApiEntity<number>(42);
    expect(result).toBe(42);
  });

  test('extracts entity from { user: {...} } envelope', () => {
    const payload = { user: { _id: 'u1', username: 'Bahadır' } };
    const result = unwrapApiEntity<{ _id: string; username: string }>(payload);
    expect(result).toEqual({ _id: 'u1', username: 'Bahadır' });
  });

  test('extracts entity from { data: {...} } envelope', () => {
    const payload = { data: { _id: 'e1', title: 'Event' } };
    const result = unwrapApiEntity<{ _id: string; title: string }>(payload);
    expect(result).toEqual({ _id: 'e1', title: 'Event' });
  });

  test('extracts entity from nested { data: { data: {...} } } envelope', () => {
    const payload = { data: { data: { _id: 'n1', headline: 'News' } } };
    const result = unwrapApiEntity<{ _id: string; headline: string }>(payload);
    expect(result).toEqual({ _id: 'n1', headline: 'News' });
  });

  test('returns raw object when no envelope wrapper matches', () => {
    const payload = { _id: 'p1', name: 'Place' };
    const result = unwrapApiEntity<{ _id: string; name: string }>(payload);
    expect(result).toEqual({ _id: 'p1', name: 'Place' });
  });

  test('skips user key when user value is null and falls through to data', () => {
    const payload = { user: null, data: { _id: 'd1' } };
    const result = unwrapApiEntity<{ _id: string }>(payload);
    expect(result).toEqual({ _id: 'd1' });
  });

  test('returns raw object when data key is null', () => {
    const payload = { data: null, _id: 'x1' };
    const result = unwrapApiEntity<{ _id: string }>(payload);
    expect(result).toEqual({ data: null, _id: 'x1' });
  });

  // ── Negative / edge-case tests ─────────────────────────────────────────

  test('returns null for null input', () => {
    expect(unwrapApiEntity(null)).toBeNull();
  });

  test('returns null for undefined input', () => {
    expect(unwrapApiEntity(undefined)).toBeNull();
  });
});

// ── unwrapApiList ────────────────────────────────────────────────────────────

describe('unwrapApiList', () => {

  // ── Positive test cases ────────────────────────────────────────────────

  test('returns plain array as-is', () => {
    const arr = [{ id: 1 }, { id: 2 }];
    expect(unwrapApiList(arr)).toEqual(arr);
  });

  test('extracts array from { data: [...] } envelope', () => {
    const payload = { data: [{ id: 1 }, { id: 2 }] };
    const result = unwrapApiList<{ id: number }>(payload);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
  });

  test('returns empty array for empty plain array input', () => {
    expect(unwrapApiList([])).toEqual([]);
  });

  test('returns empty array for empty { data: [] } envelope', () => {
    expect(unwrapApiList({ data: [] })).toEqual([]);
  });

  // ── Negative / edge-case tests ─────────────────────────────────────────

  test('returns empty array for null input', () => {
    expect(unwrapApiList(null)).toEqual([]);
  });

  test('returns empty array for undefined input', () => {
    expect(unwrapApiList(undefined)).toEqual([]);
  });

  test('returns empty array for plain string input', () => {
    expect(unwrapApiList('not-an-array')).toEqual([]);
  });

  test('returns empty array when data field is not an array', () => {
    expect(unwrapApiList({ data: { nested: true } })).toEqual([]);
  });

  test('returns empty array for plain object with no data key', () => {
    expect(unwrapApiList({ items: [1, 2, 3] })).toEqual([]);
  });
});
