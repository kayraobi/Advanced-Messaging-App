import api, { handleError, USE_MOCK } from './api';
import { Event } from '../types/event.types';

const MOCK_EVENTS: Event[] = [
  {
    _id: '1',
    content: ['Coffee & Connect at Kibe Mahala'],
    images: [],
    videos: [],
    url: ['https://instagram.com/p/example1'],
    timestamp: new Date().toISOString(),
    pinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    content: ['Language Exchange Night'],
    images: [],
    videos: [],
    url: ['https://instagram.com/p/example2'],
    timestamp: new Date().toISOString(),
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const eventService = {

  // CalendarScreen — tüm etkinlikler
  // GET /api/events
  getAll: async (): Promise<Event[]> => {
    if (USE_MOCK) return MOCK_EVENTS;
    try {
      const res = await api.get<Event[]>('/api/events');
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // HomeScreen — öne çıkan 10 etkinlik
  // GET /api/events/featured
  getFeatured: async (): Promise<Event[]> => {
    if (USE_MOCK) return MOCK_EVENTS.slice(0, 3);
    try {
      const res = await api.get<Event[]>('/api/events/featured');
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // Sabitlenmiş etkinlikler
  // GET /api/events/pinned
  getPinned: async (): Promise<Event[]> => {
    if (USE_MOCK) return MOCK_EVENTS.filter(e => e.pinned);
    try {
      const res = await api.get<Event[]>('/api/events/pinned');
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // EventDetailScreen
  // GET /api/events/{id}
  getById: async (id: string): Promise<Event> => {
    if (USE_MOCK) {
      const found = MOCK_EVENTS.find(e => e._id === id);
      if (!found) throw new Error('Event not found.');
      return found;
    }
    try {
      const res = await api.get<Event>(`/api/events/${id}`);
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },
};
