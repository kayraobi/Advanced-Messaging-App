import api, { handleError, USE_MOCK } from './api';
import { News, NewsListResponse } from '../types/news.types';

// Mock data — Hostinger API hazır olana kadar kullanılır
const MOCK_NEWS: News[] = [
  {
    _id: '1',
    title: 'How to Open a Bank Account in Bosnia',
    content: 'A step-by-step guide for expats...',
    pictures: [],
    pictureDescription: '',
    sources: 'sarajevoexpats.com',
    showInSlider: true,
    slidePriority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Public Transport Guide in Sarajevo',
    content: 'Everything you need to know about trams and buses...',
    pictures: [],
    pictureDescription: '',
    sources: 'sarajevoexpats.com',
    showInSlider: false,
    slidePriority: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const newsService = {
  getPage: async (page = 1, limit = 10): Promise<NewsListResponse> => {
    if (USE_MOCK) {
      return {
        data: MOCK_NEWS,
        currentPage: 1,
        totalPages: 1,
        totalItems: MOCK_NEWS.length,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }

    try {
      const res = await api.get<NewsListResponse>(`/api/news?page=${page}&limit=${limit}`);
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // HomeScreen carousel
  // GET /api/news/slides
  getSlides: async (): Promise<News[]> => {
    if (USE_MOCK) return MOCK_NEWS.filter(n => n.showInSlider);
    try {
      const res = await api.get<News[] | NewsListResponse>('/api/news/slides');
      return Array.isArray(res.data) ? res.data : res.data.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // HomeScreen liste
  // GET /api/news/latest
  getLatest: async (): Promise<News[]> => {
    if (USE_MOCK) return MOCK_NEWS;
    try {
      const res = await api.get<News[] | NewsListResponse>('/api/news/latest');
      return Array.isArray(res.data) ? res.data : res.data.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // Tüm haberler
  // GET /api/news
  getAll: async (): Promise<News[]> => {
    if (USE_MOCK) return MOCK_NEWS;
    try {
      const res = await api.get<News[] | NewsListResponse>('/api/news');
      return Array.isArray(res.data) ? res.data : res.data.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // Haber detay
  // GET /api/news/{id}
  getById: async (id: string): Promise<News> => {
    if (USE_MOCK) {
      const found = MOCK_NEWS.find(n => n._id === id);
      if (!found) throw new Error('News not found.');
      return found;
    }
    try {
      const res = await api.get<News>(`/api/news/${id}`);
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },
};
