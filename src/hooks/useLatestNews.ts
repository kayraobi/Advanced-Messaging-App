import { useQuery } from '@tanstack/react-query';
import { newsService } from '../services';

export function useLatestNews() {
  return useQuery({
    queryKey: ['news', 'latest'],
    queryFn: newsService.getLatest,
    staleTime: 10 * 60 * 1000,
  });
}
