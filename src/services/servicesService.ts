import api, { handleError } from './api';

export interface Service {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
  displayUrl?: string;
  pictures?: string[];
  serviceType?: { _id: string; name: string } | string;
  price?: number | string;
  contact?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  location?: string;
  popular?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export const servicesService = {

  async getAll(): Promise<Service[]> {
    try {
      const res = await api.get<any>('/api/services');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },

  async getPopular(): Promise<Service[]> {
    try {
      const res = await api.get<any>('/api/services/popular');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },

  async getById(id: string): Promise<Service> {
    try {
      const res = await api.get<any>(`/api/services/${id}`);
      return res.data?.data ?? res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  async getByType(serviceType: string): Promise<Service[]> {
    try {
      const res = await api.get<any>(`/api/services/by-service-type/${serviceType}`);
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },
};
