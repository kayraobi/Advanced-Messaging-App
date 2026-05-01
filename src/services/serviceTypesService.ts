import api, { handleError } from './api';

export interface ServiceType {
  _id: string;
  name: string;
  icon?: string;
}

export const serviceTypesService = {
  async getAll(): Promise<ServiceType[]> {
    try {
      const res = await api.get<any>('/api/serviceTypes');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },
};
