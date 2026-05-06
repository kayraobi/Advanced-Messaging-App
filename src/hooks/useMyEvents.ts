import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/eventService';

export function useMyEvents() {
  return useQuery({
    queryKey: ['events', 'my'],
    queryFn: eventService.getMyRsvpEvents,
    staleTime: 2 * 60 * 1000,
  });
}
