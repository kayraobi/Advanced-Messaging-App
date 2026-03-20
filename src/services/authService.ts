import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { handleError } from './api';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../types/user.types';

// ⚠️  Auth akışı netleşince bu servis güncellenecek.
// Token body'den mi cookie'den mi geliyor belli değil.
// Şimdilik iskelet olarak bırakıyoruz.

export const authService = {

  // POST /api/users/login
  // TODO: response incelendikten sonra token storage kısmı eklenecek
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const res = await api.post<LoginResponse>('/api/users/login', credentials);
      // Token body'de gelirse:
      // await AsyncStorage.setItem('auth_token', res.data.token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(res.data));
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // POST /api/users
  // TODO: register response yapısı netleşince güncellenecek
  register: async (data: RegisterRequest): Promise<void> => {
    try {
      await api.post('/api/users', data);
    } catch (e) {
      throw handleError(e);
    }
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
  },

  getStoredUser: async (): Promise<User | null> => {
    const raw = await AsyncStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },
};
