const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // saves to /uploads folder

const { registerUser, loginUser, getProfile, changePassword,updateName, deleteAccount, uploadAvatar } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", authMiddleware, getProfile);
router.put("/change-password", authMiddleware, changePassword);



// ADD these two lines
router.put("/update-name", authMiddleware, updateName);
router.delete("/delete-account", authMiddleware, deleteAccount);

router.put("/upload-avatar", authMiddleware, upload.single("avatar"), uploadAvatar);

module.exports = router;