import { Server, Socket } from 'socket.io';
import { chatRepository } from '../repositories/chatRepository';

export const initializeChatSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    socket.on('join_room', async (roomId: string) => {
      socket.join(roomId);
      console.log(`[Socket] User ${socket.id} joined room ${roomId}`);

      const previousMessages = await chatRepository.getMessagesByRoomId(roomId);
      socket.emit('previous_messages', previousMessages);
    });

    socket.on('send_message', async (data: { roomId: string; senderId: string; senderName: string; content: string }) => {
      try {
        const savedMessage = await chatRepository.saveMessage({
          roomId: data.roomId,
          senderId: data.senderId,
          senderName: data.senderName,
          content: data.content,
        });

        io.to(data.roomId).emit('receive_message', savedMessage);
      } catch (error) {
        console.error('[Socket] Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });
};
