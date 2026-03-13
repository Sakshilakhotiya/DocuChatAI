import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";

// In-memory map of documentId -> MemoryVectorStore
const vectorStores = new Map();

// LOCAL embedding model (fast, no API calls)
const embeddings = new HuggingFaceTransformersEmbeddings({
modelName: "Xenova/bge-small-en-v1.5"
});

export async function upsertPdfEmbeddings({ documentId, chunks }) {
console.log("🧩 upsertPdfEmbeddings called", {
documentId,
totalChunks: Array.isArray(chunks) ? chunks.length : 0
});

if (!documentId) {
throw new Error("documentId is required to upsert embeddings.");
}

if (!Array.isArray(chunks) || chunks.length === 0) {
console.log("❌ No chunks received for embedding", { documentId });
throw new Error("No chunks to embed for this PDF.");
}

const docs = chunks
.filter((chunk) => chunk.text && chunk.text.trim().length > 0)
.map(
(chunk, idx) =>
new Document({
pageContent: chunk.text,
metadata: {
documentId,
chunkId: chunk.id ?? `chunk-${idx}`,
page: typeof chunk.page === "number" ? chunk.page : null
}
})
);

console.log("📄 Chunks to embed (non-empty text):", docs.length);

if (docs.length === 0) {
console.log("❌ All chunks were empty after filtering", { documentId });
throw new Error("No non-empty chunks to embed for this PDF.");
}

const start = Date.now();

const store = await MemoryVectorStore.fromDocuments(docs, embeddings);

const elapsedMs = Date.now() - start;

vectorStores.set(documentId, store);

console.log("✅ Embeddings stored for document", {
documentId,
vectorStoreKeys: Array.from(vectorStores.keys()),
elapsedMs
});
}

export async function queryRelevantChunks({ documentId, question, topK = 5 }) {
if (!documentId) {
throw new Error("documentId is required to query embeddings.");
}

const store = vectorStores.get(documentId);

if (!store) {
console.log("❌ No vector store found for document", {
documentId,
availableDocumentIds: Array.from(vectorStores.keys())
});
return [];
}

console.log("🔍 Searching chunks for question", {
documentId,
question,
topK
});

const start = Date.now();

const results = await store.similaritySearch(question, topK);

const elapsedMs = Date.now() - start;

console.log("📊 Chunks retrieved from vector store", {
documentId,
resultCount: results.length,
elapsedMs
});

return results.map((doc) => ({
text: doc.pageContent,
page: typeof doc.metadata?.page === "number" ? doc.metadata.page : null
}));
}
