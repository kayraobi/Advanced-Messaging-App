# WebSocket Connection Testing Guide

## Quick Diagnosis

If you see **NO LOGS** on the server when trying to connect, the issue is with the connection URL/format, not authentication.

## Testing Methods

### Method 1: Node.js Test Script (RECOMMENDED)

Run the test script I created:

```bash
# Test with auth.token (recommended)
node test-socket-connection.js

# Test with query string (for Postman compatibility)
node test-socket-connection.js --query
```

**What to expect:**
- ✅ If successful: You'll see "Successfully connected!" and the socket ID
- ❌ If failed: You'll see the specific error message
- Server logs will show authentication attempts

---

### Method 2: Postman WebSocket Testing

#### ⚠️ Important: Postman WebSocket Setup

Postman's WebSocket support for Socket.IO requires specific configuration:

**Step 1: Create WebSocket Request**
1. Click **New** → **WebSocket Request**
2. **DO NOT** use HTTP request type

**Step 2: Connection URL**

Use ONE of these formats:

**Option A: With Query String (Easier for Postman)**
```
ws://localhost:3031/api/socket.io/?EIO=4&transport=websocket&token=YOUR_JWT_TOKEN
```

**Option B: Standard WebSocket**
```
ws://localhost:3031/api/socket.io/?EIO=4&transport=websocket
```
Then after connecting, send authentication message (see below).

**Step 3: Connect**
Click the **Connect** button

**Step 4: Check Server Logs**
You should see:
```
🔐 Socket auth attempt from: ::ffff:127.0.0.1
```

If you see nothing, the connection isn't reaching the server.

---

### Method 3: Browser Console Test

Open your browser console and run:

```javascript
// Load Socket.IO client from CDN
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
script.onload = () => {
  const socket = io('http://localhost:3031', {
    path: '/api/socket.io/',
    auth: {
      token: 'YOUR_JWT_TOKEN_HERE'
    }
  });

  socket.on('connect', () => {
    console.log('✅ Connected!', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
  });
};
document.head.appendChild(script);
```

---

## Common Issues & Solutions

### Issue 1: "No logs appear on server"

**Cause:** Connection isn't reaching the server at all.

**Solutions:**
1. Verify server is running: Check terminal for "Socket.IO server initialized"
2. Verify correct port: Server should show the port it's listening on
3. Check URL format: Must be `ws://localhost:PORT` for WebSocket
4. For HTTP clients: Must be `http://localhost:PORT` (Socket.IO will upgrade)

### Issue 2: "Connection timeout"

**Cause:** Server is not accessible or wrong port.

**Solutions:**
1. Check if server is running on the port you're connecting to
2. Verify no firewall blocking the connection
3. Try `127.0.0.1` instead of `localhost`

### Issue 3: "Authentication error: No token provided"

**Cause:** Token not being sent correctly.

**Solutions:**
1. Use `auth.token` in Socket.IO client options (recommended)
2. Or use `query.token` for Postman/testing
3. Verify token is not empty or undefined

### Issue 4: "Authentication error: Invalid token"

**Cause:** Token is expired or JWT_SECRET doesn't match.

**Solutions:**
1. Generate a new token from your login endpoint
2. Verify JWT_SECRET environment variable matches between token generation and verification
3. Check token expiration date

---

## Debugging Checklist

Run through this checklist:

- [ ] Server is running (check terminal)
- [ ] Server shows "Socket.IO server initialized"
- [ ] Using correct port (check server startup message)
- [ ] Using correct URL format:
  - Node.js client: `http://localhost:PORT` with `path: '/api/socket.io/'`
  - WebSocket: `ws://localhost:PORT/api/socket.io/`
- [ ] Token is valid (not expired)
- [ ] JWT_SECRET environment variable is set
- [ ] CORS origin includes your client URL

---

## Expected Server Logs (Successful Connection)

```
✅ Socket.IO server initialized
🔐 Socket auth attempt from: ::ffff:127.0.0.1
✅ Token verified for user: string
✅ Socket connected: abc123xyz | User: string (6a01e31fe796cb9c6cae00f6)
```

## Expected Server Logs (Failed Authentication)

```
✅ Socket.IO server initialized
🔐 Socket auth attempt from: ::ffff:127.0.0.1
❌ Token verification failed: jwt expired
```

## Expected Server Logs (No Connection)

```
✅ Socket.IO server initialized
(nothing else - connection not reaching server)
```

---

## Testing Workflow

1. **Start server** with enhanced logging (restart if already running)
2. **Run test script**: `node test-socket-connection.js`
3. **Check server logs** for authentication attempts
4. **If successful**, test with your actual client
5. **If failed**, check error message and refer to solutions above

---

## Need More Help?

If you're still having issues:

1. Share the **exact error message** from the client
2. Share the **server logs** (if any appear)
3. Confirm the **port** your server is running on
4. Confirm the **exact URL** you're using to connect
