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
import {
  enrichUserWithProfilePhoto,
  setCachedProfilePhoto,
} from './profilePhotoCache';

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
  const photoRaw =
    r.displayUrl ?? r.profilePicture ?? r.avatar ?? r.avatarUrl ?? r.picture;
  const displayUrl =
    typeof photoRaw === 'string' && photoRaw.trim().length > 0
      ? photoRaw.trim()
      : undefined;
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
    displayUrl,
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

      // Sadece /api/users/login — Ibrahim'in sunucusu bu endpoint'i kullanıyor.
      // İlk payload {email, password} çalışıyorsa direkt geç, 401 gelirse dur.
      let res: { data: any } | null = null;
      let lastError: unknown = null;

      for (const payload of payloadVariants) {
        try {
          res = await api.post<LoginResponse>('/api/users/login', payload);
          break;
        } catch (e) {
          lastError = e;
          // Network / timeout → direkt hata fırlat
          if (e instanceof AxiosError && !e.response) throw e;
          // 401 Unauthorized → şifre yanlış, devam etme
          if (e instanceof AxiosError && e.response?.status === 401) break;
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
          const enriched = await enrichUserWithProfilePhoto(me);
          await AsyncStorage.setItem('auth_user', JSON.stringify(enriched));
          return enriched;
        }
      } catch {
        /* fall through */
      }

      // Backend mock token might not be a JWT; try to decode first, fallback to response.user if it fails.
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const normalized = normalizeUserFromMe(decoded.user);
        const finalUser = normalized ?? (decoded.user as User);
        const enriched = await enrichUserWithProfilePhoto(finalUser);
        await AsyncStorage.setItem('auth_user', JSON.stringify(enriched));
        return enriched;
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
        const enriched = await enrichUserWithProfilePhoto(fallbackUser);
        await AsyncStorage.setItem('auth_user', JSON.stringify(enriched));
        return enriched;
      }
    } catch (e) {
      throw handleError(e);
    }
  },

  // POST /api/users
  register: async (data: RegisterRequest): Promise<void> => {
    try {
      await api.post('/api/users', data);
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
        const parsed = JSON.parse(raw) as User;
        return enrichUserWithProfilePhoto(parsed);
      }

      // Check if token is expired
      const decoded = jwtDecode<JwtPayload>(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        await authService.logout();
        return null;
      }

      const parsed = JSON.parse(raw) as User;
      return enrichUserWithProfilePhoto(parsed);
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
      const user = normalizeUserFromMe(raw);
      if (!user) return null;
      return enrichUserWithProfilePhoto(user);
    } catch {
      return null;
    }
  },

  /** Payload variants so backend can persist photo under different field names. */
  buildProfilePhotoPayload: (displayUrl: string): Record<string, string> => ({
    displayUrl,
    profilePicture: displayUrl,
    avatar: displayUrl,
    picture: displayUrl,
    display_url: displayUrl,
    profile_picture: displayUrl,
  }),

  /** Merge fields into stored user (when API profile update is unavailable). */
  mergeStoredUser: async (partial: Partial<User>): Promise<User | null> => {
    const stored = await authService.getStoredUser();
    if (!stored) return null;
    const merged = { ...stored, ...partial };
    await AsyncStorage.setItem('auth_user', JSON.stringify(merged));
    return merged;
  },

  /**
   * Update profile: PATCH /api/users/me, then PUT /api/users/{id}, then local cache.
   */
  updateMe: async (
    payload: Partial<Pick<User, 'username' | 'name' | 'phone' | 'displayUrl'>> &
      Record<string, unknown>,
  ): Promise<User | null> => {
    if (USE_MOCK) return authService.mergeStoredUser(payload);

    const stored = await authService.getStoredUser();
    let savedOnApi = false;
    const photoUrl = typeof payload.displayUrl === 'string' ? payload.displayUrl : undefined;
    const apiBody =
      photoUrl != null
        ? { ...payload, ...authService.buildProfilePhotoPayload(photoUrl) }
        : payload;

    try {
      await api.patch('/api/users/me', apiBody);
      savedOnApi = true;
    } catch (patchErr) {
      const status = patchErr instanceof AxiosError ? patchErr.response?.status : undefined;
      if (stored?._id && (status === 404 || status === 405 || status === 501 || status === 400)) {
        try {
          await api.put(`/api/users/${encodeURIComponent(stored._id)}`, apiBody);
          savedOnApi = true;
        } catch {
          /* try cache fallback below */
        }
      }
      if (!savedOnApi && photoUrl && stored) {
        await setCachedProfilePhoto(stored._id, photoUrl);
        return authService.mergeStoredUser({ displayUrl: photoUrl });
      }
      if (!savedOnApi) throw handleError(patchErr);
    }

    const merged = await authService.getMe();
    if (merged) {
      const withPhoto = photoUrl
        ? await enrichUserWithProfilePhoto({
            ...merged,
            displayUrl: merged.displayUrl ?? photoUrl,
          })
        : merged;
      await AsyncStorage.setItem('auth_user', JSON.stringify(withPhoto));
      if (photoUrl) await setCachedProfilePhoto(withPhoto._id, photoUrl);
      return withPhoto;
    }
    if (stored) {
      if (photoUrl) await setCachedProfilePhoto(stored._id, photoUrl);
      return authService.mergeStoredUser(
        photoUrl ? { displayUrl: photoUrl } : payload,
      );
    }
    return null;
  },

  /** Upload URL → API (when supported) + per-user cache (survives logout). */
  saveProfilePhoto: async (displayUrl: string): Promise<User | null> => {
    const stored = await authService.getStoredUser();
    if (stored?._id) await setCachedProfilePhoto(stored._id, displayUrl);
    const updated = await authService.updateMe({ displayUrl });
    if (updated) return updated;
    return authService.mergeStoredUser({ displayUrl });
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