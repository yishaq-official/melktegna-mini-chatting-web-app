const Messages = require("../models/messageModel");
const User = require("../models/userModel");

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;

    const recipient = await User.findById(to);
    if (recipient && recipient.blockedUsers.includes(from)) {
      return res.json({ 
        msg: "Message not sent. You are blocked by this user.", 
        status: false 
      });
    }

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

// 👇 UPDATED: Get Messages & Mark as Read
module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    // 1. Mark messages sent BY 'to' (them) as READ because 'from' (me) is fetching them
    await Messages.updateMany(
      {
        users: { $all: [from, to] },
        sender: to, 
        read: false
      },
      { $set: { read: true } }
    );

    // 2. Fetch the messages
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