# 🔌 WebSocket & API Connection Guide

## 📍 Deployment Configuration

- **Frontend**: `https://sarajevoexpats.com`
- **Backend**: `https://sarajevoexpats.com/api`

---

## 🌐 REST API Connection

### **Base URL**
```
https://sarajevoexpats.com/api
```

### **Endpoints**
All API endpoints are prefixed with `/api`:

```
GET    https://sarajevoexpats.com/api/chat/rooms
GET    https://sarajevoexpats.com/api/chat/rooms/:id
GET    https://sarajevoexpats.com/api/chat/rooms/:roomId/messages
POST   https://sarajevoexpats.com/api/chat/rooms
DELETE https://sarajevoexpats.com/api/chat/messages/:messageId

GET    https://sarajevoexpats.com/api/calendar
GET    https://sarajevoexpats.com/api/calendar/:id
POST   https://sarajevoexpats.com/api/calendar
PUT    https://sarajevoexpats.com/api/calendar/:id
DELETE https://sarajevoexpats.com/api/calendar/:id
POST   https://sarajevoexpats.com/api/calendar/:id/apply

GET    https://sarajevoexpats.com/api/events
GET    https://sarajevoexpats.com/api/places
GET    https://sarajevoexpats.com/api/services
... (all other endpoints)
```

---

## 🔌 WebSocket Connection

### **Socket.IO Configuration**

**Important**: Since your backend is at `/api`, you need to configure the Socket.IO path.

```javascript
import { io } from 'socket.io-client';

const socket = io('https://sarajevoexpats.com', {
  path: '/api/socket.io/',
  auth: {
    token: 'YOUR_JWT_TOKEN'
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket');
  console.log('Socket ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});
```

### **Key Configuration Parameters**

| Parameter | Value | Description |
|-----------|-------|-------------|
| **URL** | `https://sarajevoexpats.com` | Base domain (no /api) |
| **path** | `/api/socket.io/` | Custom Socket.IO path |
| **auth.token** | Your JWT token | Authentication token |
| **transports** | `['websocket', 'polling']` | Connection methods |

---

## 📱 React Native Integration

### **Complete Socket Service**

```javascript
// services/socketService.js
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.socket = io('https://sarajevoexpats.com', {
        path: '/api/socket.io/',
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to connect socket:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a room
  joinRoom(roomId, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('join_room', { roomId }, (response) => {
      if (response.success) {
        console.log(`✅ Joined room: ${roomId}`);
      } else {
        console.error(`❌ Failed to join room: ${response.error}`);
      }
      if (callback) callback(response);
    });
  }

  // Send a message
  sendMessage(roomId, message, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('send_message', { roomId, message }, (response) => {
      if (response.success) {
        console.log('✅ Message sent');
      } else {
        console.error(`❌ Failed to send message: ${response.error}`);
      }
      if (callback) callback(response);
    });
  }

  // Leave a room
  leaveRoom(roomId, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('leave_room', { roomId }, (response) => {
      if (response.success) {
        console.log(`✅ Left room: ${roomId}`);
      } else {
        console.error(`❌ Failed to leave room: ${response.error}`);
      }
      if (callback) callback(response);
    });
  }

  // Listen for previous messages
  onPreviousMessages(callback) {
    if (!this.socket) return;
    this.socket.on('previous_messages', callback);
  }

  // Listen for new messages
  onReceiveMessage(callback) {
    if (!this.socket) return;
    this.socket.on('receive_message', callback);
  }

  // Remove listeners
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();
```

### **Usage in Component**

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button } from 'react-native';
import socketService from './services/socketService';

const ChatScreen = ({ route }) => {
  const { roomId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    // Connect socket
    socketService.connect();

    // Join room
    socketService.joinRoom(roomId);

    // Listen for previous messages
    socketService.onPreviousMessages((data) => {
      setMessages(data.messages);
    });

    // Listen for new messages
    socketService.onReceiveMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup
    return () => {
      socketService.leaveRoom(roomId);
      socketService.off('previous_messages');
      socketService.off('receive_message');
    };
  }, [roomId]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      socketService.sendMessage(roomId, inputMessage, (response) => {
        if (response.success) {
          setInputMessage('');
        }
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.senderName}: {item.message}</Text>
          </View>
        )}
      />
      <TextInput
        value={inputMessage}
        onChangeText={setInputMessage}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

export default ChatScreen;
```

---

## 📮 Postman Configuration

### **1. REST API Testing**

#### **Setup Environment**

Create a new environment in Postman:

```json
{
  "name": "Sarajevo Expats Production",
  "values": [
    {
      "key": "base_url",
      "value": "https://sarajevoexpats.com/api",
      "enabled": true
    },
    {
      "key": "token",
      "value": "YOUR_JWT_TOKEN_HERE",
      "enabled": true
    }
  ]
}
```

#### **Example Requests**

**Get All Rooms**
```
GET {{base_url}}/chat/rooms
```

**Get Room Messages**
```
GET {{base_url}}/chat/rooms/507f1f77bcf86cd799439011/messages?limit=30&skip=0
```

**Create Room (Admin)**
```
POST {{base_url}}/chat/rooms
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "name": "Test Room",
  "type": "global"
}
```

**Get Calendar Events**
```
GET {{base_url}}/calendar?page=1&limit=10
```

**Register for Event**
```
POST {{base_url}}/calendar/507f1f77bcf86cd799439011/apply
Headers:
  Authorization: Bearer {{token}}
```

### **2. WebSocket Testing (Using Postman)**

Postman supports WebSocket connections:

1. **Create New WebSocket Request**
   - Click "New" → "WebSocket Request"

2. **Configure Connection**
   ```
   URL: wss://sarajevoexpats.com/api/socket.io/?EIO=4&transport=websocket&token=YOUR_JWT_TOKEN
   ```

3. **Send Events**
   ```json
   42["join_room",{"roomId":"507f1f77bcf86cd799439011"}]
   ```

**Note**: WebSocket testing in Postman is complex for Socket.IO. Better to use browser-based tools.

---

## 🧪 Testing WebSocket Connection

### **Browser Console Test**

Open browser console on `https://sarajevoexpats.com` and run:

```javascript
// Load Socket.IO client
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
document.head.appendChild(script);

script.onload = () => {
  const socket = io('https://sarajevoexpats.com', {
    path: '/api/socket.io/',
    auth: {
      token: 'YOUR_JWT_TOKEN'
    }
  });

  socket.on('connect', () => {
    console.log('✅ Connected:', socket.id);
    
    // Join room
    socket.emit('join_room', { roomId: 'ROOM_ID' }, (response) => {
      console.log('Join response:', response);
    });
  });

  socket.on('previous_messages', (data) => {
    console.log('Previous messages:', data);
  });

  socket.on('receive_message', (message) => {
    console.log('New message:', message);
  });

  socket.on('error', (error) => {
    console.error('Error:', error);
  });
};
```

### **Node.js Test Script**

```javascript
// test-socket.js
const io = require('socket.io-client');

const socket = io('https://sarajevoexpats.com', {
  path: '/api/socket.io/',
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  
  socket.emit('join_room', { roomId: 'ROOM_ID' }, (response) => {
    console.log('Join response:', response);
  });
});

socket.on('previous_messages', (data) => {
  console.log('Previous messages:', data.messages.length);
});

socket.on('receive_message', (message) => {
  console.log('New message:', message);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

Run: `node test-socket.js`

---

## 🔧 Nginx Configuration

Ensure your Nginx is configured to handle WebSocket upgrades:

```nginx
server {
    listen 443 ssl http2;
    server_name sarajevoexpats.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/sarajevoexpats.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sarajevoexpats.com/privkey.pem;

    # Frontend (static files)
    location / {
        root /var/www/sarajevoexpats-frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3333/api/;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Standard headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for WebSocket
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

---

## ✅ Connection Checklist

### **Backend Server**
- ✅ Socket.IO path set to `/api/socket.io/`
- ✅ CORS configured for `https://sarajevoexpats.com`
- ✅ JWT authentication middleware active
- ✅ Server running on port 3333

### **Nginx**
- ✅ WebSocket upgrade headers configured
- ✅ Proxy pass to `http://localhost:3333/api/`
- ✅ SSL certificates installed
- ✅ Timeouts set for long-lived connections

### **Frontend**
- ✅ Socket.IO client installed
- ✅ Connection URL: `https://sarajevoexpats.com`
- ✅ Path: `/api/socket.io/`
- ✅ JWT token from AsyncStorage/localStorage
- ✅ Error handling implemented

---

## 🐛 Troubleshooting

### **WebSocket Connection Fails**

1. **Check Nginx logs**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Check backend logs**
   ```bash
   pm2 logs sarajevo-expats-api
   ```

3. **Verify Socket.IO path**
   - Should be `/api/socket.io/` not `/socket.io/`

4. **Test direct connection**
   ```bash
   curl -I https://sarajevoexpats.com/api/socket.io/
   ```

### **Authentication Errors**

1. **Verify JWT token is valid**
2. **Check token is passed in `auth.token`**
3. **Ensure token hasn't expired**

### **CORS Errors**

1. **Check CORS origins in `socketServer.js`**
2. **Verify Nginx headers**
3. **Check browser console for specific error**

---

## 📞 Support

For connection issues:
1. Check server logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Test REST API first: `curl https://sarajevoexpats.com/api/chat/rooms`
4. Test WebSocket upgrade: Browser DevTools → Network → WS

---

**Last Updated**: May 11, 2026  
**Deployment**: Production (sarajevoexpats.com)
