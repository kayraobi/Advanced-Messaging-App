import http from 'http';
import app from './app';
import { Server } from 'socket.io';
import { initializeChatSocket } from './socket/chatHandler';
// import dotenv from 'dotenv';
// dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: '*' } });

initializeChatSocket(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
