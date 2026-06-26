"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import Uploader from "@/components/Uploader";
import ProofCard from "@/components/ProofCard";
import { verifyProof } from "@/lib/stellar";
import { Search, Loader2, FileSearch } from "lucide-react";

interface ProofDetails {
  owner: string;
  hash: string;
  timestamp: number;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const queryHash = searchParams.get("hash");

  const [inputHash, setInputHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "verified" | "not_found">("idle");
  const [proof, setProof] = useState<ProofDetails | null>(null);

  useEffect(() => {
    if (queryHash) {
      setInputHash(queryHash);
      handleVerify(queryHash);
    }
  }, [queryHash]);

  const handleVerify = async (hashToVerify: string) => {
    const cleanHash = hashToVerify.replace(/^0x/, "").trim();
    if (cleanHash.length !== 64) {
      alert("Hash must be exactly 64 characters (SHA-256)");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setProof(null);

    try {
      const proofResult = await verifyProof(cleanHash);
      if (proofResult) {
        setProof(proofResult);
        setStatus("verified");
      } else {
        setStatus("not_found");
      }
    } catch (error) {
      console.error(error);
      setStatus("not_found");
    } finally {
      setLoading(false);
    }
  };

  const handleHashComputed = (hash: string) => {
    setInputHash(hash);
    handleVerify(hash);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(inputHash);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
      {/* Header */}
      <div className="text-center mb-12 max-w-xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs text-indigo-300 mb-6 backdrop-blur">
          <FileSearch className="h-3 w-3" />
          <span>On-Chain Verification System</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
          Verify Digital Proof
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Upload the original file to compute its hash, or enter the SHA-256 hash string directly to query the Stellar Soroban network.
        </p>
      </div>

      {/* Verification Options Container */}
      <div className="w-full flex flex-col items-center gap-8">
        {status === "idle" && !loading && (
          <div className="w-full max-w-xl flex flex-col items-center gap-6">
            {/* Uploader */}
            <Uploader onHashComputed={handleHashComputed} />

            <div className="flex items-center justify-center w-full gap-4 text-xs font-semibold text-zinc-600 uppercase">
              <div className="h-px bg-zinc-900 flex-1" />
              <span>OR</span>
              <div className="h-px bg-zinc-900 flex-1" />
            </div>

            {/* Paste Hash Form */}
            <form onSubmit={handleFormSubmit} className="w-full flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Enter SHA-256 Hash..."
                  value={inputHash}
                  onChange={(e) => setInputHash(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                Verify Hash
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
            <p className="text-sm font-medium text-zinc-300">Searching Ledger Records...</p>
          </div>
        )}

        {/* Verification Results Card */}
        <ProofCard
          status={status}
          proof={proof}
          onReset={() => {
            setStatus("idle");
            setProof(null);
            setInputHash("");
          }}
        />
      </div>
    </main>
  );
}

export default function Verify() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      <AnimatedBackground />
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
      <Footer />
    </div>
  );
}
