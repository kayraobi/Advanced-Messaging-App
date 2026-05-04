// Chat işlemleri Socket.IO üzerinden yapılıyor.
// Gerçek zamanlı bağlantı için socketService.ts kullanılır.
// Mesaj geçmişi için: GET /api/chat/rooms/:roomId/messages (Ibrahim ekleyince)

export interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  hidden: boolean;
  createdAt: string;
}

export interface Room {
  roomId: string;
  type: 'global' | 'event' | 'dm';
  lastMessage?: string;
  lastMessageAt?: string;
}
