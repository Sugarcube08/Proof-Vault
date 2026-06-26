"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Fingerprint, History, Award, CheckCircle, Database } from "lucide-react";

export default function About() {
  const steps = [
    {
      icon: <Fingerprint className="h-6 w-6 text-indigo-400" />,
      title: "Local Cryptographic Hashing",
      description:
        "Your document never leaves your machine. ProofVault generates a unique 256-bit signature (SHA-256 hash) entirely within the browser sandbox.",
    },
    {
      icon: <Database className="h-6 w-6 text-indigo-400" />,
      title: "Soroban Smart Contract Storage",
      description:
        "The generated hash is sent via your Freighter wallet signature to our Soroban contract on the Stellar ledger, permanently recording it under your identity.",
    },
    {
      icon: <History className="h-6 w-6 text-indigo-400" />,
      title: "Immutable Timestamping",
      description:
        "Stellar block timestamps create an indisputable and unalterable proof of when the document was registered.",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start px-6 py-20">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none mb-6">
              How ProofVault Works
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed">
              ProofVault leverages Stellar&apos;s Soroban smart contract framework to provide decentralized proof of existence,
              enabling users to prove document ownership at a point in time with absolute privacy.
            </p>
          </div>

          {/* Workflow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur p-6 flex flex-col gap-4 text-left hover:border-zinc-800 transition-colors"
              >
                <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3 w-fit">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-zinc-100">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Technical Section */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur p-8 text-left mb-12">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-4 flex items-center gap-2">
              <Award className="h-6 w-6 text-indigo-400" />
              <span>Technology Stack & Properties</span>
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              ProofVault is architected to guarantee security, integrity, and extreme speed. Here are the core specifications of the protocol:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-zinc-200 mb-1">Zero Knowledge Storage</h4>
                  <p className="text-zinc-500 text-xs">
                    No files, images, or documents are ever uploaded to any database or blockchain storage. Only the 32-byte cryptographic hash is saved.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-zinc-200 mb-1">Soroban Security Sandbox</h4>
                  <p className="text-zinc-500 text-xs">
                    Implemented in Rust, the smart contract prevents duplicate proof registration and emits events to allow decentralized verification.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-zinc-200 mb-1">Freighter Wallet Authentication</h4>
                  <p className="text-zinc-500 text-xs">
                    Your keypair signatures verify ownership without sharing private keys, ensuring full compliance with the Stellar ecosystem.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-zinc-200 mb-1">PostgreSQL Fast Indexer</h4>
                  <p className="text-zinc-500 text-xs">
                    A Prisma-indexed PostgreSQL database caches registered proofs per wallet, allowing lightning-fast dashboard search and filtering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
