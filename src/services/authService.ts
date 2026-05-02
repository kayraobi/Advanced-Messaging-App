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
import { unwrapApiEntity } from '../utils/apiUnwrap';

/** Maps GET /api/users/me payload to app User (Swagger Users schema). */
function normalizeUserFromMe(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = String(r._id ?? r.id ?? '').trim();
  if (!id) return null;
  const email = String(r.email ?? '').trim();
  const usernameRaw = String(r.username ?? '').trim();
  const username =
    usernameRaw || (email.includes('@') ? email.split('@')[0] : email) || 'user';
  const interestsRaw = r.interests;
  return {
    _id: id,
    username,
    email,
    type: String(r.type ?? r.role ?? 'Member'),
    name: r.name != null ? String(r.name) : undefined,
    phone: r.phone != null ? String(r.phone) : undefined,
    interests: Array.isArray(interestsRaw)
      ? interestsRaw.map((x) => String(x))
      : undefined,
  };
}

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

      // Save token to storage
      await AsyncStorage.setItem('auth_token', token);

      try {
        const me = await authService.getMe();
        if (me) {
          await AsyncStorage.setItem('auth_user', JSON.stringify(me));
          return me;
        }
      } catch {
        /* fall through */
      }

      // Backend mock token might not be a JWT; try to decode first, fallback to response.user if it fails.
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const normalized = normalizeUserFromMe(decoded.user);
        const finalUser = normalized ?? (decoded.user as User);
        await AsyncStorage.setItem('auth_user', JSON.stringify(finalUser));
        return finalUser;
      } catch {
        const bodyUser = user as Record<string, unknown> | undefined;
        const fallbackUser: User =
          normalizeUserFromMe(bodyUser) ??
          ({
            _id: String((user as any)?.id ?? (user as any)?._id ?? '1'),
            username: user?.username ?? (user as any)?.name ?? 'User',
            email: normalizedIdentifier,
            type: user?.type ?? 'GM',
          } as User);
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

  // Clear storage
  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
  },

  // Fetch current user on app startup
  getStoredUser: async (): Promise<User | null> => {
    try {
      const raw = await AsyncStorage.getItem('auth_user');
      if (!raw) return null;

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return null;

      // Skip token verification in mock mode
      if (USE_MOCK || token === 'mock_token') {
        return JSON.parse(raw);
      }

      // Check if token is expired
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

  // GET /api/users/me — Swagger: Users get_api_users_me
  getMe: async (): Promise<User | null> => {
    try {
      const res = await api.get<unknown>('/api/users/me');
      const raw = unwrapApiEntity<unknown>(res.data);
      return normalizeUserFromMe(raw);
    } catch {
      return null;
    }
  },

  /**
   * PATCH /api/users/me — update profile fields (name, phone, username, …).
   * Backend expects snake_case or camelCase depending on deployment; send camelCase first.
   */
  updateMe: async (
    payload: Partial<Pick<User, 'username' | 'name' | 'phone'>> & Record<string, unknown>,
  ): Promise<User | null> => {
    if (USE_MOCK) return null;

    try {
      await api.patch('/api/users/me', payload);
      const merged = await authService.getMe();
      if (merged) {
        await AsyncStorage.setItem('auth_user', JSON.stringify(merged));
      }
      return merged;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** POST /api/users/me/interests — persist interest labels. */
  updateMyInterests: async (interests: string[]): Promise<void> => {
    if (USE_MOCK) return;

    try {
      await api.post('/api/users/me/interests', { interests });
      const merged = await authService.getMe();
      if (merged) {
        await AsyncStorage.setItem('auth_user', JSON.stringify(merged));
      }
    } catch (e) {
      throw handleError(e);
    }
  },
};