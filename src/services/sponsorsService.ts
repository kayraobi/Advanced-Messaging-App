import api, { handleError } from './api';
import { unwrapApiEntity, unwrapApiList } from '../utils/apiUnwrap';

export interface Sponsor {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
  logo?: string;
  displayUrl?: string;
  image?: string;
  website?: string;
  url?: string;
  link?: string;
}

/** Sponsors API ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Sponsors)) */
export const sponsorsService = {
  async getAll(): Promise<Sponsor[]> {
    try {
      const res = await api.get<unknown>('/api/sponsors');
      return unwrapApiList<Sponsor>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  async getById(id: string): Promise<Sponsor> {
    try {
      const res = await api.get<unknown>(`/api/sponsors/${encodeURIComponent(id)}`);
      const entity = unwrapApiEntity<Sponsor>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Sponsor not found');
      }
      return entity as Sponsor;
    } catch (e) {
      throw handleError(e);
    }
  },

  async create(body: Record<string, unknown>): Promise<Sponsor> {
    try {
      const res = await api.post<unknown>('/api/sponsors', body);
      const entity = unwrapApiEntity<Sponsor>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid sponsor response');
      }
      return entity as Sponsor;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/sponsors/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Sponsors/put_api_sponsors__id_)) */
  async update(id: string, body: Record<string, unknown>): Promise<Sponsor> {
    try {
      const res = await api.put<unknown>(`/api/sponsors/${encodeURIComponent(id)}`, body);
      const entity = unwrapApiEntity<Sponsor>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid sponsor response');
      }
      return entity as Sponsor;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** DELETE /api/sponsors/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Sponsors/delete_api_sponsors__id_)) */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/sponsors/${encodeURIComponent(id)}`);
    } catch (e) {
      throw handleError(e);
    }
  },
};
