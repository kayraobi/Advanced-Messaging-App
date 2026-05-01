import { io, Socket } from 'socket.io-client';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3030';

let socket: Socket | null = null;

export const socketService = {
  connect(): Socket {
    if (!socket || !socket.connected) {
      socket = io(BASE_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });
    }
    return socket;
  },

  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
};
