import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

connectDB();

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Welcome to the Perplexity API");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
