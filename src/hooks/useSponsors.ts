import { useQuery } from '@tanstack/react-query';
import { sponsorsService } from '../services';

export function useSponsors() {
  return useQuery({
    queryKey: ['sponsors'],
    queryFn: sponsorsService.getAll,
    staleTime: 10 * 60 * 1000,
  });
}
