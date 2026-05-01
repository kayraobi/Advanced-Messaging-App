import api, { handleError } from './api';

export interface QaA {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  createdAt?: string;
}

export const qaasService = {

  async getAll(): Promise<QaA[]> {
    try {
      const res = await api.get<any>('/api/qaas');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },

  async getById(id: string): Promise<QaA> {
    try {
      const res = await api.get<any>(`/api/qaas/${id}`);
      return res.data?.data ?? res.data;
    } catch (e) {
      throw handleError(e);
    }
  },
};
