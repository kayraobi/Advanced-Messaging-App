# Socket.IO Chat Integration Guide

## ⚠️ Important Connection Information

**Server Configuration:**

- Default Port: `3333` (or `process.env.PORT`)
- Socket.IO Path: `/api/socket.io/`
- Base URL: `http://localhost:3333` (development) or `https://api.sarajevoexpats.com` (production)

**Correct Connection Format:**

```javascript
// ✅ CORRECT - Connect to base URL, path is configured in options
const socket = io("http://localhost:3333", {
  path: "/api/socket.io/",
  auth: { token: "your-jwt-token" },
});

// ❌ WRONG - Don't include path in URL
const socket = io("http://localhost:3333/api/socket.io/", {
  auth: { token: "your-jwt-token" },
});

// ❌ WRONG - Don't pass token as query parameter in URL
const socket = io("http://localhost:3333/api/socket.io/?token=...", {
  // ...
});
```

**Authentication:**

- Token should be passed in `auth.token` option (preferred)
- Query string `token` parameter is also supported for testing: `socket.handshake.query.token`

## Frontend Socket.IO Client Setup

### Installation

```bash
npm install socket.io-client
```

### React Native Integration Example

```javascript
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://api.sarajevoexpats.com"; // or http://localhost:3031 for dev

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      this.socket = io(BASE_URL, {
        path: "/api/socket.io/",
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.setupDefaultListeners();

      return new Promise((resolve, reject) => {
        this.socket.on("connect", () => {
          console.log("✅ Socket connected:", this.socket.id);
          resolve(this.socket);
        });

        this.socket.on("connect_error", (error) => {
          console.error("❌ Socket connection error:", error);
          reject(error);
        });
      });
    } catch (error) {
      console.error("Failed to connect socket:", error);
      throw error;
    }
  }

  setupDefaultListeners() {
    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
    });
  }

  joinRoom(roomId, callback) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }

    this.socket.emit("join_room", { roomId }, (response) => {
      if (response.success) {
        console.log("✅ Joined room:", roomId);
      } else {
        console.error("❌ Failed to join room:", response.error);
      }
      if (callback) callback(response);
    });
  }

  leaveRoom(roomId, callback) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }

    this.socket.emit("leave_room", { roomId }, (response) => {
      if (response.success) {
        console.log("✅ Left room:", roomId);
      }
      if (callback) callback(response);
    });
  }

  sendMessage(roomId, message, callback) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }

    this.socket.emit("send_message", { roomId, message }, (response) => {
      if (response.success) {
        console.log("✅ Message sent");
      } else {
        console.error("❌ Failed to send message:", response.error);
      }
      if (callback) callback(response);
    });
  }

  onPreviousMessages(callback) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }

    this.socket.on("previous_messages", callback);
    this.listeners.set("previous_messages", callback);
  }

  onReceiveMessage(callback) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }

    this.socket.on("receive_message", callback);
    this.listeners.set("receive_message", callback);
  }

  removeListener(eventName) {
    if (this.socket && this.listeners.has(eventName)) {
      this.socket.off(eventName, this.listeners.get(eventName));
      this.listeners.delete(eventName);
    }
  }

  disconnect() {
    if (this.socket) {
      this.listeners.forEach((callback, eventName) => {
        this.socket.off(eventName, callback);
      });
      this.listeners.clear();
      this.socket.disconnect();
      this.socket = null;
      console.log("Socket disconnected");
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();
```

### React Native Chat Component Example

```javascript
import React, { useEffect, useState, useRef } from "react";
import { View, FlatList, TextInput, Button, Text } from "react-native";
import socketService from "./services/socketService";

const ChatScreen = ({ route }) => {
  const { roomId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    initializeChat();

    return () => {
      socketService.leaveRoom(roomId);
      socketService.removeListener("previous_messages");
      socketService.removeListener("receive_message");
    };
  }, [roomId]);

  const initializeChat = async () => {
    try {
      if (!socketService.isConnected()) {
        await socketService.connect();
      }
      setIsConnected(true);

      socketService.onPreviousMessages((data) => {
        if (data.roomId === roomId) {
          setMessages(data.messages);
          scrollToBottom();
        }
      });

      socketService.onReceiveMessage((message) => {
        if (message.roomId === roomId) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      });

      socketService.joinRoom(roomId, (response) => {
        if (!response.success) {
          console.error("Failed to join room:", response.error);
        }
      });
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      setIsConnected(false);
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    socketService.sendMessage(roomId, inputMessage.trim(), (response) => {
      if (response.success) {
        setInputMessage("");
      } else {
        alert("Failed to send message: " + response.error);
      }
    });
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }) => (
    <View style={{ padding: 10, marginVertical: 5 }}>
      <Text style={{ fontWeight: "bold" }}>{item.senderName}</Text>
      <Text>{item.message}</Text>
      <Text style={{ fontSize: 10, color: "gray" }}>
        {new Date(item.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 10, backgroundColor: "#f0f0f0" }}>
        <Text>Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        style={{ flex: 1 }}
      />

      <View style={{ flexDirection: "row", padding: 10 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, padding: 10, marginRight: 10 }}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a message..."
          onSubmitEditing={sendMessage}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default ChatScreen;
```

## REST API Endpoints

### Get All Rooms

```http
GET /api/chat/rooms
```

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

### Get Room by ID

```http
GET /api/chat/rooms/:id
```

### Get Messages by Room ID

```http
GET /api/chat/rooms/:roomId/messages?limit=30&skip=0
```

**Response:**

```json
{
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "roomId": "507f1f77bcf86cd799439011",
      "senderId": "507f1f77bcf86cd799439013",
      "senderName": "John Doe",
      "message": "Hello world!",
      "createdAt": "2026-05-10T12:00:00.000Z"
    }
  ],
  "totalCount": 150,
  "hasMore": true
}
```

### Create Room (Admin Only)

```http
POST /api/chat/rooms
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Event Chat - Summer Festival",
  "type": "event",
  "eventId": "507f1f77bcf86cd799439014"
}
```

### Delete Message

```http
DELETE /api/chat/messages/:messageId
Authorization: Bearer <token>
```

## Socket.IO Events

### Client → Server Events

#### 1. join_room

Join a chat room and receive previous messages.

**Emit:**

```javascript
socket.emit("join_room", { roomId: "507f1f77bcf86cd799439011" }, (response) => {
  console.log(response);
  // { success: true, roomId: '...', messageCount: 30 }
});
```

#### 2. send_message

Send a message to a room.

**Emit:**

```javascript
socket.emit(
  "send_message",
  {
    roomId: "507f1f77bcf86cd799439011",
    message: "Hello everyone!",
  },
  (response) => {
    console.log(response);
    // { success: true, message: { _id: '...', ... } }
  },
);
```

#### 3. leave_room

Leave a chat room.

**Emit:**

```javascript
socket.emit(
  "leave_room",
  { roomId: "507f1f77bcf86cd799439011" },
  (response) => {
    console.log(response);
    // { success: true, roomId: '...' }
  },
);
```

### Server → Client Events

#### 1. previous_messages

Receive previous messages when joining a room.

**Listen:**

```javascript
socket.on("previous_messages", (data) => {
  console.log(data);
  // {
  //   roomId: '507f1f77bcf86cd799439011',
  //   messages: [...]
  // }
});
```

#### 2. receive_message

Receive new messages in real-time.

**Listen:**

```javascript
socket.on("receive_message", (message) => {
  console.log(message);
  // {
  //   _id: '507f1f77bcf86cd799439012',
  //   roomId: '507f1f77bcf86cd799439011',
  //   senderId: '507f1f77bcf86cd799439013',
  //   senderName: 'John Doe',
  //   message: 'Hello world!',
  //   createdAt: '2026-05-10T12:00:00.000Z'
  // }
});
```

#### 3. error

Receive error messages.

**Listen:**

```javascript
socket.on("error", (error) => {
  console.error(error);
  // { message: 'Room not found' }
});
```

## Message Payload Structure

```typescript
interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string; // ISO 8601 format
}
```

## Error Handling

All socket events support acknowledgment callbacks for error handling:

```javascript
socket.emit("send_message", { roomId, message }, (response) => {
  if (response.success) {
    // Message sent successfully
  } else {
    // Handle error
    console.error(response.error);
  }
});
```

Common errors:

- `"Unauthorized"` - Invalid or missing JWT token
- `"Room not found"` - Invalid room ID
- `"Message cannot be empty"` - Empty message
- `"Room ID is required"` - Missing room ID
- `"Message cannot exceed 2000 characters"` - Message too long

## Connection States

Monitor connection state:

```javascript
socket.on("connect", () => {
  console.log("Connected");
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

socket.on("reconnect", (attemptNumber) => {
  console.log("Reconnected after", attemptNumber, "attempts");
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});
```

## Best Practices

1. **Always use acknowledgment callbacks** for critical operations
2. **Clean up listeners** when components unmount
3. **Handle reconnection** gracefully
4. **Validate user input** before sending messages
5. **Implement retry logic** for failed operations
6. **Show connection status** to users
7. **Cache messages locally** for offline support
8. **Implement pagination** for message history
9. **Sanitize message content** before display
10. **Use TypeScript** for type safety
