import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatBox from "../components/ChatBox.jsx";
import FileUpload from "../components/FileUpload.jsx";

function Home() {
  // Holds all messages in the current chat session
  const [messages, setMessages] = useState([]);
  // Tracks whether the backend is currently generating an answer
  const [isLoading, setIsLoading] = useState(false);
  // Identifier for the currently uploaded PDF in the backend/vector store
  const [documentId, setDocumentId] = useState(null);
  // Basic status message for the active document
  const [activeDocLabel, setActiveDocLabel] = useState("No PDF uploaded yet");
  // Upload success UI state: "modal" -> "widget" -> null
  const [uploadStatusMode, setUploadStatusMode] = useState(null);
  const [lastUploadedFilename, setLastUploadedFilename] = useState(null);

  useEffect(() => {
    if (uploadStatusMode === "modal") {
      const timer = setTimeout(() => {
        setUploadStatusMode("widget");
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [uploadStatusMode]);

  const handlePdfUploaded = (payload) => {
    // When a PDF is uploaded successfully, store its documentId so that
    // subsequent questions are scoped to this specific file.
    setDocumentId(payload.documentId);
    setActiveDocLabel(`Active PDF: ${payload.filename}`);
    setLastUploadedFilename(payload.filename);
    setUploadStatusMode("modal");
    // Optionally, we could clear old messages when a new PDF is uploaded.
    setMessages([]);
  };

  const handleNewMessage = (newMessage, aiResponse) => {
    // Append the user's question and the AI answer to the chat history
    setMessages((prev) => [...prev, newMessage, aiResponse]);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#020617] via-slate-950 to-[#0f172a] text-slate-100">
      {/* Upload success modal + floating widget */}
      <AnimatePresence>
        {uploadStatusMode === "modal" && (
          <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
            <motion.div
              layoutId="upload-status"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative rounded-3xl border border-emerald-400/40 bg-slate-900/80 px-8 py-6 shadow-[0_0_60px_rgba(16,185,129,0.45)] backdrop-blur-xl"
            >
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent blur-2xl" />
              {/* Simple confetti effect */}
              <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
                {[...Array(14)].map((_, idx) => (
                  <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    className="absolute h-2 w-2 rounded-sm bg-gradient-to-br from-emerald-400 to-cyan-300 opacity-80 blur-[0.3px]"
                    style={{
                      top: `${10 + (idx * 7) % 80}%`,
                      left: `${10 + (idx * 13) % 80}%`,
                      animation: "bounce 1.4s infinite alternate",
                      animationDelay: `${idx * 0.07}s`
                    }}
                  />
                ))}
              </div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl">
                  🎉
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-50">
                  PDF Uploaded &amp; Indexed Successfully!
                </h2>
              </div>
              {lastUploadedFilename && (
                <p className="mt-1 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-200">
                    <span className="text-emerald-400">📄</span>
                    <span className="truncate max-w-[220px]">{lastUploadedFilename}</span>
                  </span>
                </p>
              )}
              <p className="mt-3 text-xs text-slate-400">
                You can now ask questions in the chat box using this PDF as context.
              </p>
            </motion.div>
          </div>
        )}

        {uploadStatusMode === "widget" && (
          <div className="pointer-events-none fixed right-4 top-4 z-40 flex justify-end">
            <motion.div
              layoutId="upload-status"
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="flex items-center gap-2 rounded-2xl border border-emerald-400/50 bg-slate-900/90 px-3 py-2 text-xs shadow-[0_0_40px_rgba(16,185,129,0.55)] backdrop-blur-xl"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] text-emerald-300">
                ✅
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-emerald-300">PDF Ready</span>
                {lastUploadedFilename && (
                  <span className="max-w-[160px] truncate text-[10px] text-slate-400">
                    {lastUploadedFilename}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="border-b border-[#1e293b]/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-200 bg-clip-text text-transparent">
                DocuChat AI
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Upload a PDF and chat with its contents. Answers are grounded in your document.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 text-xs text-slate-400 md:items-end">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-[11px] font-medium text-emerald-300/90 shadow-[0_0_24px_rgba(16,185,129,0.35)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
              <span>{activeDocLabel}</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Only one PDF is active at a time.
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 px-4 py-4 md:py-6">
          <FileUpload onUploaded={handlePdfUploaded} disabled={isLoading} />
          <ChatBox
            messages={messages}
            onNewMessage={handleNewMessage}
            documentId={documentId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      </main>

      <footer className="border-t border-slate-900/80 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-xs text-slate-500">
          <span>Answers are generated from your uploaded PDF only.</span>
          <span className="hidden sm:inline">
            Built with React, Tailwind CSS, LangChain, Groq, and Hugging Face.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Home;

