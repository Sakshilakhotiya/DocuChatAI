import { useState } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function ChatBox({ messages, onNewMessage, documentId, isLoading, setIsLoading }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }
    if (!documentId) {
      setError("Please upload a PDF before asking questions.");
      return;
    }
    setError("");

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed
    };

    setIsLoading(true);
    setInput("");

    try {
      // Send the question and current document id to the backend.
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

      if (onNewMessage) {
        onNewMessage(userMessage, aiMessage);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while generating the answer.";
      setError(message);
      const aiMessage = {
        id: `${Date.now()}-ai-error`,
        role: "assistant",
        content: "I was unable to answer that question due to an error.",
        source: null
      };
      if (onNewMessage) {
        onNewMessage(userMessage, aiMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex h-[calc(100vh-220px)] flex-col gap-3 rounded-3xl border border-[#1e293b]/80 bg-[#020617]/80 p-3 shadow-[0_22px_80px_rgba(15,23,42,0.95)] backdrop-blur-2xl md:h-[calc(100vh-240px)] md:p-4">
      <div className="mb-1 flex items-center justify-between px-1 text-xs text-slate-400">
        <span>
          Chat grounded in{" "}
          <span className="font-semibold text-emerald-300">your PDF</span>.
        </span>
        <span className="hidden md:inline text-[11px] text-slate-500">
          Your questions and answers are not persisted on the server.
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90 p-3 scrollbar-thin scrollbar-thumb-slate-700/70 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            <div className="max-w-md text-center">
              <p className="font-medium text-slate-200">
                Upload a PDF to get started.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Ask questions like &quot;Summarize section 2&quot; or
                &quot;What are the key points about X?&quot;. Answers are generated strictly
                from the uploaded document.
              </p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            source={message.source}
          />
        ))}
        {isLoading && (
          <div className="flex w-full justify-start gap-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/12 text-sm text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.75)]">
              AI
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-700/70 bg-slate-900/95 px-3 py-2 text-xs text-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.9)]">
              <span className="flex h-2 w-10 items-center justify-between">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.05s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" />
              </span>
              <span>Thinking with your PDF…</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              documentId
                ? "Ask a question about the uploaded PDF…"
                : "Upload a PDF first, then ask a question…"
            }
            className="min-h-[52px] flex-1 resize-none rounded-2xl border border-[#1e293b] bg-slate-950/85 px-3 py-2 text-sm text-slate-100 shadow-inner shadow-black/60 outline-none ring-0 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex h-[52px] items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 px-5 text-sm font-semibold text-slate-950 shadow-[0_18px_55px_rgba(34,211,238,0.7)] transition hover:from-emerald-400 hover:via-emerald-300 hover:to-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:from-emerald-500/40 disabled:via-emerald-400/40 disabled:to-cyan-400/40 disabled:shadow-none"
          >
            Send
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>DocuChat AI only answers based on the current PDF.</span>
          {error && <span className="text-red-400">{error}</span>}
        </div>
      </form>
    </section>
  );
}

export default ChatBox;

