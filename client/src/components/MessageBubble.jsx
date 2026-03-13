function MessageBubble({ role, content, source }) {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/12 text-sm text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.75)]">
          AI
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl border px-3 py-2 text-sm shadow-[0_14px_40px_rgba(15,23,42,0.9)] backdrop-blur-xl ${
          isUser
            ? "rounded-br-md border-emerald-400/40 bg-emerald-500/90 text-slate-950"
            : "rounded-bl-md border-slate-700/70 bg-slate-900/80 text-slate-100"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        {source && (
          <div className="mt-2 rounded-xl border border-slate-700/70 bg-slate-950/85 px-2 py-1 text-[11px] text-slate-300">
            <div className="mb-0.5 flex items-center gap-2 text-emerald-300">
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/10 text-[9px]">
                🔍
              </span>
              <span className="font-semibold">
                Source snippet
                {typeof source.page === "number" ? ` · page ${source.page}` : ""}
              </span>
            </div>
            <p className="line-clamp-4 text-slate-300/90">{source.text}</p>
          </div>
        )}
      </div>
      {isUser && (
        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm text-slate-100 shadow-[0_0_16px_rgba(15,23,42,0.9)]">
          You
        </div>
      )}
    </div>
  );
}

export default MessageBubble;

