import express from "express";
import connectDb from "./config/db.js";
import dotenv from "dotenv";
import userRouters from "./routes/userRoutes.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import socketHandler from "./utils/socket.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.routes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cookieParser())
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Routes
app.use("/api/users", userRouters);
app.use("/api/messages",messageRoutes);
app.use("/uploads",express.static("uploads"))
app.use("/api/upload" , uploadRoutes)

app.get("/", (req, res) => {
  res.send("Server is running...");
});

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*", // no slash
    methods: ["GET", "POST"],
  },
});

// ✅ Call socket handler
socketHandler(io);

// ✅ Start Server Properly
const startServer = async () => {
  try {
    await connectDb();
    console.log("Database Connected Successfully ✅");

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Server started at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Database Connection Failed ❌");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
