import jwt from "jsonwebtoken";
import { getUserById } from "../service/user.service.js";

export async function socketAuthMiddleware(socket, next) {
  const token =
    socket.handshake.auth.token || socket.handshake.headers["authorization"];
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  const tokenWithoutBearer = token.replace("Bearer ", "");
  const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
  if (!decoded) {
    return next(new Error("Authentication error: Invalid token"));
  }
  socket.user = await getUserById(decoded.id);
  next();
}
