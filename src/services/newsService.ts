import api, { handleError } from './api';
import { News, NewsListResponse } from '../types/news.types';

export const newsService = {

  // GET /api/news?page=1&limit=10 — Returns paginated news
  async getPage(page = 1, limit = 10): Promise<NewsListResponse> {
    try {
      const res = await api.get<NewsListResponse>(`/api/news?page=${page}&limit=${limit}`);
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/news/slides — HomeScreen carousel
  async getSlides(): Promise<News[]> {
    try {
      const res = await api.get<News[] | NewsListResponse>('/api/news/slides');
      return Array.isArray(res.data) ? res.data : res.data.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/news/latest — HomeScreen liste
  async getLatest(): Promise<News[]> {
    try {
      const res = await api.get<News[] | NewsListResponse>('/api/news/latest');
      return Array.isArray(res.data) ? res.data : res.data.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/news — Returns all news
  async getAll(): Promise<News[]> {
    try {
      const res = await api.get<News[] | NewsListResponse>('/api/news');
      return Array.isArray(res.data) ? res.data : res.data.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/news/{id} — Get a news item by ID
  async getById(id: string): Promise<News> {
    try {
      const res = await api.get<News>(`/api/news/${id}`);
      return res.data;
    } catch (e) {
      throw handleError(e);
    }
  },
};
