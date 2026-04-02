import jwt from "jsonwebtoken";
import { getUserById } from "../service/user.service.js";
import chatModel from "../models/chats.model.js";

export async function socketAuthMiddleware(socket, next) {
  const token =
    socket.handshake.auth.token || socket.handshake.headers["authorization"];
  const chatId = socket.handshake.query.chatId;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  const tokenWithoutBearer = token.replace("Bearer ", "");
  const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
  if (!decoded) {
    return next(new Error("Authentication error: Invalid token"));
  }
  if (chatId) {
    socket.chat = await chatModel.findById(chatId);
    if (!socket.chat) {
      return next(new Error("Chat not found"));
    }
  }
  socket.user = await getUserById(decoded.id);
  next();
}
