import express from "express";
import { authenticateUser } from "../middleware/user.middleware.js";
import {
  createChat,
  flowUpChat,
  getChat,
  addReaction,
  removeReaction,
  pinMessage,
  unpinMessage,
  saveMessage,
  unsaveMessage,
  editMessage,
  getPinnedMessages,
  getSavedMessages,
} from "../controllers/chat.controllers.js";

const chatRoute = express.Router();

// Core chat routes
chatRoute.post("/create-chat", authenticateUser, createChat);
chatRoute.post("/flow-up-chat/:chatId", authenticateUser, flowUpChat);
chatRoute.get("/get-chat/:chatId", authenticateUser, getChat);

// Unique features routes - Reactions
chatRoute.post("/message/:messageId/reaction", authenticateUser, addReaction);
chatRoute.delete(
  "/message/:messageId/reaction",
  authenticateUser,
  removeReaction,
);

// Unique features routes - Pinned Messages
chatRoute.put("/message/:messageId/pin", authenticateUser, pinMessage);
chatRoute.put("/message/:messageId/unpin", authenticateUser, unpinMessage);
chatRoute.get("/chat/:chatId/pinned", authenticateUser, getPinnedMessages);

// Unique features routes - Saved Messages
chatRoute.put("/message/:messageId/save", authenticateUser, saveMessage);
chatRoute.put("/message/:messageId/unsave", authenticateUser, unsaveMessage);
chatRoute.get("/saved-messages", authenticateUser, getSavedMessages);

// Unique features routes - Edit Message
chatRoute.put("/message/:messageId/edit", authenticateUser, editMessage);

export default chatRoute;
