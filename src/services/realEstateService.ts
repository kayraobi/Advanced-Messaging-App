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
};
