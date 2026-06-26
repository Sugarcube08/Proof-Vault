"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "Can someone steal my file from ProofVault?",
      answer: "No. ProofVault is designed as a trustless, zero-knowledge platform. Your original files are never uploaded to any server, database, or blockchain. Hashing occurs entirely within your browser's local sandbox, creating a 32-byte cryptographic fingerprint (SHA-256). It is mathematically impossible for anyone to reverse-engineer or reconstruct your original file from this hash.",
    },
    {
      question: "Does registering a proof establish legal copyright?",
      answer: "While it does not substitute for official government copyright registration, it provides indisputable 'prior art' or 'proof of possession' evidence. It establishes mathematically that you were in possession of the exact, unaltered document at the recorded Stellar block timestamp. This immutable timeline serves as strong evidence in intellectual property, authorship, or trade secret disputes.",
    },
    {
      question: "Can I delete or modify my registered proofs?",
      answer: "No. Because ProofVault records document signatures on the Stellar public blockchain via decentralized Soroban smart contracts, the registry is permanent, immutable, and censorship-resistant. Once confirmed by network validators, a proof cannot be removed, altered, or revoked by anyone—including the creators of ProofVault.",
    },
    {
      question: "Is it safe to timestamp confidential or private documents?",
      answer: "Absolutely. In fact, ProofVault is optimized specifically for private and proprietary assets. Because the file processing happens entirely client-side, the network only ever sees the anonymous 32-byte hash. You can safely timestamp confidential legal contracts, source code, research drafts, and financial files without exposing any sensitive information to the public.",
    },
  ];

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs text-indigo-300 mb-4 backdrop-blur">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Got Questions?</h2>
        <p className="text-zinc-500 text-xs mt-2">
          Everything you need to know about digital timestamping and blockchain security.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-zinc-900 bg-zinc-950/20 overflow-hidden transition-colors hover:border-zinc-800"
            >
              <button
                onClick={() => handleToggle(idx)}
                className="flex w-full items-center justify-between p-6 text-left focus:outline-none cursor-pointer"
              >
                <span className="text-sm font-semibold text-zinc-200 hover:text-white transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-500 transition-transform duration-300 shrink-0 ml-4 ${
                    isOpen ? "rotate-180 text-indigo-400" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-xs text-zinc-500 leading-relaxed border-t border-zinc-900 pt-4 bg-zinc-950/40">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
