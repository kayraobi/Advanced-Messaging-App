# Quick Start Guide - Real-Time Chat System

## Installation

1. **Install Socket.IO dependency:**

   ```bash
   cd server
   npm install
   ```

2. **Verify environment variables:**
   - Copy `env.example` to `.env`
   - Ensure `JWT_SECRET` is set
   - Ensure `MONGODB_URI` is configured

## Running Locally

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3333` with:

- ✅ Socket.IO server initialized
- ✅ Global Chat room created automatically
- ✅ REST API endpoints available
- ✅ WebSocket connections ready

### Verify Installation

1. **Check REST API:**

   ```bash
   curl http://localhost:3333/api/chat/rooms
   ```

   Should return Global Chat room.

2. **Check Socket.IO:**
   Open browser console and run:
   ```javascript
   const socket = io("http://localhost:3333", {
     auth: { token: "your_jwt_token" },
   });
   socket.on("connect", () => console.log("Connected!"));
   ```

## File Structure Created

```
server/
├── models/
│   ├── messageModel.js          ✅ Created
│   └── roomModel.js             ✅ Created
├── repositories/
│   └── chatRepository.js        ✅ Created
├── services/
│   └── chatService.js           ✅ Created
├── controllers/
│   └── chatController.js        ✅ Created
├── routes/
│   └── chatRoutes.js            ✅ Created
├── socket/
│   ├── index.js                 ✅ Created
│   ├── socketServer.js          ✅ Created
│   ├── middleware/
│   │   └── socketAuth.js        ✅ Created
│   ├── handlers/
│   │   └── chatHandler.js       ✅ Created
│   └── events/
│       └── chatEvents.js        ✅ Created
├── utils/
│   └── roomSeeder.js            ✅ Created
├── server.js                    ✅ Updated
├── package.json                 ✅ Updated
├── ecosystem.config.js          ✅ Created (PM2)
├── nginx.conf.example           ✅ Created
├── env.example                  ✅ Created
├── CHAT_README.md               ✅ Created
├── SOCKET_INTEGRATION.md        ✅ Created
└── DEPLOYMENT.md                ✅ Created
```

## API Endpoints

### REST API

| Method | Endpoint                           | Description    | Auth  |
| ------ | ---------------------------------- | -------------- | ----- |
| GET    | `/api/chat/rooms`                  | Get all rooms  | No    |
| GET    | `/api/chat/rooms/:id`              | Get room by ID | No    |
| GET    | `/api/chat/rooms/:roomId/messages` | Get messages   | No    |
| POST   | `/api/chat/rooms`                  | Create room    | Admin |
| DELETE | `/api/chat/messages/:messageId`    | Delete message | User  |

### Socket.IO Events

**Client → Server:**

- `join_room` - Join a chat room
- `send_message` - Send a message
- `leave_room` - Leave a chat room

**Server → Client:**

- `previous_messages` - Receive message history
- `receive_message` - Receive new messages
- `error` - Error notifications

## Testing the Chat System

### 1. Get Global Chat Room ID

```bash
curl http://localhost:3333/api/chat/rooms
```

Copy the `_id` of the Global Chat room.

### 2. Test Socket Connection (Node.js)

Create `test-socket.js`:

```javascript
const io = require("socket.io-client");

// Replace with your JWT token
const token = "your_jwt_token_here";
const roomId = "room_id_from_step_1";

const socket = io("http://localhost:3333", {
  auth: { token },
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  socket.emit("join_room", { roomId }, (response) => {
    console.log("Join response:", response);
  });
});

socket.on("previous_messages", (data) => {
  console.log("📜 Previous messages:", data.messages.length);
});

socket.on("receive_message", (message) => {
  console.log("📨 New message:", message);
});

socket.on("error", (error) => {
  console.error("❌ Error:", error);
});

// Send a test message after 2 seconds
setTimeout(() => {
  socket.emit(
    "send_message",
    {
      roomId,
      message: "Hello from test script!",
    },
    (response) => {
      console.log("Send response:", response);
    },
  );
}, 2000);
```

Run:

```bash
node test-socket.js
```

## Mobile App Integration

### React Native Setup

1. **Install Socket.IO client:**

   ```bash
   npm install socket.io-client
   ```

2. **Create socket service:**
   See `SOCKET_INTEGRATION.md` for complete implementation.

3. **Basic usage:**

   ```javascript
   import socketService from "./services/socketService";

   // Connect
   await socketService.connect();

   // Join room
   socketService.joinRoom(roomId);

   // Listen for messages
   socketService.onReceiveMessage((message) => {
     console.log("New message:", message);
   });

   // Send message
   socketService.sendMessage(roomId, "Hello!");
   ```

## Production Deployment

### Quick Deploy to VPS

1. **Install dependencies on server:**

   ```bash
   sudo npm install -g pm2
   ```

2. **Clone and setup:**

   ```bash
   git clone <repo> /var/www/sarajevo-expats
   cd /var/www/sarajevo-expats/server
   npm install --production
   ```

3. **Configure environment:**

   ```bash
   cp env.example .env
   nano .env  # Update variables
   ```

4. **Start with PM2:**

   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx:**
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/sarajevo-expats
   sudo ln -s /etc/nginx/sites-available/sarajevo-expats /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

See `DEPLOYMENT.md` for complete production setup.

## Troubleshooting

### Socket.IO won't connect

- ✅ Check JWT token is valid
- ✅ Verify server is running
- ✅ Check CORS configuration in `server.js`

### Messages not saving

- ✅ Check MongoDB is running: `sudo systemctl status mongod`
- ✅ Verify room exists
- ✅ Check server logs: `pm2 logs`

### Can't join room

- ✅ Verify room ID is correct
- ✅ Check room is active
- ✅ Ensure user is authenticated

## Next Steps

1. **Test locally** - Verify all endpoints work
2. **Integrate with mobile app** - Use `SOCKET_INTEGRATION.md`
3. **Deploy to VPS** - Follow `DEPLOYMENT.md`
4. **Monitor production** - Setup PM2 monitoring
5. **Create event rooms** - Use POST `/api/chat/rooms` endpoint

## Documentation

### Written Documentation

- **`CHAT_README.md`** - Complete system documentation
- **`SOCKET_INTEGRATION.md`** - Frontend integration guide
- **`DEPLOYMENT.md`** - Production deployment guide
- **`API_DOCUMENTATION.md`** - API documentation guide
- **`QUICK_START.md`** - This file

### Interactive Documentation

- **API Portal**: `http://localhost:3333/` or `http://localhost:3333/api/docs`
- **REST API (Swagger)**: `http://localhost:3333/api/api-docs`
- **WebSocket API (AsyncAPI)**: `http://localhost:3333/api/websocket-docs`
- **AsyncAPI Spec**: `http://localhost:3333/asyncapi.yaml`

## Support

Check logs for issues:

```bash
# Development
npm run dev

# Production
pm2 logs sarajevo-expats-api
```

## Features Implemented

✅ JWT-authenticated Socket.IO connections  
✅ Room-based messaging (Global + Event chats)  
✅ Message persistence with MongoDB  
✅ Message history retrieval (30 messages)  
✅ Real-time message broadcasting  
✅ REST API for rooms and messages  
✅ Scalable repository/service architecture  
✅ Production error handling  
✅ CORS configuration for mobile apps  
✅ PM2 cluster mode support  
✅ Nginx reverse proxy configuration  
✅ Automatic Global Chat room creation  
✅ Message soft delete functionality  
✅ Comprehensive logging  
✅ VPS deployment ready

## System is Production-Ready! 🚀
