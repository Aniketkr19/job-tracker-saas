// server/routes/documentRoutes.js

const express = require("express");
const router  = express.Router();

const {
  uploadMiddleware,
  uploadDocuments,
  getDocuments,
  updateDocument,
  deleteDocument,
  downloadDocument,
} = require("../controllers/documentController");

const authMiddleware = require("../middleware/authMiddleware");

// All routes require the user to be logged in
router.post(  "/upload",           authMiddleware, uploadMiddleware, uploadDocuments);
router.get(   "/",                 authMiddleware, getDocuments);
router.put(   "/:id",              authMiddleware, updateDocument);
router.delete("/:id",              authMiddleware, deleteDocument);
router.get(   "/:id/download",     authMiddleware, downloadDocument);

module.exports = router;