import { useQuery } from '@tanstack/react-query';
import { newsService } from '../services';

export function useNewsSlides() {
  return useQuery({
    queryKey: ['news', 'slides'],
    queryFn: newsService.getSlides,
    staleTime: 10 * 60 * 1000,
  });
}
