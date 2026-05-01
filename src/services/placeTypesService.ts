import api, { handleError } from './api';
import type { Place } from './placesService';
import { unwrapApiEntity, unwrapApiList } from '../utils/apiUnwrap';

export interface PlaceType {
  _id: string;
  name: string;
  icon?: string;
}

/** GET /api/placeTypes/with-places — each type may embed `places[]` ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Place%20Types/get_api_placeTypes_with_places)) */
export interface PlaceTypeWithPlaces extends PlaceType {
  places?: Place[];
}

export const placeTypesService = {
  /** GET /api/placeTypes */
  async getAll(): Promise<PlaceType[]> {
    try {
      const res = await api.get<unknown>('/api/placeTypes');
      return unwrapApiList<PlaceType>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** GET /api/placeTypes/with-places — auth gerekebilir */
  async getWithPlaces(): Promise<PlaceTypeWithPlaces[]> {
    try {
      const res = await api.get<unknown>('/api/placeTypes/with-places');
      return unwrapApiList<PlaceTypeWithPlaces>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  /** GET /api/placeTypes/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Place%20Types/get_api_placeTypes__id_)) */
  async getById(id: string): Promise<PlaceTypeWithPlaces> {
    try {
      const res = await api.get<unknown>(`/api/placeTypes/${encodeURIComponent(id)}`);
      const entity = unwrapApiEntity<PlaceTypeWithPlaces>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Place type not found');
      }
      return entity;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** POST /api/placeTypes ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Place%20Types/post_api_placeTypes)) */
  async create(body: Record<string, unknown>): Promise<PlaceType> {
    try {
      const res = await api.post<unknown>('/api/placeTypes', body);
      const entity = unwrapApiEntity<PlaceType>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid place type response');
      }
      return entity;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/placeTypes/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Place%20Types/put_api_placeTypes__id_)) */
  async update(id: string, body: Record<string, unknown>): Promise<PlaceType> {
    try {
      const res = await api.put<unknown>(`/api/placeTypes/${encodeURIComponent(id)}`, body);
      const entity = unwrapApiEntity<PlaceType>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid place type response');
      }
      return entity;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** DELETE /api/placeTypes/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Place%20Types/delete_api_placeTypes__id_)) */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/placeTypes/${encodeURIComponent(id)}`);
    } catch (e) {
      throw handleError(e);
    }
  },
};
