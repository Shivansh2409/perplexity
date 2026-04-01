import express from "express";
import { authenticateUser } from "../middleware/user.middleware.js";
import {
  createChat,
  flowUpChat,
  getChat,
} from "../controllers/chat.controllers.js";

const chatRoute = express.Router();

chatRoute.post("/create-chat", authenticateUser, createChat);
chatRoute.post("/flow-up-chat/:chatId", authenticateUser, flowUpChat);
chatRoute.get("/get-chat/:chatId", authenticateUser, getChat);

export default chatRoute;
