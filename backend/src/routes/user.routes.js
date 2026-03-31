import { registerUser, loginUser } from "../controllers/user.controllers.js";
import {
  validateLogin,
  validateRegister,
} from "../validators/auth.validator.js";

import express from "express";

const authRoute = express.Router();

authRoute.post("/register", validateRegister, registerUser);
authRoute.post("/login", validateLogin, loginUser);

export default authRoute;
