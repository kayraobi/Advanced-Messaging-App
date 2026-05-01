import api, { handleError } from './api';
import { unwrapApiEntity } from '../utils/apiUnwrap';

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

  /** POST /api/places — authenticated create ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Places/post_api_places)) */
  async create(body: Record<string, unknown>): Promise<Place> {
    try {
      const res = await api.post<unknown>('/api/places', body);
      const entity = unwrapApiEntity<Place>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid create place response');
      }
      return entity as Place;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** POST /api/places/ — guest suggestion ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Places/post_api_places_)) */
  async submitGuest(body: Record<string, unknown>): Promise<Place> {
    try {
      const res = await api.post<unknown>('/api/places/', body);
      const entity = unwrapApiEntity<Place>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid submit place response');
      }
      return entity as Place;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/places/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Places/put_api_places__id_)) */
  async update(id: string, body: Record<string, unknown>): Promise<Place> {
    try {
      const res = await api.put<unknown>(`/api/places/${encodeURIComponent(id)}`, body);
      const entity = unwrapApiEntity<Place>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid place response');
      }
      return entity as Place;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** DELETE /api/places/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Places/delete_api_places__id_)) */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/places/${encodeURIComponent(id)}`);
    } catch (e) {
      throw handleError(e);
    }
  },

  /**
   * DELETE /api/places/{id}/images/{imageUrl}
   * ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Places/delete_api_places__id__images))
   */
  async deleteImage(placeId: string, imageUrl: string): Promise<void> {
    try {
      const encoded = encodeURIComponent(imageUrl);
      await api.delete(`/api/places/${encodeURIComponent(placeId)}/images/${encoded}`);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/places/{id}/approve ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Places/put_api_places__id__approve)) */
  async approve(id: string, body?: Record<string, unknown>): Promise<void> {
    try {
      await api.put(`/api/places/${encodeURIComponent(id)}/approve`, body ?? {});
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/places/{id}/images/reorder ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Places/put_api_places__id__images_reorder)) */
  async reorderImages(placeId: string, body: Record<string, unknown>): Promise<void> {
    try {
      await api.put(`/api/places/${encodeURIComponent(placeId)}/images/reorder`, body);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** POST /api/places/{id}/tags ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Places/post_api_places__id__tags)) */
  async addTag(placeId: string, body: Record<string, unknown>): Promise<void> {
    try {
      await api.post(`/api/places/${encodeURIComponent(placeId)}/tags`, body);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** DELETE /api/places/{id}/tags ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Places/delete_api_places__id__tags)) */
  async removeTag(placeId: string, body?: Record<string, unknown>): Promise<void> {
    try {
      await api.delete(`/api/places/${encodeURIComponent(placeId)}/tags`, {
        data: body,
      });
    } catch (e) {
      throw handleError(e);
    }
  },
};
