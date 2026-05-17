import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3030';

let socket: Socket | null = null;

export const socketService = {
  async connect(): Promise<Socket> {
    if (socket && socket.connected) return socket;

    const token = await AsyncStorage.getItem('auth_token');

    socket = io(BASE_URL, {
      path: '/api/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: { token: token ?? '' },
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
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

  joinRoom(roomId: string, callback?: (response: any) => void): void {
    socket?.emit('join_room', { roomId }, callback);
  },

  leaveRoom(roomId: string, callback?: (response: any) => void): void {
    socket?.emit('leave_room', { roomId }, callback);
  },

  sendMessage(roomId: string, message: string, callback?: (response: any) => void): void {
    socket?.emit('send_message', { roomId, message }, callback);
  },

  on(event: string, callback: (...args: any[]) => void): void {
    socket?.on(event, callback);
  },

  off(event: string, callback?: (...args: any[]) => void): void {
    socket?.off(event, callback);
  },
};
