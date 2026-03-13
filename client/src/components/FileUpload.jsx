import { useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function FileUpload({ onUploaded, disabled }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please choose a PDF file to upload.");
      return;
    }
    setError("");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(`${API_BASE_URL}/upload-pdf`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const payload = response.data;

      if (onUploaded) {
        onUploaded({
          documentId: payload.documentId,
          filename: selectedFile.name
        });
      }
      setSelectedFile(null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to upload PDF. Please try again.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const isDisabled = isUploading || disabled;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#1e293b]/80 bg-[#0b1220]/80 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 top-[-40%] h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-[-40%] h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>
      <form
        onSubmit={handleUpload}
        className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex-1">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-4 text-xs transition ${
              isDragging
                ? "border-emerald-400/80 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.45)]"
                : "border-[#1e293b] bg-slate-900/40 hover:border-emerald-400/60 hover:bg-slate-900/70"
            }`}
          >
            <label htmlFor="pdf-upload" className="flex w-full flex-col items-center gap-2">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/80 text-2xl shadow-[0_0_22px_rgba(15,23,42,0.9)]">
                📄
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-sm font-medium text-slate-100">
                  Drag &amp; drop your PDF here
                </span>
                <span className="text-[11px] text-slate-400">
                  or <span className="text-emerald-300">click to browse</span>. Only one PDF can
                  be active at a time.
                </span>
              </div>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isDisabled}
              />
              {selectedFile && (
                <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-slate-200 shadow-inner shadow-black/40">
                  <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-300">
                    Selected PDF
                  </span>
                  <span className="truncate">{selectedFile.name}</span>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 md:w-56 md:items-end">
          <button
            type="submit"
            disabled={!selectedFile || isDisabled}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_16px_45px_rgba(34,211,238,0.55)] transition hover:from-emerald-400 hover:via-emerald-300 hover:to-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:from-emerald-500/40 disabled:via-emerald-400/40 disabled:to-cyan-400/40 disabled:shadow-none"
          >
            {isUploading ? "Uploading & indexing…" : "Upload & index PDF"}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </form>
    </section>
  );
}

export default FileUpload;

