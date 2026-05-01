import api, { handleError } from './api';
import { News, NewsListResponse } from '../types/news.types';
import { unwrapApiEntity } from '../utils/apiUnwrap';

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

  /** POST /api/news ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/News/post_api_news)) */
  async create(body: Record<string, unknown>): Promise<News> {
    try {
      const res = await api.post<unknown>('/api/news', body);
      const entity = unwrapApiEntity<News>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid news response');
      }
      return entity as News;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/news/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/News/put_api_news__id_)) */
  async update(id: string, body: Record<string, unknown>): Promise<News> {
    try {
      const res = await api.put<unknown>(`/api/news/${encodeURIComponent(id)}`, body);
      const entity = unwrapApiEntity<News>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid news response');
      }
      return entity as News;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** DELETE /api/news/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/News/delete_api_news__id_)) */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/news/${encodeURIComponent(id)}`);
    } catch (e) {
      throw handleError(e);
    }
  },

  /**
   * DELETE /api/news/{id}/images/{imageUrl} — path segment is URL-encoded image URL
   * ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/News/delete_api_news__id__images))
   */
  async deleteImage(newsId: string, imageUrl: string): Promise<void> {
    try {
      const encoded = encodeURIComponent(imageUrl);
      await api.delete(`/api/news/${encodeURIComponent(newsId)}/images/${encoded}`);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/news/{id}/images/reorder ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/News/put_api_news__id__images_reorder)) */
  async reorderImages(newsId: string, body: Record<string, unknown>): Promise<void> {
    try {
      await api.put(`/api/news/${encodeURIComponent(newsId)}/images/reorder`, body);
    } catch (e) {
      throw handleError(e);
    }
  },
};
