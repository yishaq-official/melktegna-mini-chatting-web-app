const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

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
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

// 👇 NEW: BLOCK USER
module.exports.blockUser = async (req, res, next) => {
  try {
    const id = req.params.id; // Me
    const { blockId } = req.body; // Them
    
    const user = await User.findById(id);
    if (!user.blockedUsers.includes(blockId)) {
        await user.updateOne({ $push: { blockedUsers: blockId } });
        return res.json({ status: true, msg: "User blocked" });
    }
    return res.json({ status: false, msg: "Already blocked" });
  } catch (ex) {
    next(ex);
  }
};

// 👇 NEW: UNBLOCK USER
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