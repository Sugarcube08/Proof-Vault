"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import VerifyUploader from "@/components/VerifyUploader";
import ProofResult from "@/components/ProofResult";
import { verifyProof, checkProofExists } from "@/lib/stellar";
import { FileSearch, Loader2 } from "lucide-react";

interface ProofDetails {
  owner: string;
  hash: string;
  timestamp: number;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const queryHash = searchParams.get("hash");

  const [loadingStatus, setLoadingStatus] = useState<"idle" | "searching" | "verified" | "not_found">("idle");
  const [proof, setProof] = useState<ProofDetails | null>(null);

  const handleVerify = useCallback(async (hashToVerify: string) => {
    const cleanHash = hashToVerify.replace(/^0x/, "").trim();
    if (cleanHash.length !== 64) {
      alert("Hash must be exactly 64 characters (SHA-256)");
      return;
    }

    setLoadingStatus("searching");
    setProof(null);

    try {
      // Pre-check if proof exists on-chain to avoid throwing VM traps on non-existent proofs
      const exists = await checkProofExists(cleanHash);
      if (!exists) {
        setProof({ owner: "", hash: cleanHash, timestamp: 0 });
        setLoadingStatus("not_found");
        return;
      }

      const proofResult = await verifyProof(cleanHash);
      if (proofResult) {
        setProof(proofResult);
        setLoadingStatus("verified");
      } else {
        setProof({ owner: "", hash: cleanHash, timestamp: 0 });
        setLoadingStatus("not_found");
      }
    } catch (error) {
      console.error(error);
      setProof({ owner: "", hash: cleanHash, timestamp: 0 });
      setLoadingStatus("not_found");
    }
  }, []);

  useEffect(() => {
    if (queryHash) {
      setTimeout(() => {
        handleVerify(queryHash);
      }, 0);
    }
  }, [queryHash, handleVerify]);

  const handleReset = () => {
    setLoadingStatus("idle");
    setProof(null);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-black text-white">
      {/* Header */}
      <div className="text-center mb-12 max-w-xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs text-indigo-300 mb-6 backdrop-blur">
          <FileSearch className="h-3.5 w-3.5" />
          <span>On-Chain Verification System</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
          Verify Document Proof
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Verify digital files locally or search on-chain by entering a SHA-256 hash to query the Stellar Soroban network registry.
        </p>
      </div>

      {/* Verification Options Container */}
      <div className="w-full flex flex-col items-center gap-8">
        {loadingStatus === "idle" ? (
          <VerifyUploader
            onHashComputed={handleVerify}
            onVerifyHash={handleVerify}
          />
        ) : (
          <ProofResult
            status={loadingStatus}
            proof={proof}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  );
}

export default function Verify() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-black">
      <AnimatedBackground />
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center bg-black">
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
