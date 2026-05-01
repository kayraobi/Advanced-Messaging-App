import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { handleError } from './api';
import { Event } from '../types/event.types';
import { unwrapApiEntity, unwrapApiList } from '../utils/apiUnwrap';

const RSVP_IDS_KEY = '@sarajevo_rsvp_event_ids';

async function getStoredRsvpIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RSVP_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function persistRsvpIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(RSVP_IDS_KEY, JSON.stringify(ids));
}

export const eventService = {

  // GET /api/events — Returns all events
  async getAll(): Promise<any[]> {
    try {
      const res = await api.get<unknown>('/api/events');
      return unwrapApiList(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/events/featured — Get featured 10 events
  async getFeatured(): Promise<Event[]> {
    try {
      const res = await api.get<unknown>('/api/events/featured');
      return unwrapApiList<Event>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/events/pinned — Returns all pinned events
  async getPinned(): Promise<Event[]> {
    try {
      const res = await api.get<unknown>('/api/events/pinned');
      return unwrapApiList<Event>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/events/{id} — Get an event by ID (Swagger: Events get_api_events__id_)
  async getById(id: string): Promise<Event> {
    try {
      const res = await api.get<unknown>(`/api/events/${id}`);
      const entity = unwrapApiEntity<Event>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Event not found');
      }
      return entity;
    } catch (e) {
      throw handleError(e);
    }
  },

  // POST /api/events — Fetch and create new event from Instagram post
  async create(data: { url: string }): Promise<Event> {
    try {
      const res = await api.post<Event>('/api/events', data);
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // POST /api/events/full — Fetch and create new events from Instagram
  async createFull(data: { url: string }): Promise<Event[]> {
    try {
      const res = await api.post<Event[]>('/api/events/full', data);
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // PUT /api/events/{id} — Update an event
  async update(id: string, data: Partial<Event>): Promise<Event> {
    try {
      const res = await api.put<Event>(`/api/events/${id}`, data);
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // DELETE /api/events/{id} — Delete an event
  async deleteById(id: string): Promise<void> {
    try {
      await api.delete(`/api/events/${id}`);
    } catch (e) {
      throw handleError(e);
    }
  },

  // DELETE /api/events/delete-image/{id} — Delete an image from an event
  async deleteImage(id: string): Promise<void> {
    try {
      await api.delete(`/api/events/delete-image/${id}`);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** POST /api/events/:id/rsvp — join event (requires auth). */
  async rsvp(eventId: string): Promise<void> {
    try {
      await api.post(`/api/events/${eventId}/rsvp`);
      const ids = await getStoredRsvpIds();
      if (!ids.includes(eventId)) {
        ids.unshift(eventId);
        await persistRsvpIds(ids);
      }
    } catch (e) {
      throw handleError(e);
    }
  },

  /** DELETE /api/events/:id/rsvp — cancel RSVP. */
  async cancelRsvp(eventId: string): Promise<void> {
    try {
      await api.delete(`/api/events/${eventId}/rsvp`);
      const ids = (await getStoredRsvpIds()).filter((x) => x !== eventId);
      await persistRsvpIds(ids);
    } catch (e) {
      throw handleError(e);
    }
  },

  async hasLocalRsvp(eventId: string): Promise<boolean> {
    const ids = await getStoredRsvpIds();
    return ids.includes(eventId);
  },

  /** Loads stored RSVP ids and resolves each event (offline-friendly list). */
  async getMyRsvpEvents(): Promise<any[]> {
    const ids = await getStoredRsvpIds();
    if (ids.length === 0) return [];
    const results = await Promise.all(
      ids.map((id) => eventService.getById(id).catch(() => null)),
    );
    return results.filter(Boolean);
  },
};
