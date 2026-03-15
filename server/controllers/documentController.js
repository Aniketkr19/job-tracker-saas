// server/controllers/documentController.js
// Files are now stored on Cloudinary instead of local disk.

const prisma = require("../prismaClient");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");

// ── Cloudinary config ────────────────────────────────────────
// Set these in your Render environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Multer + Cloudinary storage ──────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `job-tracker/documents/${req.userId}`,
    // Use original filename (without extension — Cloudinary adds it)
    public_id: `${Date.now()}-${path.parse(file.originalname).name.replace(/\s+/g, "-")}`,
    // Tell Cloudinary to treat it as a raw file (for PDFs, DOCs etc.)
    resource_type: "raw",
    // Keep original format
    format: path.extname(file.originalname).replace(".", ""),
  }),
});

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

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadMiddleware = upload.array("files", 10);

// ── UPLOAD DOCUMENTS ─────────────────────────────────────────
const uploadDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const role = req.body.role || "General";

    const saved = await Promise.all(
      req.files.map((file) =>
        prisma.document.create({
          data: {
            userId:   req.userId,
            name:     path.parse(file.originalname).name,
            fileName: file.originalname,
            fileUrl:  file.path,          // Cloudinary delivers a full HTTPS URL here
            publicId: file.filename,      // Cloudinary public_id (for deletion)
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

// ── UPDATE DOCUMENT ───────────────────────────────────────────
const updateDocument = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, role } = req.body;

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
// Deletes from Cloudinary AND removes the DB record.
const deleteDocument = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.document.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete from Cloudinary using the stored public_id
    await cloudinary.uploader.destroy(existing.publicId, {
      resource_type: "raw",
    });

    await prisma.document.delete({ where: { id } });

    res.json({ message: "Document deleted" });

  } catch (error) {
    console.error("deleteDocument error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DOWNLOAD / VIEW DOCUMENT ──────────────────────────────────
// No streaming needed — just redirect to the Cloudinary URL.
const downloadDocument = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const doc = await prisma.document.findFirst({
      where: { id, userId: req.userId },
    });

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Redirect browser to Cloudinary's direct URL
    res.redirect(doc.fileUrl);

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