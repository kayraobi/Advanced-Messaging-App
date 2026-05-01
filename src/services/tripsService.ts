import api, { handleError } from './api';

export interface Trip {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  displayUrl?: string;
  pictures?: string[];
  destination?: string;
  price?: number | string;
  duration?: string | number;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  currentApplicants?: number;
  availableDates?: string[];
  createdAt?: string;
  [key: string]: any;
}

export const tripsService = {

  async getAll(): Promise<Trip[]> {
    try {
      const res = await api.get<any>('/api/trips');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },

  async getById(id: string): Promise<Trip> {
    try {
      const res = await api.get<any>(`/api/trips/${id}`);
      return res.data?.data ?? res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  async getAvailableDates(id: string): Promise<string[]> {
    try {
      const res = await api.get<any>(`/api/trips/${id}/available-dates`);
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },

  async apply(id: string): Promise<void> {
    try {
      await api.post(`/api/trips/${id}/apply`);
    } catch (e) {
      throw handleError(e);
    }
  },
};
