const express = require("express");
const router = express.Router();
const { registerUser, loginUser , getProfile} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, getProfile);

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;