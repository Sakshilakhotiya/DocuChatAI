import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatBox from "../components/ChatBox.jsx";
import FileUpload from "../components/FileUpload.jsx";

function Home() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  const [activeDocLabel, setActiveDocLabel] = useState("No PDF uploaded yet");
  const [uploadStatusMode, setUploadStatusMode] = useState(null);
  const [lastUploadedFilename, setLastUploadedFilename] = useState(null);

  useEffect(() => {
    if (uploadStatusMode === "modal") {
      const timer = setTimeout(() => setUploadStatusMode("widget"), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [uploadStatusMode]);

  const handlePdfUploaded = (payload) => {
    setDocumentId(payload.documentId);
    setActiveDocLabel(`Active PDF: ${payload.filename}`);
    setLastUploadedFilename(payload.filename);
    setUploadStatusMode("modal");
    setMessages([]);
  };

  const handleNewMessage = (newMessage, aiResponse) => {
    setMessages((prev) => [...prev, newMessage, aiResponse]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/50 to-violet-950/60 md:bg-gradient-to-br md:from-slate-950 md:via-indigo-950/70 md:to-slate-950">
      {/* Desktop: blurred dark outer background */}
      <div className="fixed inset-0 -z-10 hidden md:block md:backdrop-blur-xl md:bg-slate-950/40" aria-hidden />

      <div className="flex min-h-screen flex-col md:min-h-screen md:items-center md:justify-center md:py-8">
        {/* Central container: mobile full screen, desktop 420–500px rounded card */}
        <motion.div
          initial={false}
          className="flex h-screen w-full flex-col overflow-hidden bg-gradient-to-b from-slate-900/98 via-indigo-950/40 to-violet-950/50 shadow-2xl md:h-auto md:max-h-[88vh] md:min-h-[560px] md:w-full md:max-w-[460px] md:rounded-[30px] md:border md:border-indigo-500/20 md:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_60px_rgba(99,102,241,0.18),0_0_32px_rgba(139,92,246,0.12)] md:backdrop-blur-2xl"
        >
          {/* Header inside container */}
          <header className="shrink-0 border-b border-white/5 px-4 py-3 backdrop-blur-sm">
            <h1 className="text-center text-lg font-semibold tracking-tight text-white md:text-xl">
              <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-violet-300 bg-clip-text text-transparent">
                DocuChat AI
              </span>
            </h1>
            <p className="mt-0.5 text-center text-[11px] text-slate-400">
              {activeDocLabel}
            </p>
          </header>

          {/* Upload + Chat area */}
          <div className="flex min-h-0 flex-1 flex-col gap-0">
            <div className="shrink-0 px-3 pt-3">
              <FileUpload onUploaded={handlePdfUploaded} disabled={isLoading} />
            </div>
            <div className="min-h-0 flex-1 px-3 pb-3">
              <ChatBox
                messages={messages}
                onNewMessage={handleNewMessage}
                documentId={documentId}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upload success modal + floating widget (unchanged behavior, new theme) */}
      <AnimatePresence>
        {uploadStatusMode === "modal" && (
          <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div
              layoutId="upload-status"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative rounded-2xl border border-indigo-400/30 bg-slate-900/90 px-6 py-5 shadow-[0_0_50px_rgba(99,102,241,0.35)] backdrop-blur-xl"
            >
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-xl" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-xl">
                  🎉
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    PDF Uploaded &amp; Indexed Successfully!
                  </h2>
                  {lastUploadedFilename && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="text-indigo-300">📄</span>
                      <span className="max-w-[200px] truncate">{lastUploadedFilename}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {uploadStatusMode === "widget" && (
          <div className="pointer-events-none fixed right-3 top-3 z-40 md:right-6 md:top-6">
            <motion.div
              layoutId="upload-status"
              initial={{ opacity: 0, y: -12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-slate-900/95 px-3 py-2 shadow-[0_0_30px_rgba(99,102,241,0.4)] backdrop-blur-xl"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-sm text-indigo-300">
                ✅
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-indigo-200">PDF Ready</span>
                {lastUploadedFilename && (
                  <span className="max-w-[140px] truncate text-[10px] text-slate-400">
                    {lastUploadedFilename}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;
