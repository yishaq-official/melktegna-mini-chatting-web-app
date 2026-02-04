const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to the Docker Container
mongoose.connect("mongodb://admin:password123@localhost:27017", {
  authSource: "admin" // Required for Docker auth
})
.then(() => {
  console.log("✅ Melktegna DB Connection Successful");
})
.catch((err) => {
  console.error("❌ DB Connection Error:", err.message);
});

const server = app.listen(5000, () => {
  console.log(`🚀 Melktegna Server started on Port 5000`);
});