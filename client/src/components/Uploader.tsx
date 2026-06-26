"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, AlertCircle, Hash, Loader2 } from "lucide-react";

interface UploaderProps {
  onHashComputed: (hash: string, fileName: string, fileSize: number) => void;
  isLoading?: boolean;
}

export default function Uploader({ onHashComputed, isLoading = false }: UploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    if (isLoading) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const computeSHA256 = async (selectedFile: File) => {
    setIsHashing(true);
    setError(null);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      
      setHash(hashHex);
      onHashComputed(hashHex, selectedFile.name, selectedFile.size);
    } catch (err) {
      console.error(err);
      setError("Failed to compute SHA-256 hash. Please try another file.");
    } finally {
      setIsHashing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (isLoading) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      await computeSHA256(selectedFile);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      await computeSHA256(selectedFile);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const resetUploader = () => {
    setFile(null);
    setHash(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="w-full max-w-xl">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!file && !isLoading ? onButtonClick : undefined}
        className={`relative flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-all duration-300 ${
          file ? "cursor-default" : "cursor-pointer"
        } ${
          isDragActive
            ? "border-indigo-500 bg-indigo-500/5"
            : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/40"
        }`}
      >
        <AnimatePresence mode="wait">
          {!file && !isHashing && (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <div className="mb-4 rounded-full bg-zinc-900 p-4 border border-zinc-800">
                <UploadCloud className="h-8 w-8 text-zinc-400" />
              </div>
              <p className="mb-1 text-sm font-medium text-zinc-200">
                Drag and drop your file, or <span className="text-indigo-400">browse</span>
              </p>
              <p className="text-xs text-zinc-500">
                Any file type. Computation happens locally in your browser.
              </p>
            </motion.div>
          )}

          {isHashing && (
            <motion.div
              key="hashing-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-4"
            >
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-indigo-400" />
              <p className="text-sm font-medium text-zinc-300">Generating SHA-256 hash locally...</p>
            </motion.div>
          )}

          {file && hash && !isHashing && (
            <motion.div
              key="file-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col"
            >
              <div className="flex items-start gap-4 rounded-lg bg-zinc-900/60 p-4 border border-zinc-800 text-left mb-4">
                <div className="rounded bg-indigo-950/50 p-2 text-indigo-400 border border-indigo-900">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{file.name}</p>
                  <p className="text-xs text-zinc-500">{formatBytes(file.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetUploader();
                  }}
                  className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="rounded-lg bg-zinc-950 border border-zinc-900 p-4 text-left">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2 font-medium">
                  <Hash className="h-3 w-3 text-indigo-400" />
                  <span>COMPUTED SHA-256 HASH (READ-ONLY)</span>
                </div>
                <p className="font-mono text-xs text-zinc-300 break-all select-all selection:bg-indigo-500/20">
                  {hash}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-950/20 border border-red-900/50 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
