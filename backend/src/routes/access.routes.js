import express from "express";
import { authenticateUser } from "../middleware/user.middleware.js";
import {
  requestAccess,
  getPendingRequests,
  updateRequestStatus,
  updateUserPermission,
  getUserPermission,
} from "../controllers/access.controllers.js";

const accessRoute = express.Router();

// User A requests access to a specific chat owned by User B
accessRoute.post("/request", authenticateUser, requestAccess);

// User B gets their pending requests
accessRoute.get("/requests/pending", authenticateUser, getPendingRequests);

// User B approves or rejects a request
accessRoute.put("/requests/:requestId", authenticateUser, updateRequestStatus);

// Owner updates user permission
accessRoute.put(
  "/permission/:chatId/:userId",
  authenticateUser,
  updateUserPermission,
);

// Get user's permission for a chat
accessRoute.get("/permission/:chatId", authenticateUser, getUserPermission);

export default accessRoute;
