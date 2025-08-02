import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/database";
import morgan from "morgan";
import http from "http";
import { setupSocket } from "./config/socket";

import authRoutes from "./routes/auth_routes";
import userRoutes from "./routes/user_routes";
import postRoutes from "./routes/post_routes";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(morgan("dev"));

// Database Connection
connectToDatabase();

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);

const server = http.createServer(app);
setupSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
