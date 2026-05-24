export interface FormattedChatMessage {
  id: string;
  senderId: string;
  sender: string;
  initials: string;
  displayUrl?: string;
  text: string;
  time: string;
  isMe: boolean;
  hidden?: boolean;
}

function readSenderPhoto(raw: Record<string, unknown>): string | undefined {
  const sender = raw.sender;
  const senderObj =
    sender && typeof sender === 'object' ? (sender as Record<string, unknown>) : null;
  const photoRaw =
    raw.senderDisplayUrl ??
    raw.senderAvatar ??
    raw.senderPhoto ??
    senderObj?.displayUrl ??
    senderObj?.profilePicture ??
    senderObj?.avatar ??
    senderObj?.picture;
  return typeof photoRaw === 'string' && photoRaw.trim().length > 0 ? photoRaw.trim() : undefined;
}

export function formatSocketChatMessage(
  raw: unknown,
  currentUserId?: string,
): FormattedChatMessage | null {
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  const id = String(m._id ?? m.id ?? '').trim();
  if (!id) return null;

  const senderId = String(m.senderId ?? (m.sender as { _id?: string })?._id ?? '').trim();
  const senderName = String(
    m.senderName ??
      (m.sender as { username?: string; name?: string })?.username ??
      (m.sender as { name?: string })?.name ??
      'Member',
  ).trim();
  const createdAt = m.createdAt ?? m.updatedAt;
  const time =
    createdAt != null
      ? new Date(String(createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

  return {
    id,
    senderId,
    sender: senderName || 'Member',
    initials: (senderName || '??').substring(0, 2).toUpperCase(),
    displayUrl: readSenderPhoto(m),
    text: String(m.message ?? m.content ?? ''),
    time,
    isMe: !!currentUserId && senderId === currentUserId,
    hidden: Boolean(m.hidden ?? m.isDeleted),
  };
}

export function formatSocketChatMessages(
  payload: unknown,
  currentUserId?: string,
): FormattedChatMessage[] {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && 'messages' in payload
      ? (payload as { messages: unknown[] }).messages
      : [];
  if (!Array.isArray(list)) return [];
  const out: FormattedChatMessage[] = [];
  for (const item of list) {
    const row = formatSocketChatMessage(item, currentUserId);
    if (row) out.push(row);
  }
  return out;
}
