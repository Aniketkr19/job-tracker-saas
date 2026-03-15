const express = require("express");
const router = express.Router();

const { addJob, getJobs, deleteJob, updateJob } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Jobs routes
router.post("/", authMiddleware, addJob);
router.get("/", authMiddleware, getJobs);
router.put("/:id", authMiddleware, updateJob);
router.delete("/:id", authMiddleware, deleteJob);

module.exports = router;