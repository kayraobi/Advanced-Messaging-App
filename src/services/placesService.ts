import api, { handleError } from './api';

export interface Place {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
  content?: string;
  displayUrl?: string;
  pictures?: string[];
  address?: string;
  location?: string;
  placeType?: { _id: string; name: string } | string;
  tags?: Array<{ _id: string; name: string } | string>;
  approved?: boolean;
  featured?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export const placesService = {

  // GET /api/places — Returns all places
  async getAll(): Promise<Place[]> {
    try {
      const res = await api.get<any>('/api/places');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/places/featured — Get featured 10 places
  async getFeatured(): Promise<Place[]> {
    try {
      const res = await api.get<any>('/api/places/featured');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/places/{id} — Get a place by ID
  async getById(id: string): Promise<Place> {
    try {
      const res = await api.get<any>(`/api/places/${id}`);
      return res.data?.data ?? res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/places/by-place-type/{type} — Get places by type
  async getByType(type: string): Promise<Place[]> {
    try {
      const res = await api.get<any>(`/api/places/by-place-type/${type}`);
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },
};
