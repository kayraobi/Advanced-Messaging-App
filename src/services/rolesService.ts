import api, { handleError } from './api';
import { unwrapApiEntity, unwrapApiList } from '../utils/apiUnwrap';

export interface Role {
  _id: string;
  name?: string;
  label?: string;
  description?: string;
  permissions?: unknown;
}

/** Roles API ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Roles)) */
export const rolesService = {
  async getPermissionsTemplate(): Promise<unknown> {
    try {
      const res = await api.get<unknown>('/api/roles/permissions-template');
      const inner = unwrapApiEntity<unknown>(res.data);
      return inner ?? res.data;
    } catch (e) {
      throw handleError(e);
    }
  },

  async getAll(): Promise<Role[]> {
    try {
      const res = await api.get<unknown>('/api/roles');
      return unwrapApiList<Role>(res.data);
    } catch (e) {
      throw handleError(e);
    }
  },

  async getById(id: string): Promise<Role> {
    try {
      const res = await api.get<unknown>(`/api/roles/${encodeURIComponent(id)}`);
      const entity = unwrapApiEntity<Role>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Role not found');
      }
      return entity as Role;
    } catch (e) {
      throw handleError(e);
    }
  },

  async create(body: Record<string, unknown>): Promise<Role> {
    try {
      const res = await api.post<unknown>('/api/roles', body);
      const entity = unwrapApiEntity<Role>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid role response');
      }
      return entity as Role;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** PUT /api/roles/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Roles/put_api_roles__id_)) */
  async update(id: string, body: Record<string, unknown>): Promise<Role> {
    try {
      const res = await api.put<unknown>(`/api/roles/${encodeURIComponent(id)}`, body);
      const entity = unwrapApiEntity<Role>(res.data);
      if (!entity || typeof entity !== 'object' || !('_id' in entity)) {
        throw new Error('Invalid role response');
      }
      return entity as Role;
    } catch (e) {
      throw handleError(e);
    }
  },

  /** DELETE /api/roles/{id} ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Roles/delete_api_roles__id_)) */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/roles/${encodeURIComponent(id)}`);
    } catch (e) {
      throw handleError(e);
    }
  },
};
