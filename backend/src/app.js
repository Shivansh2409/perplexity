import express from "express";
import cors from "cors";
import cookies from "cookie-parser";

import userRoutes from "./routes/user.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookies());

app.use("/api/auth", userRoutes);

export default app;
