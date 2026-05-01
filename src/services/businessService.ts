import api, { handleError } from './api';

/** POST /api/business — partnership request ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Business/post_api_business)) */
export const businessService = {
  async submit(body: Record<string, unknown>): Promise<void> {
    try {
      await api.post<unknown>('/api/business', body);
    } catch (e) {
      throw handleError(e);
    }
  },
};
