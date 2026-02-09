const router = require("express").Router();

const { 
  register, 
  login, 
  setAvatar, 
  getAllUsers,
  blockUser,   // <--- Added
  unblockUser,  // <--- Added
  generateRandomAvatars
} = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.post("/setavatar/:id", setAvatar);
router.get("/allusers/:id", getAllUsers);
router.post("/block/:id", blockUser);     // <--- Added
router.post("/unblock/:id", unblockUser); // <--- Added
router.get("/generateavatar", generateRandomAvatars);

module.exports = router;