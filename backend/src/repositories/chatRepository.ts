export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  name: string;
  type: 'global' | 'event' | 'dm';
  eventId?: string;
  participants?: string[];
  participantNames?: Record<string, string>;
  isActive: boolean;
  createdAt: string;
}

// In-memory mock storage
let mockMessages: ChatMessage[] = [];
const mockRooms: ChatRoom[] = [
  {
    _id: 'global-room-001',
    name: 'Global Chat',
    type: 'global',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const chatRepository = {
  getRooms: async (): Promise<ChatRoom[]> => {
    return mockRooms.filter((r) => r.isActive && r.type !== 'dm');
  },

  getDmRooms: async (userId: string): Promise<ChatRoom[]> => {
    return mockRooms.filter(
      (r) => r.isActive && r.type === 'dm' && r.participants?.includes(userId),
    );
  },

  getOrCreateDmRoom: async (
    userId1: string,
    name1: string,
    userId2: string,
    name2: string,
  ): Promise<ChatRoom> => {
    const existing = mockRooms.find(
      (r) =>
        r.type === 'dm' &&
        r.participants?.includes(userId1) &&
        r.participants?.includes(userId2),
    );
    if (existing) return existing;

    const [a, b] = [userId1, userId2].sort();
    const room: ChatRoom = {
      _id: `dm-${a}-${b}-${Date.now()}`,
      name: `dm:${a}:${b}`,
      type: 'dm',
      participants: [userId1, userId2],
      participantNames: { [userId1]: name1, [userId2]: name2 },
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    mockRooms.push(room);
    return room;
  },

  getMessagesByRoomId: async (
    roomId: string,
    limit = 30,
    skip = 0,
  ): Promise<ChatMessage[]> => {
    return mockMessages
      .filter((msg) => msg.roomId === roomId)
      .slice(skip, skip + limit);
  },

  saveMessage: async (
    message: Omit<ChatMessage, 'id' | 'createdAt'>,
  ): Promise<ChatMessage> => {
    const newMessage: ChatMessage = {
      ...message,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    mockMessages.push(newMessage);
    return newMessage;
  },
};
