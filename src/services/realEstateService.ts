import api, { handleError } from './api';

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
  async getAll(): Promise<RealEstate[]> {
    try {
      const res = await api.get<any>('/api/realEstate');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/realEstate/featured — Get featured 10 listings
  async getFeatured(): Promise<RealEstate[]> {
    try {
      const res = await api.get<any>('/api/realEstate/featured');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/realEstate/{id} — Get a listing by ID
  async getById(id: string): Promise<RealEstate> {
    try {
      const res = await api.get<any>(`/api/realEstate/${id}`);
      return res.data?.data ?? res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  // GET /api/realEstate/by-type/{type} — Get listings by type
  async getByType(type: string): Promise<RealEstate[]> {
    try {
      const res = await api.get<any>(`/api/realEstate/by-type/${type}`);
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },
};
