const router = require("express").Router();

const { 
  register, 
  login, 
  setAvatar, 
  getAllUsers,
  blockUser,   // <--- Added
  unblockUser  // <--- Added
} = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.post("/setavatar/:id", setAvatar);
router.get("/allusers/:id", getAllUsers);
router.post("/block/:id", blockUser);     // <--- Added
router.post("/unblock/:id", unblockUser); // <--- Added

module.exports = router;