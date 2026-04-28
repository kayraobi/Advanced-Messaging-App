import api, { handleError } from './api';
import { Event } from '../types/event.types';

export const eventService = {

  // GET /api/events — Returns all events
  async getAll(): Promise<Event[]> {
    try {
      const res = await api.get<Event[]>('/api/events');
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/events/featured — Get featured 10 events
  async getFeatured(): Promise<Event[]> {
    try {
      const res = await api.get<Event[]>('/api/events/featured');
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/events/pinned — Returns all pinned events
  async getPinned(): Promise<Event[]> {
    try {
      const res = await api.get<Event[]>('/api/events/pinned');
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/events/{id} — Get an event by ID
  async getById(id: string): Promise<Event> {
    try {
      const res = await api.get<Event>(`/api/events/${id}`);
      return res.data;
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
};
