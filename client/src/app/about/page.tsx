"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import FAQ from "@/components/FAQ";
import { Fingerprint, Award, CheckCircle, Database, Shield, ShieldAlert, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const specs = [
    {
      icon: <Fingerprint className="h-6 w-6 text-indigo-400" />,
      title: "Client-Side Cryptographic Hashing",
      description:
        "Your document never leaves your machine. ProofVault generates a unique 256-bit signature (SHA-256 hash) entirely within the browser sandbox, verifying existence without leaking information.",
    },
    {
      icon: <Database className="h-6 w-6 text-indigo-400" />,
      title: "Soroban Smart Contract Storage",
      description:
        "The generated hash is sent via your Freighter wallet signature to our Soroban contract on the Stellar ledger, permanently registering it under your identity.",
    },
    {
      icon: <Award className="h-6 w-6 text-indigo-400" />,
      title: "Immutable Timestamping",
      description:
        "Stellar block timestamps create an indisputable and unalterable proof of when the document was registered.",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-black text-white">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start px-6 py-20">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs text-indigo-300 mb-6 backdrop-blur">
              <Shield className="h-3.5 w-3.5" />
              <span>Security Protocols</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none mb-6">
              Platform Architecture
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed">
              ProofVault leverages Stellar&apos;s Soroban smart contract framework to provide decentralized proof of existence,
              enabling users to prove document ownership at a point in time with absolute privacy.
            </p>
          </div>

          {/* Workflow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {specs.map((spec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col gap-4 text-left hover:border-zinc-800 transition-colors"
              >
                <div className="rounded-lg bg-zinc-900 border border-zinc-805 p-3 w-fit shadow-inner">
                  {spec.icon}
                </div>
                <h3 className="text-base font-bold text-zinc-200">{spec.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{spec.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Detailed Explanations */}
          <div className="space-y-12 mb-16 text-left">
            {/* Section 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-zinc-900 pt-10">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight mb-3 flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-indigo-400" />
                  <span>How Hashing Works & Why SHA-256</span>
                </h2>
                <p className="text-zinc-500 text-xs leading-relaxed mb-3">
                  A cryptographic hash is a one-way mathematical function that maps data of any size to a fixed-size bit string. At ProofVault, we compute the SHA-256 (Secure Hash Algorithm 256-bit) digest of your documents locally in your browser.
                </p>
                <p className="text-zinc-550 text-xs leading-relaxed">
                  This algorithm guarantees that even a single byte change in the file yields a completely different hash. This is called the 'avalanche effect'. Because it is collision-resistant and one-way, it acts as an absolute, tamper-evident digital fingerprint.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-6 text-xs text-zinc-500">
                <span className="font-bold text-zinc-350 block mb-2 font-mono">SHA-256 E.G. Output:</span>
                <code className="block bg-black/60 p-3 rounded font-mono text-indigo-300 border border-zinc-900 break-all select-all">
                  e1271b428d441ada3a660ef4bf2a8e9662d7f66692d9842fadc1a055ff71bf53
                </code>
                <span className="block mt-3 text-[11px] leading-relaxed">
                  No matter the file format (PDF, PNG, ZIP, TXT) or file size, the output is always an anonymous 64-character hexadecimal signature.
                </span>
              </div>
            </div>

            {/* Section 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-zinc-900 pt-10">
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-6 text-xs text-zinc-500 md:order-last">
                <span className="font-bold text-zinc-350 block mb-2 flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-indigo-400" />
                  <span>Stellar & Soroban Properties</span>
                </span>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong className="text-zinc-400">Decentralization:</strong> Verified across a global validator node network.</li>
                  <li><strong className="text-zinc-400">Low Cost:</strong> Transaction fees remain fractions of a cent.</li>
                  <li><strong className="text-zinc-400">High Speed:</strong> 5-second ledger settlement confirmations.</li>
                  <li><strong className="text-zinc-400">Rust Core:</strong> Secure contract isolation engine.</li>
                </ul>
              </div>
              <div className="md:order-first">
                <h2 className="text-lg font-bold text-white tracking-tight mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-400" />
                  <span>What Soroban & Stellar Provide</span>
                </h2>
                <p className="text-zinc-500 text-xs leading-relaxed mb-3">
                  Stellar is a decentralized, open-source blockchain network built for speed and low cost. Soroban is Stellar&apos;s native smart contract framework designed to run WebAssembly (WASM) bytecode with state isolation.
                </p>
                <p className="text-zinc-550 text-xs leading-relaxed">
                  By utilizing Soroban, ProofVault establishes a trustless audit trail. Your wallet signature authorizes the Rust-based smart contract to write the fingerprint permanently into the ledger state registry, locking in the timestamp forever.
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="border-t border-zinc-900 pt-10">
              <h2 className="text-lg font-bold text-white tracking-tight mb-3 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-indigo-400" />
                <span>Proof of Existence Limitations</span>
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed mb-3">
                It is important to understand what Proof of Existence actually achieves:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
                <div className="rounded-lg bg-zinc-950/40 p-4 border border-zinc-900">
                  <span className="font-semibold text-zinc-300 text-xs block mb-1">Prove Possession</span>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Proves that you held the exact file on your machine at the time of ledger registration.
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-950/40 p-4 border border-zinc-900">
                  <span className="font-semibold text-zinc-300 text-xs block mb-1">Does Not Verify File Authorship</span>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    It cannot prove who created the contents of the file, only that the registrant possessed it first.
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-950/40 p-4 border border-zinc-900">
                  <span className="font-semibold text-zinc-300 text-xs block mb-1">Requires exact file matching</span>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Even changing a single dot or space in the file generates a completely different hash and fails verification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <FAQ />
        </div>
      </main>

      <Footer />
    </div>
  );
}
