const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array, // Will store [senderId, receiverId]
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Auto-adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Messages", MessageSchema);