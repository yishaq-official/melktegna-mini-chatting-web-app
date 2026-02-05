const router = require("express").Router();

// 👇 THE FIX: Added 'setAvatar' and 'getAllUsers' to this list
const { 
  register, 
  login, 
  setAvatar, 
  getAllUsers 
} = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.post("/setavatar/:id", setAvatar); // Now this will work
router.get("/allusers/:id", getAllUsers);

module.exports = router;