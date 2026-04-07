import { Server } from "socket.io";
import chatModel from "../models/chats.model.js";
import { socketAuthMiddleware } from "../middleware/socket.middleware.js";
import { handleUserMessage } from "../service/socket.service.js";

let io;

export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const userId = socket.user.user._id.toString();
    socket.join(userId);
    console.log("Client connected: ", socket.id);

    // Dynamic room joining handled via client "join_room" event

    socket.on("join_room", async (data, callback) => {
      const { chatId } = data;
      if (!chatId) {
        callback({ success: false, error: "Missing chatId" });
        return;
      }

      try {
        const chat = await chatModel.findById(chatId);
        if (!chat) {
          callback({ success: false, error: "Chat not found" });
          return;
        }

        if (
          !chat.participants.some(
            (id) => id.toString() === socket.user.user._id.toString(),
          )
        ) {
          callback({ success: false, error: "Not a participant" });
          return;
        }

        const room = chatId;
        socket.chat = chat;
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
        callback({ success: true, room });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on("send_message", async (data, callback) => {
      const { chatId, content } = data;
      if (!chatId || !content) {
        callback({ success: false, error: "Missing chatId or content" });
        return;
      }

      try {
        socket.chat = await chatModel.findById(chatId);
        if (!socket.chat) {
          callback({ success: false, error: "Chat not found" });
          return;
        }

        if (
          !socket.chat.participants.some(
            (id) => id.toString() === socket.user.user._id.toString(),
          )
        ) {
          callback({ success: false, error: "Unauthorized" });
          return;
        }

        // Pass io instance to socket service so it can broadcast to ALL clients
        await handleUserMessage(socket, content, io);
        callback({ success: true });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on("leave_room", async (data, callback) => {
      const { chatId } = data;
      if (!chatId) {
        callback({ success: false, error: "Missing chatId" });
        return;
      }

      try {
        socket.leave(chatId);
        console.log(`Socket ${socket.id} left room ${chatId}`);
        callback({ success: true });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected: ", socket.id);
    });
  });

  console.log("Socket server initialized");
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io server not initialized");
  }
  return io;
};
