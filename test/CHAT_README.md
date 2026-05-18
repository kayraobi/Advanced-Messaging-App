# Real-Time Chat System Documentation

## Overview

Production-ready real-time chat system built with Socket.IO, Express, MongoDB, and JWT authentication for the Sarajevo Expats mobile application.

## Features

✅ **Real-time messaging** with Socket.IO  
✅ **JWT authentication** for secure connections  
✅ **Room-based chat** (Global Chat + Event Chats)  
✅ **Message persistence** with MongoDB  
✅ **Message history** retrieval (30 most recent messages)  
✅ **Scalable architecture** with repository/service pattern  
✅ **Production-ready** error handling  
✅ **WebSocket + Polling** fallback  
✅ **CORS configured** for mobile apps  
✅ **VPS deployment ready** with PM2 + Nginx  

## Architecture

```
server/
├── models/
│   ├── messageModel.js       # Message schema with indexes
│   └── roomModel.js          # Room schema
├── repositories/
│   └── chatRepository.js     # Database operations
├── services/
│   └── chatService.js        # Business logic
├── controllers/
│   └── chatController.js     # REST API handlers
├── routes/
│   └── chatRoutes.js         # Express routes
├── socket/
│   ├── index.js              # Socket.IO entry point
│   ├── socketServer.js       # Socket.IO initialization
│   ├── middleware/
│   │   └── socketAuth.js     # JWT authentication middleware
│   ├── handlers/
│   │   └── chatHandler.js    # Socket event handlers
│   └── events/
│       └── chatEvents.js     # Event registration
└── utils/
    └── roomSeeder.js         # Global Chat initialization
```

## Database Schema

### Room Model

```javascript
{
  _id: ObjectId,
  name: String,              // "Global Chat", "Event Chat - Summer Festival"
  type: String,              // "global" | "event"
  eventId: ObjectId,         // Reference to Event (optional)
  isActive: Boolean,         // true/false
  metadata: Map,             // Additional data
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `type`
- `eventId`
- `isActive`

### Message Model

```javascript
{
  _id: ObjectId,
  roomId: ObjectId,          // Reference to Room
  senderId: ObjectId,        // Reference to User
  senderName: String,        // User's display name
  message: String,           // Max 2000 characters
  isDeleted: Boolean,        // Soft delete flag
  deletedAt: Date,           // Deletion timestamp
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `roomId + createdAt` (compound, descending)
- `senderId + createdAt` (compound, descending)
- `isDeleted`

## REST API Endpoints

### GET /api/chat/rooms

Get all active chat rooms.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Global Chat",
    "type": "global",
    "isActive": true,
    "createdAt": "2026-05-10T12:00:00.000Z",
    "updatedAt": "2026-05-10T12:00:00.000Z"
  }
]
```

### GET /api/chat/rooms/:id

Get room by ID.

### GET /api/chat/rooms/:roomId/messages

Get messages with pagination.

**Query Parameters:**
- `limit` (default: 30)
- `skip` (default: 0)

**Response:**
```json
{
  "messages": [...],
  "totalCount": 150,
  "hasMore": true
}
```

### POST /api/chat/rooms

Create new room (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Event Chat - Summer Festival",
  "type": "event",
  "eventId": "507f1f77bcf86cd799439014"
}
```

### DELETE /api/chat/messages/:messageId

Delete own message (soft delete).

**Headers:**
```
Authorization: Bearer <token>
```

## Socket.IO Events

### Client → Server

#### join_room

Join a chat room and receive message history.

```javascript
socket.emit('join_room', { roomId: '...' }, (response) => {
  // response: { success: true, roomId: '...', messageCount: 30 }
});
```

#### send_message

Send a message to a room.

```javascript
socket.emit('send_message', {
  roomId: '...',
  message: 'Hello!'
}, (response) => {
  // response: { success: true, message: {...} }
});
```

#### leave_room

Leave a chat room.

```javascript
socket.emit('leave_room', { roomId: '...' }, (response) => {
  // response: { success: true, roomId: '...' }
});
```

### Server → Client

#### previous_messages

Emitted when joining a room.

```javascript
socket.on('previous_messages', (data) => {
  // data: { roomId: '...', messages: [...] }
});
```

#### receive_message

Emitted when new message is sent to room.

```javascript
socket.on('receive_message', (message) => {
  // message: { _id, roomId, senderId, senderName, message, createdAt }
});
```

#### error

Emitted on errors.

```javascript
socket.on('error', (error) => {
  // error: { message: 'Error description' }
});
```

## Authentication

### Socket.IO Authentication

JWT token must be provided during handshake:

```javascript
const socket = io('https://api.sarajevoexpats.com', {
  auth: {
    token: 'your_jwt_token_here'
  }
});
```

The token is verified using `socketAuthMiddleware` before connection is established.

### REST API Authentication

Use Bearer token in Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

## Security Features

1. **JWT Verification** - All socket connections require valid JWT
2. **Room Validation** - Verify room exists before operations
3. **Message Sanitization** - Trim whitespace, enforce length limits
4. **Soft Deletes** - Messages marked as deleted, not removed
5. **User Authorization** - Users can only delete their own messages
6. **CORS Configuration** - Restricted to allowed origins
7. **Input Validation** - All inputs validated before processing
8. **Error Handling** - Comprehensive try/catch blocks
9. **Environment Variables** - No hardcoded secrets

## Error Handling

All socket events return acknowledgment callbacks:

```javascript
socket.emit('send_message', { roomId, message }, (response) => {
  if (response.success) {
    // Success
  } else {
    // Handle error: response.error
  }
});
```

Common errors:
- `"Unauthorized"` - Invalid/missing JWT
- `"Room not found"` - Invalid room ID
- `"Message cannot be empty"` - Empty message
- `"Message cannot exceed 2000 characters"` - Too long
- `"Room ID is required"` - Missing parameter

## Performance Optimizations

1. **Database Indexes** - Optimized queries for room and message retrieval
2. **Lean Queries** - Return plain JavaScript objects
3. **Message Limits** - Default 30 messages per request
4. **Connection Pooling** - MongoDB connection reuse
5. **WebSocket Transport** - Preferred over polling
6. **Cluster Mode** - PM2 cluster for multi-core usage

## Scalability Considerations

### Current Implementation
- Single server with PM2 cluster mode
- MongoDB with optimized indexes
- Socket.IO with WebSocket + polling fallback

### Future Scaling Options
- **Redis Adapter** - For multi-server Socket.IO
- **Message Queue** - For async processing
- **CDN** - For static assets
- **Load Balancer** - For horizontal scaling
- **Sharding** - For MongoDB at scale

## Installation

### Install Dependencies

```bash
npm install
```

Required packages:
- `socket.io@^4.7.5`
- `express@^4.21.2`
- `mongoose@^8.8.4`
- `jsonwebtoken@^9.0.2`
- `express-async-handler@^1.2.0`

### Initialize Database

The Global Chat room is automatically created on server startup via `roomSeeder.js`.

### Start Server

Development:
```bash
npm run dev
```

Production:
```bash
pm2 start ecosystem.config.js
```

## Testing

### Test Socket Connection

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3333', {
  auth: { token: 'your_jwt_token' }
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  
  socket.emit('join_room', { roomId: 'room_id_here' }, (response) => {
    console.log('Join response:', response);
  });
});

socket.on('previous_messages', (data) => {
  console.log('Previous messages:', data);
});

socket.on('receive_message', (message) => {
  console.log('New message:', message);
});
```

### Test REST API

```bash
# Get rooms
curl http://localhost:3333/api/chat/rooms

# Get messages
curl http://localhost:3333/api/chat/rooms/ROOM_ID/messages?limit=30
```

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
pm2 logs sarajevo-expats-api
```

### Socket.IO Logs

Connection logs include:
- User connection/disconnection
- Room join/leave events
- Message send events
- Error events

### Database Monitoring

```bash
mongosh
use sarajevo_expats
db.messages.countDocuments()
db.rooms.find()
```

## Deployment

See `DEPLOYMENT.md` for complete VPS deployment guide.

Quick deployment:
1. Install Node.js, MongoDB, Nginx, PM2
2. Clone repository
3. Configure `.env` file
4. Run `npm install --production`
5. Configure Nginx (see `nginx.conf.example`)
6. Start with `pm2 start ecosystem.config.js`
7. Setup SSL with Let's Encrypt

## Frontend Integration

See `SOCKET_INTEGRATION.md` for complete React Native integration guide.

Quick example:
```javascript
import { io } from 'socket.io-client';

const socket = io('https://api.sarajevoexpats.com', {
  auth: { token: jwtToken }
});

socket.emit('join_room', { roomId });
socket.on('receive_message', handleNewMessage);
```

## Troubleshooting

### Socket won't connect
- Verify JWT token is valid
- Check CORS configuration
- Verify WebSocket support in Nginx

### Messages not persisting
- Check MongoDB connection
- Verify room exists
- Check database indexes

### High latency
- Enable Nginx gzip
- Use WebSocket transport
- Optimize database queries
- Consider Redis caching

## Environment Variables

Required:
- `PORT` - Server port (default: 3333)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLIENT_URL` - Frontend URL for CORS

Optional:
- `HOST_NAME` - Server hostname (default: localhost)
- `NODE_ENV` - Environment (production/development)

## License

Proprietary - Sarajevo Expats Platform

## Support

For technical support or questions, contact the development team.
