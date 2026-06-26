"use client";

import React, { useState } from "react";
import Uploader from "./Uploader";
import { Search } from "lucide-react";

interface VerifyUploaderProps {
  onHashComputed: (hash: string) => void;
  onVerifyHash: (hash: string) => void;
}

export default function VerifyUploader({
  onHashComputed,
  onVerifyHash,
}: VerifyUploaderProps) {
  const [inputHash, setInputHash] = useState("");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputHash.trim()) {
      onVerifyHash(inputHash.trim());
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-6">
      {/* Local File Hash Computation */}
      <Uploader onHashComputed={onHashComputed} />

      {/* Or Divider */}
      <div className="flex items-center justify-center w-full gap-4 text-[10px] font-bold text-zinc-650 uppercase tracking-widest">
        <div className="h-px bg-zinc-900 flex-1" />
        <span>OR</span>
        <div className="h-px bg-zinc-900 flex-1" />
      </div>

      {/* Paste Hash Form */}
      <form onSubmit={handleFormSubmit} className="w-full flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Enter SHA-256 Hash manually..."
            value={inputHash}
            onChange={(e) => setInputHash(e.target.value)}
            className="w-full rounded-lg border border-zinc-900 bg-zinc-950/60 py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:border-indigo-500/50 focus:outline-none focus:bg-zinc-950 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-650 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors cursor-pointer"
        >
          Verify Hash
        </button>
      </form>
    </div>
  );
}
