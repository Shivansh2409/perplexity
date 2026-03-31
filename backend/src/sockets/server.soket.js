import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socket.middleware.js";

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
    console.log("New client connected: ", socket.id);
    console.log("Authenticated user: ", socket.user);

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
