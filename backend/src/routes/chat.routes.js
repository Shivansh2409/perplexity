import express from "express";
import { authenticateUser } from "../middleware/user.middleware.js";
import { createChat } from "../controllers/chat.controllers.js";

const chatRoute = express.Router();

chatRoute.post("/create-chat", authenticateUser, createChat);

export default chatRoute;
