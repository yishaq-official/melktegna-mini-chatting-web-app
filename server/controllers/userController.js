const User = require("../models/userModel");
const Messages = require("../models/messageModel");
const bcrypt = require("bcryptjs");
const multiavatar = require("@multiavatar/multiavatar");

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.params.id;
    const users = await User.find({ _id: { $ne: currentUserId } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);

    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Messages.countDocuments({
          sender: user._id,
          users: { $all: [currentUserId, user._id] },
          read: false,
        });
        return { ...user.toObject(), unreadCount: count };
      })
    );

    return res.json(usersWithCounts);
  } catch (ex) {
    next(ex);
  }
};

module.exports.blockUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { blockId } = req.body;
    const user = await User.findById(id);
    if (!user.blockedUsers) { user.blockedUsers = []; }
    if (!user.blockedUsers.includes(blockId)) {
        await user.updateOne({ $push: { blockedUsers: blockId } });
        return res.json({ status: true, msg: "User blocked" });
    }
    return res.json({ status: false, msg: "Already blocked" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.unblockUser = async (req, res, next) => {
  try {
    const id = req.params.id; 
    const { blockId } = req.body; 
    const user = await User.findById(id);
    if (user.blockedUsers.includes(blockId)) {
        await user.updateOne({ $pull: { blockedUsers: blockId } });
        return res.json({ status: true, msg: "User unblocked" });
    }
    return res.json({ status: false, msg: "User was not blocked" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.generateRandomAvatars = async (req, res, next) => {
  try {
    const images = [];
    for (let i = 0; i < 4; i++) {
        // 1. Generate random string for seed
        const seed = Math.round(Math.random() * 100000);
        
        // 2. Generate SVG locally using the library
        const svg = multiavatar(JSON.stringify(seed));
        
        // 3. Convert to Base64 (Frontend expects this format)
        const buffer = Buffer.from(svg);
        images.push(buffer.toString("base64"));
    }
    return res.json(images);
  } catch (ex) {
    next(ex);
  }
};