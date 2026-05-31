import { jest } from '@jest/globals';

export const useQuery = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
});

export const useMutation = jest.fn().mockReturnValue({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isLoading: false,
});

export const useQueryClient = jest.fn().mockReturnValue({
  invalidateQueries: jest.fn(),
  setQueryData: jest.fn(),
  clear: jest.fn(),
});

export const QueryClient = jest.fn().mockImplementation(() => ({
  invalidateQueries: jest.fn(),
  clear: jest.fn(),
}));

export const QueryClientProvider = ({ children }: { children: unknown }) => children;
