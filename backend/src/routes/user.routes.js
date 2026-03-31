import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/user.controllers.js";
import { authenticateUser } from "../middleware/user.middleware.js";
import {
  validateLogin,
  validateRegister,
} from "../validators/user.validator.js";

import express from "express";

const authRoute = express.Router();

authRoute.post("/register", validateRegister, registerUser);
authRoute.post("/login", validateLogin, loginUser);
authRoute.get("/get-user", authenticateUser, getUserProfile);

export default authRoute;
