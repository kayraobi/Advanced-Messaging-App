import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3030';

let socket: Socket | null = null;

export const socketService = {
  async connect(): Promise<Socket> {
    if (socket && socket.connected) return socket;

    // AsyncStorage'dan token oku, sunucuya gönder
    const token = await AsyncStorage.getItem('auth_token');

    socket = io(BASE_URL, {
      transports: ['websocket'],
      autoConnect: true,
      auth: { token: token ?? '' },
    });

    socket.on('connect', () => {
      console.log('[Socket] Bağlandı:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Bağlantı hatası:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Bağlantı kesildi:', reason);
    });

    return socket;
  },

  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket(): Socket | null {
    return socket;
  },
};
