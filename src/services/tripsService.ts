import api, { handleError } from './api';
import { unwrapApiEntity, unwrapApiList } from '../utils/apiUnwrap';

export interface Trip {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  displayUrl?: string;
  pictures?: string[];
  destination?: string;
  price?: number | string;
  duration?: string | number;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  currentApplicants?: number;
  availableDates?: string[];
  applications?: TripApplication[];
  createdAt?: string;
  [key: string]: unknown;
}

export interface TripApplication {
  _id?: string;
  user?: { _id?: string; username?: string; name?: string } | string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export const tripsService = {
  async getAll(): Promise<Trip[]> {
    try {
      const res = await api.get<unknown>('/api/trips');
      return unwrapApiList<Trip>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** GET /api/trips/with-applications */
  async getWithApplications(): Promise<Trip[]> {
    try {
      const res = await api.get<unknown>('/api/trips/with-applications');
      return unwrapApiList<Trip>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  async getById(id: string): Promise<Trip> {
    try {
      const res = await api.get<unknown>(`/api/trips/${encodeURIComponent(id)}`);
      const entity = unwrapApiEntity<Trip>(res.data);
      if (entity && typeof entity === 'object' && '_id' in entity) {
        return entity as Trip;
      }
      const raw = res.data as { data?: Trip };
      return raw?.data ?? (res.data as Trip);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** GET /api/trips/{id}/applications */
  async getApplications(id: string): Promise<TripApplication[]> {
    try {
      const res = await api.get<unknown>(`/api/trips/${encodeURIComponent(id)}/applications`);
      return unwrapApiList<TripApplication>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  async getAvailableDates(id: string): Promise<string[]> {
    try {
      const res = await api.get<unknown>(`/api/trips/${encodeURIComponent(id)}/available-dates`);
      const list = unwrapApiList<string>(res.data);
      if (list.length > 0) return list;
      const entity = unwrapApiEntity<{ dates?: string[] }>(res.data);
      return Array.isArray(entity?.dates) ? entity!.dates! : [];
    } catch (e) {
      throw handleError(e);
    }
  },

  async apply(id: string): Promise<void> {
    try {
      await api.post(`/api/trips/${encodeURIComponent(id)}/apply`);
    } catch (e) {
      throw handleError(e);
    }
  },

  async create(body: Record<string, unknown>): Promise<Trip> {
    try {
      const res = await api.post<unknown>('/api/trips', body);
      const entity = unwrapApiEntity<Trip>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid trip response');
      }
      return entity as Trip;
    } catch (e) {
      throw handleError(e);
    }
  },

  async update(id: string, body: Record<string, unknown>): Promise<Trip> {
    try {
      const res = await api.put<unknown>(`/api/trips/${encodeURIComponent(id)}`, body);
      const entity = unwrapApiEntity<Trip>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid trip response');
      }
      return entity as Trip;
    } catch (e) {
      throw handleError(e);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/trips/${encodeURIComponent(id)}`);
    } catch (e) {
      throw handleError(e);
    }
  },
};
