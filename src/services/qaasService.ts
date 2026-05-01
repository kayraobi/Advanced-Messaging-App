import api, { handleError } from './api';
import { unwrapApiEntity, unwrapApiList } from '../utils/apiUnwrap';

export interface QaA {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  createdAt?: string;
}

/** GET /api/qaas — [Swagger](https://test.sarajevoexpats.com/api/api-docs/#/qaas/get_api_qaas) */
export const qaasService = {
  async getAll(): Promise<QaA[]> {
    try {
      const res = await api.get<unknown>('/api/qaas');
      return unwrapApiList<QaA>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** GET /api/qaas/{id} — [Swagger](https://test.sarajevoexpats.com/api/api-docs/#/qaas/get_api_qaas__id_) */
  async getById(id: string): Promise<QaA> {
    try {
      const res = await api.get<unknown>(`/api/qaas/${encodeURIComponent(id)}`);
      const entity = unwrapApiEntity<QaA>(res.data);
      if (!entity || typeof entity !== 'object') {
        throw new Error('Q&A not found');
      }
      return entity as QaA;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** POST /api/qaas ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/qaas/post_api_qaas)) */
  async create(body: Record<string, unknown>): Promise<QaA> {
    try {
      const res = await api.post<unknown>('/api/qaas', body);
      const entity = unwrapApiEntity<QaA>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid Q&A response');
      }
      return entity as QaA;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/qaas/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/qaas/put_api_qaas__id_)) */
  async update(id: string, body: Record<string, unknown>): Promise<QaA> {
    try {
      const res = await api.put<unknown>(`/api/qaas/${encodeURIComponent(id)}`, body);
      const entity = unwrapApiEntity<QaA>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid Q&A response');
      }
      return entity as QaA;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** DELETE /api/qaas/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/qaas/delete_api_qaas__id_)) */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/qaas/${encodeURIComponent(id)}`);
    } catch (e) {
      throw handleError(e);
    }
  },
};
