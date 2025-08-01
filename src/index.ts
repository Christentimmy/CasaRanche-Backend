

import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/database";
import authRoutes from "./routes/auth_routes";
import morgan from "morgan";
import http from 'http';
import { setupSocket } from "./config/socket";


dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(morgan("dev"));

// Database Connection
connectToDatabase();

app.use("/api/auth", authRoutes);

const server = http.createServer(app);
setupSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
