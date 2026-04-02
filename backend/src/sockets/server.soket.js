import { Server } from "socket.io";
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

    if (socket.chat.participants.some((id) => id.toString() === userId)) {
      const room = socket.chat._id.toString();
      console.log("Client connected to room : ", room);
      socket.join(room);
    } else {
      console.log("Unauthorized client attempted to connect: ", socket.id);
    }

    socket.on("message", (content) => {
      handleUserMessage(socket, content);
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
