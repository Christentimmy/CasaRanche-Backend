

import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./modules/config/database";


dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Database Connection
connectToDatabase();

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
