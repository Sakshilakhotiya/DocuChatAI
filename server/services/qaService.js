import dotenv from "dotenv";
dotenv.config();

import { queryRelevantChunks } from "./embeddingService.js";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

console.log("Loaded GROQ API KEY:", process.env.GROQ_API_KEY ? "YES" : "NO");

// FIX: use modelName instead of model
const llm = new ChatGroq({
apiKey: process.env.GROQ_API_KEY,
modelName: "llama-3.1-8b-instant",
temperature: 0.15,
maxTokens: 256
});

function buildSystemPrompt() {
return `
You are DocuChat AI, a question-answering assistant for PDF documents.

Rules:

* Only answer using the supplied PDF context.
* If the answer is not clearly in the context, say you do not know.
* Do not use outside knowledge.
* Be concise and clear.
  `;
  }

function buildContextString(chunks) {
return chunks
.map(
(chunk, idx) =>
`Chunk ${idx + 1}${
          typeof chunk.page === "number" ? ` (page ${chunk.page})` : ""
        }:\n${chunk.text}`
)
.join("\n\n---\n\n");
}

export async function answerQuestionFromPdf({ question, documentId }) {
const requestStart = Date.now();
console.log("💬 answerQuestionFromPdf called", { documentId, question });

try {
const chunks = await queryRelevantChunks({
documentId,
question,
topK: 5
});


console.log("📊 Chunks found:", chunks.length);

if (!chunks.length) {
  return {
    answer:
      "I could not find relevant information for this question in the uploaded PDF.",
    source: null
  };
}

const context = buildContextString(chunks);

const messages = [
  new SystemMessage(buildSystemPrompt()),
  new HumanMessage(
    `PDF context:\n\n${context}\n\nQuestion: ${question}\n\nAnswer:`
  )
];

const response = await llm.invoke(messages);

const answer =
  typeof response?.content === "string"
    ? response.content
    : Array.isArray(response?.content)
    ? response.content.map((c) => c.text ?? "").join(" ").trim()
    : "I was unable to generate an answer.";

const topChunk = chunks[0];

console.log("✅ Answer generated");

return {
  answer,
  source: {
    text: topChunk.text,
    page: typeof topChunk.page === "number" ? topChunk.page : null
  }
};


} catch (error) {
console.error("❌ Error answering question:", error);


return {
  answer: "I was unable to answer that question due to an error.",
  source: null
};


}
}
