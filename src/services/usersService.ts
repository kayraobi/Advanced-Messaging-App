import api, { handleError } from './api';
import type { User } from '../types/user.types';
import { unwrapApiEntity, unwrapApiList } from '../utils/apiUnwrap';

function normalizeUserRaw(raw: Record<string, unknown>, fallbackId?: string): User | null {
  const uid = String(raw._id ?? raw.id ?? fallbackId ?? '').trim();
  if (!uid) return null;
  const email = String(raw.email ?? '').trim();
  const usernameRaw = String(raw.username ?? '').trim();
  const username =
    usernameRaw || (email.includes('@') ? email.split('@')[0] : email) || 'member';
  const interestsRaw = raw.interests;
  return {
    _id: uid,
    username,
    email,
    type: String(raw.type ?? raw.role ?? 'Member'),
    name: raw.name != null ? String(raw.name) : undefined,
    phone: raw.phone != null ? String(raw.phone) : undefined,
    interests: Array.isArray(interestsRaw) ? interestsRaw.map((x) => String(x)) : undefined,
  };
}

/** Users API ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Users)) */
export const usersService = {
  /** GET /api/users */
  async getAll(): Promise<User[]> {
    try {
      const res = await api.get<unknown>('/api/users');
      const rows = unwrapApiList<Record<string, unknown>>(res.data);
      const users: User[] = [];
      for (const row of rows) {
        const u = normalizeUserRaw(row);
        if (u) users.push(u);
      }
      return users;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** GET /api/users/{id} */
  async getById(id: string): Promise<User> {
    try {
      const res = await api.get<unknown>(`/api/users/${encodeURIComponent(id)}`);
      const raw = unwrapApiEntity<Record<string, unknown>>(res.data);
      if (!raw || typeof raw !== 'object') {
        throw new Error('User not found');
      }
      const u = normalizeUserRaw(raw, id);
      if (!u) throw new Error('User not found');
      return u;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/users/{id} */
  async update(id: string, body: Record<string, unknown>): Promise<User> {
    try {
      const res = await api.put<unknown>(`/api/users/${encodeURIComponent(id)}`, body);
      const raw = unwrapApiEntity<Record<string, unknown>>(res.data);
      if (!raw || typeof raw !== 'object') {
        throw new Error('Invalid user response');
      }
      const u = normalizeUserRaw(raw, id);
      if (!u) throw new Error('Invalid user response');
      return u;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** DELETE /api/users/{id} */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/users/${encodeURIComponent(id)}`);
    } catch (e) {
      throw handleError(e);
    }
  },
};
