"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
// import { Server } from 'socket.io'; // We will add Socket.io later
// import dotenv from 'dotenv';
// dotenv.config();
const PORT = process.env.PORT || 3000;
const server = http_1.default.createServer(app_1.default);
// const io = new Server(server, { cors: { origin: '*' } });
// io.on('connection', (socket) => { ... });
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
//# sourceMappingURL=index.js.map