import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { chatRepository } from '../repositories/chatRepository';

function getUserFromSocket(socket: Socket): { id: string; username: string } {
  const token = socket.handshake.auth?.token as string | undefined;
  if (token) {
    try {
      const decoded = jwt.decode(token) as any;
      const u = decoded?.user ?? decoded;
      if (u) {
        return {
          id: String(u._id ?? u.id ?? socket.id),
          username: String(u.username ?? u.name ?? 'Anonymous'),
        };
      }
    } catch {
      // fall through
    }
  }
  return { id: socket.id, username: 'Anonymous' };
}

export const initializeChatSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    socket.on(
      'join_room',
      async (data: { roomId: string } | string, callback?: Function) => {
        const roomId = typeof data === 'string' ? data : data?.roomId;
        if (!roomId) return;

        socket.join(roomId);
        console.log(`[Socket] ${socket.id} joined room ${roomId}`);

        const messages = await chatRepository.getMessagesByRoomId(roomId);
        socket.emit('previous_messages', { roomId, messages });

        if (typeof callback === 'function') {
          callback({ success: true, roomId, messageCount: messages.length });
        }
      },
    );

    socket.on(
      'send_message',
      async (
        data: { roomId: string; message: string },
        callback?: Function,
      ) => {
        try {
          const user = getUserFromSocket(socket);
          const savedMessage = await chatRepository.saveMessage({
            roomId: data.roomId,
            senderId: user.id,
            senderName: user.username,
            message: data.message,
          });

          io.to(data.roomId).emit('receive_message', savedMessage);

          if (typeof callback === 'function') {
            callback({ success: true, message: savedMessage });
          }
        } catch (error) {
          console.error('[Socket] Error saving message:', error);
          if (typeof callback === 'function') {
            callback({ success: false, error: 'Failed to save message' });
          }
        }
      },
    );

    socket.on(
      'leave_room',
      async (data: { roomId: string } | string, callback?: Function) => {
        const roomId = typeof data === 'string' ? data : data?.roomId;
        if (!roomId) return;

        socket.leave(roomId);
        console.log(`[Socket] ${socket.id} left room ${roomId}`);

        if (typeof callback === 'function') {
          callback({ success: true, roomId });
        }
      },
    );

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });
};
