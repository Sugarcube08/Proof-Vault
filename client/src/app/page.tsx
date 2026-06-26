"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import Uploader from "@/components/Uploader";
import Hero from "@/components/Hero";
import StatsCards from "@/components/StatsCards";
import Timeline from "@/components/Timeline";
import Features from "@/components/Features";
import { useWallet } from "@/context/WalletContext";
import { buildRegisterProofTx, getRpcServer, getNetworkPassphrase, checkProofExists } from "@/lib/stellar";
import { Transaction } from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { ShieldCheck, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

export default function Home() {
  const { address, connected, connect } = useWallet();
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);

  // Scroll Ref
  const uploaderSectionRef = useRef<HTMLDivElement>(null);

  // Registration states
  const [txStep, setTxStep] = useState<"idle" | "preparing" | "signing" | "submitting" | "confirming" | "success" | "error">("idle");
  const [txError, setTxError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleHashComputed = (hash: string, name: string, size: number) => {
    setFileHash(hash);
    setFileName(name);
    setFileSize(size);
    setTxStep("idle");
    setTxError(null);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#3b82f6", "#10b981", "#a855f7"],
    });
  };

  const handleScrollToUploader = () => {
    uploaderSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleRegister = async () => {
    if (!connected || !address || !fileHash) return;

    try {
      setTxError(null);
      
      // Step 1: Preparing Transaction
      setTxStep("preparing");

      // Precheck if proof already exists on-chain to avoid duplicate simulation traps
      const exists = await checkProofExists(fileHash);
      if (exists) {
        throw new Error("This file proof has already been registered on the Stellar network.");
      }
      
      const xdrPayload = await buildRegisterProofTx(address, fileHash);
      
      // Step 2: Requesting User Signature
      setTxStep("signing");
      const passphrase = getNetworkPassphrase();
      const signedXdr = await signTransaction(xdrPayload, {
        networkPassphrase: passphrase,
      });

      if (!signedXdr) {
        throw new Error("Freighter wallet rejected the transaction or signature failed.");
      }

      // Step 3: Submitting to Network
      setTxStep("submitting");
      const server = getRpcServer();
      
      const tx = new Transaction(signedXdr.signedTxXdr, passphrase);
      const txResponse = await server.sendTransaction(tx);
      
      if (txResponse.status === "ERROR") {
        console.error("RPC Send Error:", txResponse);
        throw new Error(`Transaction submission failed: ${txResponse.errorResult || "Unknown Error"}`);
      }

      setTxHash(txResponse.hash);

      // Step 4: Waiting for Ledger confirmation
      setTxStep("confirming");
      
      let getTxResponse = await server.getTransaction(txResponse.hash);
      let attempts = 0;
      
      while (
        getTxResponse.status === "NOT_FOUND" &&
        attempts < 20
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        getTxResponse = await server.getTransaction(txResponse.hash);
        attempts++;
      }

      if (getTxResponse.status === "SUCCESS") {
        // Step 5: Save record in local database for user dashboard indexing
        await fetch("/api/proofs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet: address,
            hash: fileHash,
          }),
        });

        setTxStep("success");
        triggerConfetti();
      } else {
        throw new Error(`Transaction execution failed with status: ${getTxResponse.status}`);
      }

    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during proof registration.";
      setTxError(errMsg);
      setTxStep("error");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-black text-white selection:bg-indigo-500/30">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start px-6 py-12">
        {/* Hero Section */}
        <Hero onRegisterClick={handleScrollToUploader} />

        {/* Stats Cards Section */}
        <StatsCards walletAddress={address} />

        {/* Action Panel - Drag & Drop Uploader */}
        <div 
          ref={uploaderSectionRef}
          className="w-full max-w-xl mx-auto mb-20 scroll-mt-24"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Register Proof</h2>
            <p className="text-zinc-500 text-xs mt-1">
              Select any file to generate its cryptographic fingerprint locally.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <Uploader 
              onHashComputed={handleHashComputed} 
              isLoading={txStep !== "idle" && txStep !== "success" && txStep !== "error"} 
            />

            {/* Registration Box */}
            {fileHash && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full rounded-xl border border-zinc-900 bg-zinc-950/60 backdrop-blur-md p-6 shadow-xl"
              >
                {txStep === "idle" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5 text-left border-b border-zinc-900 pb-4">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Document Details</span>
                      <span className="text-sm font-semibold text-zinc-300 truncate" title={fileName}>
                        Name: {fileName}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Size: {Math.round(fileSize / 1024)} KB
                      </span>
                      <span className="text-[10px] font-mono text-zinc-600 truncate mt-2 bg-black/40 p-2 rounded border border-zinc-900">
                        SHA-256: {fileHash}
                      </span>
                    </div>
                    
                    {connected ? (
                      <button
                        onClick={handleRegister}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-650 hover:bg-indigo-500 py-3 text-sm font-semibold text-white transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                      >
                        <span>Register Proof on Stellar</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={connect}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 py-3 text-sm font-semibold text-white transition-all cursor-pointer"
                      >
                        <span>Connect Wallet to Register</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Transaction Progress Loader */}
                {txStep !== "idle" && txStep !== "success" && txStep !== "error" && (
                  <div className="flex flex-col items-center py-6 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
                    <h4 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-2">
                      {txStep === "preparing" && "Preparing contract call..."}
                      {txStep === "signing" && "Awaiting Wallet Signature..."}
                      {txStep === "submitting" && "Broadcasting to Stellar..."}
                      {txStep === "confirming" && "Confirming on Ledger..."}
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                      {txStep === "preparing" && "Simulating transaction on Soroban RPC to build footprints..."}
                      {txStep === "signing" && "Please approve the transaction request in your Freighter popup."}
                      {txStep === "submitting" && "Sending transaction XDR payload to Stellar RPC nodes..."}
                      {txStep === "confirming" && `Tx: ${txHash?.slice(0, 8)}...${txHash?.slice(-8)}. Waiting for next ledger closure.`}
                    </p>
                  </div>
                )}

                {/* Success Result */}
                {txStep === "success" && (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="rounded-full bg-emerald-500/10 border border-emerald-500/30 p-3 text-emerald-400 mb-4 shadow-inner">
                      <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-2">Proof Registered Successfully</h4>
                    <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
                      Your file&apos;s SHA-256 hash is permanently timestamped on the Stellar network.
                      You can view the transaction record or verify the file anytime on the Verify page.
                    </p>
                    
                    <div className="flex gap-4 w-full">
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 py-2.5 text-xs font-semibold text-zinc-300 transition-colors"
                      >
                        View on Explorer
                      </a>
                      <Link
                        href="/verify"
                        className="flex-1 text-center rounded-lg bg-indigo-650 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white transition-colors"
                      >
                        Go to Verification
                      </Link>
                    </div>
                  </div>
                )}

                {/* Error Box */}
                {txStep === "error" && (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="rounded-full bg-red-500/10 border border-red-500/30 p-3 text-red-400 mb-4 shadow-inner">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <h4 className="text-sm font-bold text-red-400 mb-2">Registration Failed</h4>
                    <p className="text-xs text-zinc-500 max-w-xs mb-6 leading-relaxed">{txError}</p>
                    <button
                      onClick={() => setTxStep("idle")}
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 py-2.5 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
                    >
                      Retry Registration
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Timeline Section */}
        <Timeline />

        {/* Detailed Features Grid */}
        <Features />
      </main>

      <Footer />
    </div>
  );
}
