import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDefaultSocketUrl = (): string => {
  if (Platform.OS === 'android' && !Constants.isDevice) return 'http://10.0.2.2:3000';
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:3000`;
  return 'http://localhost:3000';
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? getDefaultSocketUrl();

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
