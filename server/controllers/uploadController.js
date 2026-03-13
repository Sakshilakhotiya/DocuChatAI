import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { v4 as uuidv4 } from "uuid";
import { chunkPdfText } from "../services/pdfService.js";
import { upsertPdfEmbeddings } from "../services/embeddingService.js";

// Handle PDF uploads: extract text, chunk it, embed each chunk,
// and store all embeddings in the in-memory vector store.
export const handleUploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const buffer = req.file.buffer;

    // Extract full text from PDF
    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text || "";

    if (!rawText.trim()) {
      return res.status(400).json({
        message: "The uploaded PDF appears to contain no extractable text."
      });
    }

    const documentId = uuidv4();

    console.log("📁 New PDF upload received", {
      documentId,
      filename: req.file.originalname,
      fileSize: req.file.size
    });

    // Chunk PDF text
    const chunks = await chunkPdfText(rawText, {
      chunkSize: 1000,
      chunkOverlap: 200
    });

    console.log("🧱 PDF text chunked", {
      documentId,
      chunkCount: chunks.length
    });

    // Store embeddings
    await upsertPdfEmbeddings({
      documentId,
      chunks
    });

    return res.status(200).json({
      message: "PDF uploaded and indexed successfully.",
      documentId,
      totalChunks: chunks.length
    });
  } catch (error) {
    console.error("❌ Error handling PDF upload:", error);

    return res.status(500).json({
      message: "Failed to process and index the uploaded PDF.",
      error: error.message
    });
  }
};