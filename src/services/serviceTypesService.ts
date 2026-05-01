import api, { handleError } from './api';
import type { Service } from './servicesService';
import { unwrapApiEntity, unwrapApiList } from '../utils/apiUnwrap';

export interface ServiceType {
  _id: string;
  name: string;
  icon?: string;
}

/** GET /api/serviceTypes/with-services ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Service%20Types/get_api_serviceTypes_with_services)) */
export interface ServiceTypeWithServices extends ServiceType {
  services?: Service[];
}

export const serviceTypesService = {
  async getAll(): Promise<ServiceType[]> {
    try {
      const res = await api.get<unknown>('/api/serviceTypes');
      return unwrapApiList<ServiceType>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  async getWithServices(): Promise<ServiceTypeWithServices[]> {
    try {
      const res = await api.get<unknown>('/api/serviceTypes/with-services');
      return unwrapApiList<ServiceTypeWithServices>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  async getById(id: string): Promise<ServiceTypeWithServices> {
    try {
      const res = await api.get<unknown>(`/api/serviceTypes/${encodeURIComponent(id)}`);
      const entity = unwrapApiEntity<ServiceTypeWithServices>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Service type not found');
      }
      return entity as ServiceTypeWithServices;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** POST /api/serviceTypes ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Service%20Types/post_api_serviceTypes)) */
  async create(body: Record<string, unknown>): Promise<ServiceType> {
    try {
      const res = await api.post<unknown>('/api/serviceTypes', body);
      const entity = unwrapApiEntity<ServiceType>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid service type response');
      }
      return entity;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/serviceTypes/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Service%20Types/put_api_serviceTypes__id_)) */
  async update(id: string, body: Record<string, unknown>): Promise<ServiceType> {
    try {
      const res = await api.put<unknown>(`/api/serviceTypes/${encodeURIComponent(id)}`, body);
      const entity = unwrapApiEntity<ServiceType>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid service type response');
      }
      return entity;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** DELETE /api/serviceTypes/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Service%20Types/delete_api_serviceTypes__id_)) */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/serviceTypes/${encodeURIComponent(id)}`);
    } catch (e) {
      throw handleError(e);
    }
  },
};
