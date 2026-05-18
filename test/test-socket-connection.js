const io = require("socket.io-client");

// Replace with your actual JWT token
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjZhMDFlMzFmZTc5NmNiOWM2Y2FlMDBmNiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoic3RyaW5nIiwidHlwZSI6InVzZXIifSwiaWF0IjoxNzc4NTA4NTgxLCJleHAiOjE4NjQ5MDg1ODF9.3hfjMDwFMuIBoJFkCF5WIt15tYDV8LtIOkzs5kRYWG8";

console.log("=".repeat(60));
console.log("🔌 Socket.IO Connection Test");
console.log("=".repeat(60));
console.log("Server: http://localhost:3031");
console.log("Path: /api/socket.io/");
console.log("Token:", TOKEN.substring(0, 50) + "...");
console.log("=".repeat(60));
console.log("");

// Test which method to use based on command line argument
const useQueryString = process.argv.includes("--query");

if (useQueryString) {
  console.log(
    "📝 Testing with QUERY STRING method (for Postman compatibility)",
  );
} else {
  console.log("📝 Testing with AUTH.TOKEN method (recommended)");
}
console.log("");

// Method 1: Using auth.token (RECOMMENDED)
// const socket = io("http://localhost:3031", {
const socket = io("https://test.sarajevoexpats.com", {
  path: "/api/socket.io/",
  ...(useQueryString
    ? {
        query: { token: TOKEN },
      }
    : {
        auth: { token: TOKEN },
      }),
  transports: ["websocket", "polling"],
  reconnection: false,
  timeout: 10000,
  forceNew: true,
});

socket.on("connect", () => {
  console.log("✅ Successfully connected!");
  console.log("Socket ID:", socket.id);
  console.log("");
  console.log("Connection successful! You can now test events.");

  // Disconnect after successful connection
  setTimeout(() => {
    console.log("\n🔌 Disconnecting...");
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
  console.error("Error details:", error);
  process.exit(1);
});

socket.on("error", (error) => {
  console.error("❌ Socket error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Disconnected:", reason);
});

// Timeout handler
setTimeout(() => {
  if (!socket.connected) {
    console.error("❌ Connection timeout after 10 seconds");
    console.error("\nPossible issues:");
    console.error("1. Server is not running on port 3031");
    console.error("2. JWT_SECRET environment variable doesn't match");
    console.error("3. Token is expired or invalid");
    console.error("4. CORS settings blocking the connection");
    process.exit(1);
  }
}, 10000);
