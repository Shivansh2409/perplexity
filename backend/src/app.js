import express from "express";
import cors from "cors";
import cookies from "cookie-parser";
import morgan from "morgan";

import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import accessRoutes from "./routes/access.routes.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookies());
app.use(morgan("dev"));

app.use("/api/auth", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/access", accessRoutes);

export default app;
