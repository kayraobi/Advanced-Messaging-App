import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/eventService';

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn: () => eventService.getFeatured().catch(() => eventService.getAll()),
    staleTime: 5 * 60 * 1000,
  });
}
