import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import MessageBubble from "./MessageBubble.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function ChatBox({ messages, onNewMessage, documentId, isLoading, setIsLoading }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!documentId) {
      setError("Please upload a PDF before asking questions.");
      return;
    }
    setError("");
    const userMessage = { id: `${Date.now()}-user`, role: "user", content: trimmed };
    setIsLoading(true);
    setInput("");

    try {
      const response = await axios.post(`${API_BASE_URL}/ask-question`, {
        question: trimmed,
        documentId
      });
      const data = response.data;
      const aiMessage = {
        id: `${Date.now()}-ai`,
        role: "assistant",
        content: data.answer,
        source: data.source || null
      };
      if (onNewMessage) onNewMessage(userMessage, aiMessage);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Something went wrong while generating the answer.";
      setError(message);
      const aiMessage = {
        id: `${Date.now()}-ai-error`,
        role: "assistant",
        content: "I was unable to answer that question due to an error.",
        source: null
      };
      if (onNewMessage) onNewMessage(userMessage, aiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/5 bg-slate-950/30 backdrop-blur-sm">
      <div className="flex-1 space-y-3 overflow-y-auto p-3 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex h-full min-h-[140px] items-center justify-center text-center">
            <div className="max-w-[280px]">
              <p className="text-sm font-medium text-slate-300">
                Upload a PDF, then ask questions about it.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Answers are generated strictly from your document.
              </p>
            </div>
          </div>
        )}
        {messages.map((message, i) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
          >
            <MessageBubble
              role={message.role}
              content={message.content}
              source={message.source}
            />
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full justify-start gap-2"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs text-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.4)]">
              AI
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-indigo-500/20 bg-slate-800/60 px-3 py-2 text-xs text-slate-200 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" />
              </span>
              <span>Thinking…</span>
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 p-3 pt-0">
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-2 py-2 shadow-inner backdrop-blur-md focus-within:border-indigo-400/40 focus-within:shadow-[0_0_24px_rgba(99,102,241,0.15)]">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              documentId
                ? "Ask about your PDF…"
                : "Upload a PDF first…"
            }
            className="min-h-[40px] flex-1 resize-none rounded-xl border-0 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] transition hover:from-indigo-400 hover:to-violet-400 disabled:opacity-40 disabled:shadow-none"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
      </form>
    </section>
  );
}

export default ChatBox;
