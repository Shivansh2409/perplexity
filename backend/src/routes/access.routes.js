import express from "express";
import { authenticateUser } from "../middleware/user.middleware.js";
import {
  requestAccess,
  getPendingRequests,
  updateRequestStatus,
} from "../controllers/access.controllers.js";

const accessRoute = express.Router();

// User A requests access to a specific chat owned by User B
accessRoute.post("/request", authenticateUser, requestAccess);

// User B gets their pending requests
accessRoute.get("/requests", authenticateUser, getPendingRequests);

// User B approves or rejects a request
accessRoute.patch(
  "/requests/:requestId",
  authenticateUser,
  updateRequestStatus,
);

export default accessRoute;
