function MessageBubble({ role, content, source }) {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-medium text-indigo-300 shadow-[0_0_14px_rgba(99,102,241,0.35)]">
          AI
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
          isUser
            ? "rounded-br-md bg-slate-100/95 text-slate-900 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
            : "rounded-bl-md border border-indigo-500/15 bg-slate-800/70 text-slate-100 shadow-[0_0_20px_rgba(99,102,241,0.12)] backdrop-blur-sm"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        {source && (
          <div className="mt-2 rounded-xl border border-white/10 bg-slate-900/60 px-2.5 py-1.5 text-[11px] text-slate-300">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-indigo-300">
              <span className="text-[9px]">🔍</span>
              Source
              {typeof source.page === "number" ? ` · p.${source.page}` : ""}
            </div>
            <p className="line-clamp-3 text-slate-400">{source.text}</p>
          </div>
        )}
      </div>
      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600/80 text-[10px] font-medium text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
          You
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
