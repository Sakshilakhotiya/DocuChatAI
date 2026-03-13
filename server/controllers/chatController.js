import { answerQuestionFromPdf } from "../services/qaService.js";

// Handle chat questions: run similarity search in the local in-memory
// vector store scoped by documentId, then ask the Groq LLM strictly
// based on the retrieved PDF chunks.
export const handleAskQuestion = async (req, res) => {
  try {
    const { question, documentId } = req.body || {};

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required." });
    }
    if (!documentId) {
      return res.status(400).json({ message: "documentId is required." });
    }

    console.log("📨 Incoming question", { documentId, question });

    const result = await answerQuestionFromPdf({
      question,
      documentId
    });

    return res.status(200).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error answering question:", {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      message: "Failed to answer question.",
      error: error.message
    });
  }
};

