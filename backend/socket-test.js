import { io } from "socket.io-client";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDE1NTc1NDNiMzA0ODIxMzFiZWNjYiIsImlhdCI6MTc3NTMyNjU4NiwiZXhwIjoxNzc1NDEyOTg2fQ.2i77BvoHMzEMTfwEZeQaVLlTKUz9AA7GKMuH7NXbAZk";

console.log("🔗 Testing Socket with Token:", token.slice(0, 20) + "...");

const socket = io("http://localhost:8080", {
  auth: {
    token: `Bearer ${token}`,
  },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ SOCKET CONNECTED:", socket.id);

  socket.emit("join_room", { chatId: "69d1557c43b30482131becd1" }, (res) => {
    console.log("🏠 Join room:", res);

    socket.emit(
      "send_message",
      {
        chatId: "69d1557c43b30482131becd1",
        content: "Socket.IO test from BLACKBOXAI ✅",
      },
      (res) => {
        console.log("📤 Send message:", res);
      },
    );
  });
});

socket.on("message", (msg) => {
  console.log(
    "📨 AI RESPONSE via Socket:",
    msg.content.substring(0, 100) + "...",
  );
});

socket.on("connect_error", (err) => {
  console.log("❌ Connect error:", err.message);
});

socket.on("auth_error", (err) => {
  console.log("🔐 Auth error:", err);
});

setTimeout(() => {
  console.log("👋 Disconnecting...");
  socket.disconnect();
}, 8000);
