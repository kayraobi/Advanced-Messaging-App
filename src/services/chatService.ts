import api from './api';

export interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  isDeleted?: boolean;
  createdAt: string;
}

export interface Room {
  _id: string;
  name: string;
  type: 'global' | 'event' | 'dm';
  eventId?: string;
  participants?: string[];
  participantNames?: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function getDmPeerName(room: Room, myUserId: string): string {
  if (!room.participantNames) return room.name;
  const peerId = room.participants?.find((id) => id !== myUserId);
  return peerId ? (room.participantNames[peerId] ?? room.name) : room.name;
}

export const chatService = {
  getRooms: async (): Promise<Room[]> => {
    const res = await api.get<Room[]>('/api/chat/rooms');
    return Array.isArray(res.data) ? res.data : (res.data as any)?.data ?? [];
  },

  getDmRooms: async (myUserId: string): Promise<Room[]> => {
    const res = await api.get<Room[]>('/api/chat/rooms', {
      params: { userId: myUserId },
    });
    return Array.isArray(res.data) ? res.data : (res.data as any)?.data ?? [];
  },

  getOrCreateDmRoom: async (
    targetUserId: string,
    targetUsername: string,
  ): Promise<Room> => {
    const res = await api.post<Room>('/api/chat/dm', { targetUserId, targetUsername });
    return res.data;
  },

  getRoomMessages: async (
    roomId: string,
    limit = 30,
    skip = 0,
  ): Promise<{ messages: Message[]; totalCount: number; hasMore: boolean }> => {
    const res = await api.get(`/api/chat/rooms/${roomId}/messages`, {
      params: { limit, skip },
    });
    return res.data;
  },
};
