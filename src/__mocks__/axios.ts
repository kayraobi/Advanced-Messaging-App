import { jest } from '@jest/globals';

export class AxiosError extends Error {
  response?: { status: number; data: unknown; headers: unknown; config: unknown };
  code?: string;
  constructor(
    message: string,
    code?: string,
    config?: unknown,
    request?: unknown,
    response?: { status: number; data: unknown; headers: unknown; config: unknown },
  ) {
    super(message);
    this.name = 'AxiosError';
    this.code = code;
    this.response = response;
  }
  static isAxiosError(val: unknown): val is AxiosError {
    return val instanceof AxiosError;
  }
}

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  create: jest.fn().mockReturnThis(),
  defaults: { headers: { common: {} } },
};

export default mockApi;
export const isAxiosError = (val: unknown): val is AxiosError => val instanceof AxiosError;
