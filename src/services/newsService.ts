import api, { handleError } from './api';
import { News, NewsListResponse } from '../types/news.types';

/** Normalizes list responses: raw array, `{ data: News[] }`, or nested shapes from some gateways. */
function parseNewsArray(payload: unknown): News[] {
	if (payload == null) return [];
	if (Array.isArray(payload)) return payload as News[];
	if (typeof payload === 'object' && payload !== null && 'data' in payload) {
		const inner = (payload as { data: unknown }).data;
		if (Array.isArray(inner)) return inner as News[];
		if (inner && typeof inner === 'object' && 'data' in inner) {
			const nested = (inner as { data: unknown }).data;
			if (Array.isArray(nested)) return nested as News[];
		}
	}
	return [];
}

export const newsService = {
	async getPage(page = 1, limit = 10): Promise<NewsListResponse> {
		try {
			const res = await api.get<NewsListResponse>(`/api/news?page=${page}&limit=${limit}`);
			return res.data;
		} catch (e) {
			throw handleError(e);
		}
	},

	async getSlides(): Promise<News[]> {
		try {
			const res = await api.get<unknown>('/api/news/slides');
			return parseNewsArray(res.data);
		} catch (e) {
			throw handleError(e);
		}
	},

	async getLatest(): Promise<News[]> {
		try {
			const res = await api.get<unknown>('/api/news/latest');
			return parseNewsArray(res.data);
		} catch (e) {
			throw handleError(e);
		}
	},

	async getAll(): Promise<News[]> {
		try {
			const res = await api.get<unknown>('/api/news');
			return parseNewsArray(res.data);
		} catch (e) {
			throw handleError(e);
		}
	},

  async getById(id: string): Promise<News> {
    try {
      const res = await api.get<News | { data: News }>(`/api/news/${id}`);
      const body = res.data as any;
      return body?.data ?? body;
    } catch (e) {
      throw handleError(e);
    }
  },
};
