import api, { handleError } from './api';
import { unwrapApiEntity, unwrapApiList } from '../utils/apiUnwrap';

export interface RealEstate {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  content?: string;
  displayUrl?: string;
  pictures?: string[];
  price?: number | string;
  priceLabel?: string;
  type?: string;
  realEstateType?: { _id: string; name: string } | string;
  address?: string;
  location?: string;
  area?: number;
  rooms?: number;
  bathrooms?: number;
  approved?: boolean;
  featured?: boolean;
  createdAt?: string;
  user?: { _id: string; username: string } | string;
  [key: string]: any;
}

export const realEstateService = {

  // GET /api/realEstate — Returns all listings
  /** GET /api/realEstate ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Real%20Estate/get_api_realEstate)) */
  async getAll(): Promise<RealEstate[]> {
    try {
      const res = await api.get<unknown>('/api/realEstate');
      return unwrapApiList<RealEstate>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** GET /api/realEstate/featured */
  async getFeatured(): Promise<RealEstate[]> {
    try {
      const res = await api.get<unknown>('/api/realEstate/featured');
      return unwrapApiList<RealEstate>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** GET /api/realEstate/{id} */
  async getById(id: string): Promise<RealEstate> {
    try {
      const res = await api.get<unknown>(`/api/realEstate/${encodeURIComponent(id)}`);
      const entity = unwrapApiEntity<RealEstate>(res.data);
      if (entity && typeof entity === 'object' && '_id' in entity) {
        return entity as RealEstate;
      }
      const list = unwrapApiList<RealEstate>(res.data);
      if (list.length === 1) return list[0];
      throw new Error('Listing not found');
    } catch (e) {
      throw handleError(e);
    }
  },

  /** GET /api/realEstate/by-type/{type} */
  async getByType(type: string): Promise<RealEstate[]> {
    try {
      const res = await api.get<unknown>(
        `/api/realEstate/by-type/${encodeURIComponent(type)}`,
      );
      return unwrapApiList<RealEstate>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** GET /api/realEstate/user/{userId} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Real%20Estate/get_api_realEstate_user__userId_)) */
  async getByUserId(userId: string): Promise<RealEstate[]> {
    try {
      const res = await api.get<unknown>(
        `/api/realEstate/user/${encodeURIComponent(userId)}`,
      );
      return unwrapApiList<RealEstate>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** POST /api/realEstate/ — authenticated ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Real%20Estate/post_api_realEstate_)) */
  async submit(body: Record<string, unknown>): Promise<RealEstate> {
    try {
      const res = await api.post<unknown>('/api/realEstate/', body);
      const entity = unwrapApiEntity<RealEstate>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid listing response');
      }
      return entity as RealEstate;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/realEstate/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Real%20Estate/put_api_realEstate__id_)) */
  async update(id: string, body: Record<string, unknown>): Promise<RealEstate> {
    try {
      const res = await api.put<unknown>(`/api/realEstate/${encodeURIComponent(id)}`, body);
      const entity = unwrapApiEntity<RealEstate>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid listing response');
      }
      return entity as RealEstate;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** DELETE /api/realEstate/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Real%20Estate/delete_api_realEstate__id_)) */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/realEstate/${encodeURIComponent(id)}`);
    } catch (e) {
      throw handleError(e);
    }
  },

  /**
   * DELETE /api/realEstate/{id}/images/{imageUrl}
   * ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Real%20Estate/delete_api_realEstate__id__images))
   */
  async deleteImage(listingId: string, imageUrl: string): Promise<void> {
    try {
      const encoded = encodeURIComponent(imageUrl);
      await api.delete(`/api/realEstate/${encodeURIComponent(listingId)}/images/${encoded}`);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/realEstate/{id}/images/reorder ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Real%20Estate/put_api_realEstate__id__images_reorder)) */
  async reorderImages(listingId: string, body: Record<string, unknown>): Promise<void> {
    try {
      await api.put(`/api/realEstate/${encodeURIComponent(listingId)}/images/reorder`, body);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/realEstate/{id}/approve ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Real%20Estate/put_api_realEstate__id__approve)) */
  async approve(id: string, body?: Record<string, unknown>): Promise<void> {
    try {
      await api.put(`/api/realEstate/${encodeURIComponent(id)}/approve`, body ?? {});
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/realEstate/{id}/unapprove ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Real%20Estate/put_api_realEstate__id__unapprove)) */
  async unapprove(id: string, body?: Record<string, unknown>): Promise<void> {
    try {
      await api.put(`/api/realEstate/${encodeURIComponent(id)}/unapprove`, body ?? {});
    } catch (e) {
      throw handleError(e);
    }
  },
};
