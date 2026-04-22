import { Server } from "socket.io";
import chatModel from "../models/chats.model.js";
import { socketAuthMiddleware } from "../middleware/socket.middleware.js";
import { handleUserMessage } from "../service/socket.service.js";
import messageModel from "../models/messages.model.js"

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
    let userId;
    try {
      userId = socket.user.user._id.toString();
    } catch (err) {
      console.log(err);
      return;
    }

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

    socket.on("add_reaction", async (data, callback) => {
      const { messageId, emoji, chatId } = data;
      if (!messageId || !emoji || !chatId) {
        if(callback) callback({ success: false, error: "Missing required fields" });
        return;
      }

      try {
        const message = await messageModel.findById(messageId);
        if (!message) {
          if(callback) callback({ success: false, error: "Message not found" });
          return;
        }

        if (!message.reactions) message.reactions = new Map();
        if (!message.reactions.get(emoji)) message.reactions.set(emoji, []);

        const userIds = message.reactions.get(emoji);
        const hasUser = userIds.some(id => id.toString() === userId);
        if (!hasUser) {
          userIds.push(userId);
          message.reactions.set(emoji, userIds);
        }

        await message.save();
        await message.populate("reactions.$*", "email username");

        io.to(chatId).emit("reaction_updated", { 
          messageId, 
          reactions: Object.fromEntries(message.reactions) 
        });
        if(callback) callback({ success: true });
      } catch (error) {
        if(callback) callback({ success: false, error: error.message });
      }
    });

    socket.on("remove_reaction", async (data, callback) => {
      const { messageId, emoji, chatId } = data;
      if (!messageId || !emoji || !chatId) {
        if(callback) callback({ success: false, error: "Missing required fields" });
        return;
      }

      try {
        const message = await messageModel.findById(messageId);
        if (!message) {
          if(callback) callback({ success: false, error: "Message not found" });
          return;
        }

        if (message.reactions && message.reactions.has(emoji)) {
          const userIds = message.reactions.get(emoji);
          const index = userIds.findIndex(id => id.toString() === userId);
          if (index > -1) {
            userIds.splice(index, 1);
            if (userIds.length === 0) {
              message.reactions.delete(emoji);
            } else {
              message.reactions.set(emoji, userIds);
            }
          }
        }

        await message.save();
        await message.populate("reactions.$*", "email username");

        io.to(chatId).emit("reaction_updated", { 
          messageId, 
          reactions: message.reactions ? Object.fromEntries(message.reactions) : {} 
        });
        if(callback) callback({ success: true });
      } catch (error) {
        if(callback) callback({ success: false, error: error.message });
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
