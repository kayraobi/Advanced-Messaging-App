import api, { handleError } from './api';

export interface PlaceType {
  _id: string;
  name: string;
  icon?: string;
}

export const placeTypesService = {
  async getAll(): Promise<PlaceType[]> {
    try {
      const res = await api.get<any>('/api/placeTypes');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw handleError(e);
    }
  },
};
