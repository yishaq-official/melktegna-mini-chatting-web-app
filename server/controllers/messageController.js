const Messages = require("../models/messageModel");
const User = require("../models/userModel"); // <--- Import User Model

// 1. Add Message to DB
module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;

    // --- BLOCKING LOGIC START ---
    // Find the recipient (the person receiving the message)
    const recipient = await User.findById(to);

    // Check if the recipient has blocked the sender
    if (recipient && recipient.blockedUsers.includes(from)) {
      return res.json({ 
        msg: "Message not sent. You are blocked by this user.", 
        status: false 
      });
    }
    // --- BLOCKING LOGIC END ---

    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully.", status: true });
    else return res.json({ msg: "Failed to add message to database", status: false });
  } catch (ex) {
    next(ex);
  }
};

// 2. Get Messages for a specific chat
module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        _id: msg._id,
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.deleteMessage = async (req, res, next) => {
  try {
    const { msgId } = req.body;
    await Messages.deleteOne({ _id: msgId });
    return res.json({ status: true, msg: "Message deleted" });
  } catch (ex) {
    next(ex);
  }
};