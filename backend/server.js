import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import http from "http";
import { initSocketServer } from "./src/sockets/server.soket.js";

const httpServer = http.createServer(app);
initSocketServer(httpServer);

connectDB();

const PORT = process.env.PORT || 8080;

// httpServer.get("/", (req, res) => {
//   res.send("Welcome to the Perplexity API");
// });

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
