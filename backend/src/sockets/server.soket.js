import { Server } from "socket.io";
import chatModel from "../models/chats.model.js";
import { socketAuthMiddleware } from "../middleware/socket.middleware.js";
import { handleUserMessage } from "../service/socket.service.js";
import messageModel from "../models/messages.model.js";
import AccessRequest from "../models/accessRequest.model.js";

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
      userId = socket.user.user?._id.toString();
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

    socket.on("request_access", async (data, callback) => {
      const { chatId } = data;
      if (!chatId) {
        if (callback) callback({ success: false, error: "Missing chatId" });
        return;
      }
      try {
        const chat = await chatModel.findById(chatId);
        if (!chat) {
          if (callback) callback({ success: false, error: "Chat not found" });
          return;
        }

        const targetUserId = chat.createdBy;

        if (userId === targetUserId.toString()) {
          if (callback) callback({ success: false, error: "You already have access to this chat." });
          return;
        }

        if (chat.participants.some(p => p.toString() === userId)) {
          if (callback) callback({ success: false, error: "You are already a participant in this chat." });
          return;
        }

        const existingRequest = await AccessRequest.findOne({
          requester: userId,
          chat: chatId,
          status: "pending",
        });

        if (existingRequest) {
          if (callback) callback({ success: false, error: "Access request already sent." });
          return;
        }

        const accessRequest = await AccessRequest.create({
          requester: userId,
          targetUser: targetUserId,
          chat: chatId,
        });

        io.to(targetUserId.toString()).emit("access_request_received", {
          ...accessRequest.toObject(),
          requester: { username: socket.user.user.username }, 
        });

        if (callback) callback({ success: true, data: accessRequest });
      } catch (error) {
        if (callback) callback({ success: false, error: error.message });
      }
    });

    socket.on("update_request_status", async (data, callback) => {
      const { requestId, status, permission = "view-only" } = data;
      if (!["approved", "rejected"].includes(status)) {
        if(callback) callback({ success: false, error: "Invalid status" });
        return;
      }

      try {
        const request = await AccessRequest.findById(requestId);
        if (!request) {
          if (callback) callback({ success: false, error: "Request not found" });
          return;
        }

        if (request.targetUser.toString() !== userId) {
          if (callback) callback({ success: false, error: "Not authorized" });
          return;
        }

        if (request.status !== "pending") {
          if (callback) callback({ success: false, error: "Request already processed" });
          return;
        }

        request.status = status;
        await request.save();

        if (status === "approved") {
          const chat = await chatModel.findById(request.chat);
          if (chat && !chat.participants.includes(request.requester)) {
            chat.participants.push(request.requester);
            chat.permissions.set(request.requester.toString(), permission);
            await chat.save();
          }
          io.to(request.requester.toString()).emit("access_granted", {
            chatId: request.chat,
            title: chat?.title || "Chat",
            permission: permission,
          });
        } else {
          io.to(request.requester.toString()).emit("access_rejected", {
            chatId: request.chat,
          });
        }

        if(callback) callback({ success: true });
      } catch (error) {
        if(callback) callback({ success: false, error: error.message });
      }
    });

    socket.on("update_permission", async (data, callback) => {
      const { chatId, targetUserId, permission } = data;
      if (!["no-access", "view-only", "edit"].includes(permission)) {
        if(callback) callback({ success: false, error: "Invalid permission level" });
        return;
      }

      try {
        const chat = await chatModel.findById(chatId);
        if (!chat) {
          if (callback) callback({ success: false, error: "Chat not found" });
          return;
        }

        if (chat.createdBy.toString() !== userId) {
          if (callback) callback({ success: false, error: "Only the chat owner can manage permissions" });
          return;
        }

        if (chat.createdBy.toString() === targetUserId) {
          if (callback) callback({ success: false, error: "Cannot change permission for chat owner" });
          return;
        }

        chat.permissions.set(targetUserId, permission);
        await chat.save();

        io.to(targetUserId.toString()).emit("permission_updated", {
          chatId: chatId,
          permission: permission,
        });

        if(callback) callback({ success: true, permission });
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
