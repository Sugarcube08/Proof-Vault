"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, FileSearch, Sparkles } from "lucide-react";

interface HeroProps {
  onRegisterClick: () => void;
}

export default function Hero({ onRegisterClick }: HeroProps) {
  return (
    <div className="relative text-center mb-16 max-w-4xl mx-auto flex flex-col items-center">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs text-indigo-300 mb-6 backdrop-blur"
      >
        <Sparkles className="h-3 w-3" />
        <span>Stellar Soroban Protocol v25</span>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none mb-6 max-w-3xl"
      >
        Prove Existence. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-500 drop-shadow-sm">
          Preserve Privacy.
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-zinc-400 text-lg leading-relaxed max-w-2xl mb-8"
      >
        Timestamp any file permanently on Stellar. Establish absolute proof of document ownership, integrity, and creation date without exposing raw file content.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 mb-16"
      >
        <button
          onClick={onRegisterClick}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Register Document Proof</span>
        </button>
        <Link
          href="/verify"
          className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-300 hover:text-white transition-all backdrop-blur"
        >
          <FileSearch className="h-4 w-4" />
          <span>Verify Existing Proof</span>
        </Link>
      </motion.div>
    </div>
  );
}
