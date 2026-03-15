// server/controllers/documentController.js
//
// Handles all document/resume upload logic.
// Uses multer for file storage — same pattern as avatar uploads.
//
// FILES ARE STORED AT:
//   server/uploads/documents/<userId>-<timestamp>-<originalname>
//
// ROUTES HANDLED:
//   POST   /api/documents/upload    — upload one or more files
//   GET    /api/documents           — get all documents for logged-in user
//   PUT    /api/documents/:id       — rename or change role of a document
//   DELETE /api/documents/:id       — delete a document (file + DB record)

const prisma = require("../prismaClient");
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// ── Multer storage config ────────────────────────────────────
// Files land in server/uploads/documents/
// Filename: <userId>-<timestamp>-<originalname>
// This prevents filename collisions between users.

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/documents");
    // Create folder if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    // e.g. "42-1710000000000-my-resume.pdf"
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${req.userId}-${Date.now()}-${safeName}`);
  },

});

// Only allow these file types
const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Use PDF, DOC, DOCX, TXT, or images."), false);
  }
};

// Max 5MB per file, up to 10 files at once
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Export the multer middleware so routes can use it
// Usage in route: router.post("/upload", authMiddleware, uploadMiddleware, uploadDocuments)
const uploadMiddleware = upload.array("files", 10);

// ── UPLOAD DOCUMENTS ─────────────────────────────────────────
// POST /api/documents/upload
// Body (multipart/form-data):
//   files  — one or more files
//   role   — string tag e.g. "Frontend Dev" (optional, defaults to "General")
const uploadDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const role = req.body.role || "General";

    // Save each file's metadata to the database
    const saved = await Promise.all(
      req.files.map((file) =>
        prisma.document.create({
          data: {
            userId:   req.userId,
            name:     path.parse(file.originalname).name, // name without extension
            fileName: file.originalname,
            filePath: file.path,                           // absolute path on disk
            fileType: file.mimetype,
            fileSize: file.size,
            role,
          },
        })
      )
    );

    res.status(201).json({ message: "Uploaded successfully", documents: saved });

  } catch (error) {
    console.error("uploadDocuments error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
};

// ── GET ALL DOCUMENTS ─────────────────────────────────────────
// GET /api/documents
// Returns all documents belonging to the logged-in user,
// newest first. Does NOT return the file content — only metadata.
// The frontend uses the /api/documents/:id/download route to get the file.
const getDocuments = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where:   { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(documents);
  } catch (error) {
    console.error("getDocuments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── UPDATE DOCUMENT (rename / change role) ───────────────────
// PUT /api/documents/:id
// Body: { name?, role? }
// Only the owner can update their document.
const updateDocument = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, role } = req.body;

    // Make sure this document belongs to the logged-in user
    const existing = await prisma.document.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Document not found" });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        name: name || existing.name,
        role: role || existing.role,
      },
    });

    res.json(updated);

  } catch (error) {
    console.error("updateDocument error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE DOCUMENT ───────────────────────────────────────────
// DELETE /api/documents/:id
// Deletes the file from disk AND removes the DB record.
// Only the owner can delete their document.
const deleteDocument = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Make sure this document belongs to the logged-in user
    const existing = await prisma.document.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete the actual file from disk
    if (fs.existsSync(existing.filePath)) {
      fs.unlinkSync(existing.filePath);
    }

    // Delete the database record
    await prisma.document.delete({ where: { id } });

    res.json({ message: "Document deleted" });

  } catch (error) {
    console.error("deleteDocument error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DOWNLOAD DOCUMENT ─────────────────────────────────────────
// GET /api/documents/:id/download
// Streams the file back to the browser with correct headers
// so it downloads with the original filename.
const downloadDocument = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const doc = await prisma.document.findFirst({
      where: { id, userId: req.userId },
    });

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!fs.existsSync(doc.filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Set headers so browser downloads with original filename
    res.setHeader("Content-Disposition", `attachment; filename="${doc.fileName}"`);
    res.setHeader("Content-Type", doc.fileType);
    res.sendFile(doc.filePath);

  } catch (error) {
    console.error("downloadDocument error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadMiddleware,
  uploadDocuments,
  getDocuments,
  updateDocument,
  deleteDocument,
  downloadDocument,
};