import { useQuery } from '@tanstack/react-query';
import { chatService, Room } from '../services/chatService';

export const useChatRooms = () =>
  useQuery<Room[]>({
    queryKey: ['chatRooms'],
    queryFn: chatService.getRooms,
    staleTime: 5 * 60 * 1000,
  });

export const useGlobalRoom = () => {
  const query = useChatRooms();
  const globalRoom = query.data?.find((r) => r.type === 'global') ?? null;
  return { ...query, globalRoom };
};

export const useDmRooms = (myUserId: string | null) =>
  useQuery<Room[]>({
    queryKey: ['dmRooms', myUserId],
    queryFn: () => chatService.getDmRooms(myUserId!),
    enabled: !!myUserId,
    staleTime: 30 * 1000,
  });
