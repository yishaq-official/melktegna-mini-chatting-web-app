const Messages = require("../models/messageModel");

// 1. Add Message to DB
module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to database" });
  } catch (ex) {
    next(ex);
  }
};

// 2. Get Messages for a specific chat
module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    // Find messages where users array contains both 'from' and 'to'
    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 }); // Sort by time (oldest first)

    // Format for Frontend
    const projectedMessages = messages.map((msg) => {
      return {
        _id: msg._id,
        fromSelf: msg.sender.toString() === from, // Boolean: Did I send this?
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
    // Security: In a real app, check if req.user._id === sender
    await Messages.deleteOne({ _id: msgId });
    return res.json({ status: true, msg: "Message deleted" });
  } catch (ex) {
    next(ex);
  }
};