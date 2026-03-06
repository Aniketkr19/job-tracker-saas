const express = require("express");
const router = express.Router();
const { registerUser, loginUser , getProfile, addJob, getJobs, deleteJob, changePassword, updateJob} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, getProfile);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/jobs", authMiddleware, addJob);
router.get("/jobs", authMiddleware, getJobs);
router.delete("/jobs/:id", authMiddleware, deleteJob);
router.get("/profile", authMiddleware, getProfile);
router.put("/change-password", authMiddleware, changePassword);
router.put("/jobs/:id", authMiddleware, updateJob);

module.exports = router;