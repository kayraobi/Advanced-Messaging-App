import api, { handleError } from './api';
import { unwrapApiEntity, unwrapApiList } from '../utils/apiUnwrap';

export interface Service {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
  displayUrl?: string;
  pictures?: string[];
  serviceType?: { _id: string; name: string } | string;
  price?: number | string;
  contact?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  location?: string;
  popular?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

/** Services API ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Services)) */
export const servicesService = {
  async getAll(): Promise<Service[]> {
    try {
      const res = await api.get<unknown>('/api/services');
      return unwrapApiList<Service>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  async getPopular(): Promise<Service[]> {
    try {
      const res = await api.get<unknown>('/api/services/popular');
      return unwrapApiList<Service>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  async getById(id: string): Promise<Service> {
    try {
      const res = await api.get<unknown>(`/api/services/${encodeURIComponent(id)}`);
      const entity = unwrapApiEntity<Service>(res.data);
      if (entity && typeof entity === 'object' && '_id' in entity) {
        return entity as Service;
      }
      const raw = res.data as { data?: Service };
      return raw?.data ?? (res.data as Service);
    } catch (e) {
      throw handleError(e);
    }
  },

  async getByType(serviceType: string): Promise<Service[]> {
    try {
      const res = await api.get<unknown>(
        `/api/services/by-service-type/${encodeURIComponent(serviceType)}`,
      );
      return unwrapApiList<Service>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  async create(body: Record<string, unknown>): Promise<Service> {
    try {
      const res = await api.post<unknown>('/api/services', body);
      const entity = unwrapApiEntity<Service>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid service response');
      }
      return entity as Service;
    } catch (e) {
      throw handleError(e);
    }
  },

  async update(id: string, body: Record<string, unknown>): Promise<Service> {
    try {
      const res = await api.put<unknown>(`/api/services/${encodeURIComponent(id)}`, body);
      const entity = unwrapApiEntity<Service>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid service response');
      }
      return entity as Service;
    } catch (e) {
      throw handleError(e);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/services/${encodeURIComponent(id)}`);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** DELETE /api/services/{id}/images/{imageUrl} */
  async deleteImage(serviceId: string, imageUrl: string): Promise<void> {
    try {
      const encoded = encodeURIComponent(imageUrl);
      await api.delete(`/api/services/${encodeURIComponent(serviceId)}/images/${encoded}`);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/services/{id}/images/reorder */
  async reorderImages(serviceId: string, body: Record<string, unknown>): Promise<void> {
    try {
      await api.put(`/api/services/${encodeURIComponent(serviceId)}/images/reorder`, body);
    } catch (e) {
      throw handleError(e);
    }
  },
};
