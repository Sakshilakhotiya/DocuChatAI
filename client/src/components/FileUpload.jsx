import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

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
    setIsDragging(true);
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
        headers: { "Content-Type": "multipart/form-data" }
      });
      const payload = response.data;
      if (onUploaded) {
        onUploaded({ documentId: payload.documentId, filename: selectedFile.name });
      }
      setSelectedFile(null);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to upload PDF. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const isDisabled = isUploading || disabled;

  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-sm"
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`rounded-xl border-2 border-dashed px-3 py-3 transition ${
          isDragging
            ? "border-indigo-400/60 bg-indigo-500/10 shadow-[0_0_24px_rgba(99,102,241,0.25)]"
            : "border-white/15 bg-slate-800/30 hover:border-indigo-400/40"
        }`}
      >
        <form onSubmit={handleUpload} className="flex flex-col gap-3">
          <label htmlFor="pdf-upload" className="flex cursor-pointer flex-col items-center gap-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-xl shadow-[0_0_16px_rgba(99,102,241,0.2)]">
              📄
            </div>
            <span className="text-center text-xs font-medium text-slate-200">
              Drag & drop PDF or <span className="text-indigo-300">browse</span>
            </span>
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={isDisabled}
            />
            {selectedFile && (
              <div className="mt-1 flex w-full items-center gap-2 rounded-lg bg-slate-800/80 px-2 py-1.5 text-[11px]">
                <span className="text-indigo-300">📄</span>
                <span className="truncate text-slate-200">{selectedFile.name}</span>
              </div>
            )}
          </label>
          <button
            type="submit"
            disabled={!selectedFile || isDisabled}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] transition hover:from-indigo-400 hover:to-violet-400 disabled:opacity-40 disabled:shadow-none"
          >
            {isUploading ? "Uploading…" : "Upload & index PDF"}
          </button>
        </form>
      </div>
      {error && <p className="mt-2 text-center text-[11px] text-red-400">{error}</p>}
    </motion.section>
  );
}

export default FileUpload;
