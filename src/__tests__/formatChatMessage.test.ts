import {
  formatSocketChatMessage,
  formatSocketChatMessages,
} from '../utils/formatChatMessage';

// ── formatSocketChatMessage ──────────────────────────────────────────────────

describe('formatSocketChatMessage', () => {
  const validMessage = {
    _id: 'msg-001',
    senderId: 'user-42',
    senderName: 'Ahmet',
    message: 'Merhaba!',
    createdAt: '2024-05-20T10:30:00.000Z',
  };

  // ── Positive test cases ────────────────────────────────────────────────

  test('formats a valid message object correctly', () => {
    const result = formatSocketChatMessage(validMessage, 'user-42');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('msg-001');
    expect(result!.senderId).toBe('user-42');
    expect(result!.sender).toBe('Ahmet');
    expect(result!.text).toBe('Merhaba!');
    expect(result!.isMe).toBe(true);
  });

  test('sets isMe=false when sender is different user', () => {
    const result = formatSocketChatMessage(validMessage, 'user-99');
    expect(result!.isMe).toBe(false);
  });

  test('generates correct 2-letter initials', () => {
    const result = formatSocketChatMessage(validMessage);
    expect(result!.initials).toBe('AH');
  });

  test('formats time from createdAt field', () => {
    const result = formatSocketChatMessage(validMessage);
    // Time format: "HH:MM" — should be a non-empty string
    expect(result!.time).toMatch(/^\d{1,2}:\d{2}/);
  });

  test('reads message from "content" field if "message" is absent', () => {
    const msg = { ...validMessage, message: undefined, content: 'Hello via content' };
    const result = formatSocketChatMessage(msg);
    expect(result!.text).toBe('Hello via content');
  });

  test('reads sender name from nested sender object', () => {
    const msg = {
      _id: 'msg-002',
      sender: { _id: 'user-10', username: 'Marko' },
      message: 'Hi',
    };
    const result = formatSocketChatMessage(msg);
    expect(result!.sender).toBe('Marko');
    expect(result!.initials).toBe('MA');
  });

  test('reads sender display URL when provided', () => {
    const msg = { ...validMessage, senderDisplayUrl: 'https://example.com/avatar.jpg' };
    const result = formatSocketChatMessage(msg);
    expect(result!.displayUrl).toBe('https://example.com/avatar.jpg');
  });

  test('sets hidden=true when isDeleted flag is set', () => {
    const msg = { ...validMessage, isDeleted: true };
    const result = formatSocketChatMessage(msg);
    expect(result!.hidden).toBe(true);
  });

  test('falls back to "Member" when sender name is empty', () => {
    const msg = { _id: 'msg-003', senderId: 'u1', senderName: '', message: 'Hey' };
    const result = formatSocketChatMessage(msg);
    expect(result!.sender).toBe('Member');
  });

  // ── Negative / edge test cases ─────────────────────────────────────────

  test('returns null for null input', () => {
    expect(formatSocketChatMessage(null)).toBeNull();
  });

  test('returns null for non-object input (string)', () => {
    expect(formatSocketChatMessage('not-an-object')).toBeNull();
  });

  test('returns null when id field is missing', () => {
    const { _id, ...noId } = validMessage;
    expect(formatSocketChatMessage(noId)).toBeNull();
  });

  test('returns null for undefined input', () => {
    expect(formatSocketChatMessage(undefined)).toBeNull();
  });
});

// ── formatSocketChatMessages ─────────────────────────────────────────────────

describe('formatSocketChatMessages', () => {
  const messages = [
    { _id: 'msg-1', senderId: 'u1', senderName: 'Ali', message: 'Hey', createdAt: '2024-01-01T09:00:00Z' },
    { _id: 'msg-2', senderId: 'u2', senderName: 'Veli', message: 'Hi', createdAt: '2024-01-01T09:01:00Z' },
  ];

  // ── Positive test cases ────────────────────────────────────────────────

  test('formats an array of messages', () => {
    const result = formatSocketChatMessages(messages, 'u1');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('msg-1');
    expect(result[1].id).toBe('msg-2');
  });

  test('accepts payload wrapped in { messages: [...] } object', () => {
    const result = formatSocketChatMessages({ messages }, 'u1');
    expect(result).toHaveLength(2);
  });

  test('filters out invalid messages silently', () => {
    const mixed = [...messages, { noId: true, message: 'broken' }];
    const result = formatSocketChatMessages(mixed);
    expect(result).toHaveLength(2); // invalid one dropped
  });

  // ── Negative / edge test cases ─────────────────────────────────────────

  test('returns empty array for null input', () => {
    expect(formatSocketChatMessages(null)).toEqual([]);
  });

  test('returns empty array for empty array', () => {
    expect(formatSocketChatMessages([])).toEqual([]);
  });

  test('returns empty array for plain string', () => {
    expect(formatSocketChatMessages('bad-input')).toEqual([]);
  });
});
