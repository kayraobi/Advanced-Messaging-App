export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

// In-memory mock storage for messages
let mockMessages: ChatMessage[] = [];

export const chatRepository = {
  getMessagesByRoomId: async (roomId: string): Promise<ChatMessage[]> => {
    return mockMessages.filter((msg) => msg.roomId === roomId);
  },

  saveMessage: async (message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> => {
    const newMessage: ChatMessage = {
      ...message,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    mockMessages.push(newMessage);
    return newMessage;
  },
};
