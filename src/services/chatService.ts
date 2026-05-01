// ⚠️  Supabase kurulumu tamamlanınca bu servis doldurulacak.
// Arkadaşın şu tabloları oluşturması gerekiyor:
//   messages  (id, room_id, user_id, content, created_at)
//   rooms     (id, name, is_global, event_id)

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    username: string;
    avatar?: string;
  };
}

export const chatService = {
  // TODO: Supabase client eklenince implement edilecek
  getMessages: async (_roomId: string): Promise<Message[]> => {
    return [];
  },

  sendMessage: async (
    _roomId: string,
    _userId: string,
    _content: string
  ): Promise<void> => {
    return;
  },

  // Realtime subscription — unsubscribe fonksiyonu döndürür
  subscribeToRoom: (
    _roomId: string,
    _onMessage: (msg: Message) => void
  ): (() => void) => {
    // TODO: supabase.channel() buraya gelecek
    return () => {};
  },
};
