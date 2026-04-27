import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { AxiosError } from 'axios';
import api, { handleError, USE_MOCK } from './api';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  JwtPayload,
} from '../types/user.types';

const MOCK_USER: User = {
  username: 'admin',
  type: 'GM',
} as User;

const MOCK_CREDENTIALS = { email: 'admin@sarajevoexpats.com', password: 'admin123' };

export const authService = {

  // POST /api/users/login
  login: async (credentials: LoginRequest): Promise<User> => {
    if (USE_MOCK) {
      if (
        credentials.email === MOCK_CREDENTIALS.email &&
        credentials.password === MOCK_CREDENTIALS.password
      ) {
        await AsyncStorage.setItem('auth_user', JSON.stringify(MOCK_USER));
        await AsyncStorage.setItem('auth_token', 'mock_token');
        return MOCK_USER;
      }
      throw new Error('Invalid email or password.');
    }

    try {
      const normalizedIdentifier = credentials.email.trim();
      const normalizedPassword = credentials.password.trim();
      const payloadVariants = [
        { email: normalizedIdentifier, password: normalizedPassword },
        { username: normalizedIdentifier, password: normalizedPassword },
        { emailOrUsername: normalizedIdentifier, password: normalizedPassword },
      ];

      let res: { data: any } | null = null;
      let lastError: unknown = null;

      for (const payload of payloadVariants) {
        try {
          res = await api.post<LoginResponse>('/api/users/login', payload);
          break;
        } catch (e) {
          lastError = e;
          // Network / timeout gibi durumlarda gereksiz tekrar yapma.
          if (e instanceof AxiosError && !e.response) {
            throw e;
          }
        }
      }

      if (!res) {
        // Backward compatibility for local mock backend.
        for (const payload of payloadVariants) {
          try {
            res = await api.post<LoginResponse>('/api/auth/login', payload);
            break;
          } catch (e) {
            lastError = e;
            if (e instanceof AxiosError && !e.response) {
              throw e;
            }
          }
        }
      }

      if (!res) throw lastError;

      const responseBody = res.data?.data ?? res.data;
      const token = responseBody?.token;
      const user = responseBody?.user;

      if (!token) {
        throw new Error('Login response does not include token.');
      }

      // Token'ı storage'a kaydet
      await AsyncStorage.setItem('auth_token', token);

      // Backend mock token JWT olmayabilir; önce decode dene, olmazsa response.user kullan.
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(decoded.user));
        return decoded.user;
      } catch {
        const fallbackUser: User = {
          _id: String((user as any)?.id ?? (user as any)?._id ?? '1'),
          username: user?.username ?? (user as any)?.name ?? 'User',
          email: normalizedIdentifier,
          type: user?.type ?? 'GM',
        };
        await AsyncStorage.setItem('auth_user', JSON.stringify(fallbackUser));
        return fallbackUser;
      }
    } catch (e) {
      throw handleError(e);
    }
  },

  // POST /api/users
  register: async (data: RegisterRequest): Promise<void> => {
    if (USE_MOCK) return;

    try {
      try {
        await api.post('/api/users', data);
      } catch {
        await api.post('/api/auth/register', data);
      }
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

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return null;

      // Mock modda token doğrulama atla
      if (USE_MOCK || token === 'mock_token') {
        return JSON.parse(raw);
      }

      // Token süresi dolmuş mu kontrol et
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