import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { chatRepository } from '../repositories/chatRepository';

const router = Router();

function getUserFromRequest(req: Request): { id: string; username: string } | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    const decoded = jwt.decode(token) as any;
    const u = decoded?.user ?? decoded;
    if (u) {
      return {
        id: String(u._id ?? u.id ?? ''),
        username: String(u.username ?? u.name ?? 'Anonymous'),
      };
    }
  } catch {
    // fall through
  }
  return null;
}

// GET /api/chat/rooms
router.get('/rooms', async (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  if (userId) {
    const rooms = await chatRepository.getDmRooms(userId);
    return res.json(rooms);
  }
  const rooms = await chatRepository.getRooms();
  res.json(rooms);
});

// GET /api/chat/rooms/:roomId/messages
router.get('/rooms/:roomId/messages', async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const limit = parseInt(String(req.query.limit ?? '30'), 10);
  const skip = parseInt(String(req.query.skip ?? '0'), 10);
  const messages = await chatRepository.getMessagesByRoomId(roomId, limit, skip);
  res.json({ messages, totalCount: messages.length, hasMore: false });
});

// POST /api/chat/dm — get or create a DM room between the caller and a target user
router.post('/dm', async (req: Request, res: Response) => {
  const me = getUserFromRequest(req);
  if (!me?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { targetUserId, targetUsername } = req.body;
  if (!targetUserId) return res.status(400).json({ error: 'targetUserId is required' });

  const room = await chatRepository.getOrCreateDmRoom(
    me.id,
    me.username,
    String(targetUserId),
    String(targetUsername ?? 'User'),
  );
  res.json(room);
});

export default router;
