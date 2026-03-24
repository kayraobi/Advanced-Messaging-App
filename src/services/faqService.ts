import api, { handleError, USE_MOCK } from './api';
import { faqs, FaqItem } from '../data/faqs';

export const faqService = {
  getAll: async (): Promise<FaqItem[]> => {
    if (USE_MOCK) return faqs;

    try {
      const res = await api.get<FaqItem[]>('/api/faqs');
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },
};
