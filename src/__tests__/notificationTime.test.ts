import { formatNotificationTime } from '../utils/notificationTime';

describe('formatNotificationTime', () => {
  it('returns relative time for valid ISO dates', () => {
    const recent = new Date(Date.now() - 60_000).toISOString();
    const result = formatNotificationTime(recent);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatch(/ago|minute|second/i);
  });

  it('returns empty string for invalid dates', () => {
    expect(formatNotificationTime('not-a-date')).toBe('');
  });
});
