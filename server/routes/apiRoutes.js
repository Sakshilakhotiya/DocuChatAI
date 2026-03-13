import express from "express";
import multer from "multer";
import { handleUploadPdf } from "../controllers/uploadController.js";
import { handleAskQuestion } from "../controllers/chatController.js";

const router = express.Router();

// Configure multer to keep uploads in memory and restrict to a single PDF.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB max PDF size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are allowed"));
    } else {
      cb(null, true);
    }
  }
});

// POST /api/upload-pdf
router.post("/upload-pdf", upload.single("file"), handleUploadPdf);

// POST /api/ask-question
router.post("/ask-question", handleAskQuestion);

export default router;

