import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/eventService';

export function useEvents() {
  return useQuery({
    queryKey: ['events', 'all'],
    queryFn: eventService.getAll,
    staleTime: 5 * 60 * 1000,
  });
}
