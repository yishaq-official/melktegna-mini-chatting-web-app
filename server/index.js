const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messagesRoutes");
const socket = require("socket.io"); // <-- Import Socket.io
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);

// Connect to Database
//mongodb://admin:password123@localhost:27017
mongoose.connect("mongodb://localhost:27017/", {
  authSource: "admin"
})
.then(() => {
  console.log("✅ Melktegna DB Connection Successful");
})
.catch((err) => {
  console.error("❌ DB Connection Error:", err.message);
});

// Start Server and Capture the Instance
const server = app.listen(5000, () => {
  console.log(`🚀 Melktegna Server started on Port 5000`);
});

// 👇 SOCKET.IO SETUP
const io = socket(server, {
  cors: {
    origin: "http://localhost:5173", // Allow connection from Frontend
    credentials: true,
  },
});

// Global Map to store online users: { userId: socketId }
global.onlineUsers = new Map();

io.on("connection", (socket) => {
  // 1. When a user logs in, save their socket ID
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  // 2. Handling Message Sending
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to); // Get recipient's socket ID
    if (sendUserSocket) {
      // Emit to that specific user only
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});