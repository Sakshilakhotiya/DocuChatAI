import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Break long PDF text into overlapping chunks for embeddings
export async function chunkPdfText(
  text,
  { chunkSize = 1000, chunkOverlap = 200 } = {}
) {
  try {
    // Validate input
    if (!text || typeof text !== "string") {
      console.log("❌ chunkPdfText received invalid text");
      return [];
    }

    // Clean whitespace
    const cleaned = text.replace(/\s+/g, " ").trim();

    if (!cleaned.length) {
      console.log("❌ chunkPdfText received empty text after cleaning");
      return [];
    }

    // Create text splitter
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap
    });

    // Generate documents
    const docs = await splitter.createDocuments([cleaned]);

    console.log("🧱 chunkPdfText created chunks", {
      inputLength: cleaned.length,
      chunkSize,
      chunkOverlap,
      chunkCount: docs.length
    });

    // Return structured chunks
    return docs.map((doc, idx) => ({
      id: `chunk-${idx}`,
      text: doc.pageContent,
      page: doc.metadata?.page ?? null
    }));
  } catch (error) {
    console.error("❌ Error in chunkPdfText:", error);
    return [];
  }
}