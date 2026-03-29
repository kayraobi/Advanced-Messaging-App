import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import api, { handleError } from './api';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  JwtPayload,
} from '../types/user.types';

export const authService = {

  // POST /api/users/login
  // Response: { token: "eyJ..." }
  // User bilgisi token içinden decode edilir
  login: async (credentials: LoginRequest): Promise<User> => {
    try {
      const res = await api.post<LoginResponse>('/api/users/login', credentials);
      const { token } = res.data;

      // Token'ı storage'a kaydet
      await AsyncStorage.setItem('auth_token', token);

      // User bilgisini token'dan çıkar, ayrıca storage'a kaydet
      const decoded = jwtDecode<JwtPayload>(token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(decoded.user));

      return decoded.user;
    } catch (e) {
      throw handleError(e);
    }
  },

  // POST /api/users
  // TODO: Ibrahim register endpoint'ini tamamlayınca güncellenecek
  register: async (data: RegisterRequest): Promise<void> => {
    try {
      await api.post('/api/users', data);
    } catch (e) {
      throw handleError(e);
    }
  },

  // Storage'ı temizle
  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
  },

  // Uygulama açılışında mevcut kullanıcıyı getir
  getStoredUser: async (): Promise<User | null> => {
    try {
      const raw = await AsyncStorage.getItem('auth_user');
      if (!raw) return null;

      // Token süresi dolmuş mu kontrol et
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return null;

      const decoded = jwtDecode<JwtPayload>(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        await authService.logout();
        return null;
      }

      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    const user = await authService.getStoredUser();
    return user !== null;
  },
};