"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import Uploader from "@/components/Uploader";
import { useWallet } from "@/context/WalletContext";
import { buildRegisterProofTx, getRpcServer, getNetworkPassphrase, checkProofExists } from "@/lib/stellar";
import { Transaction } from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { ShieldCheck, Loader2, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export default function Home() {
  const { address, connected, connect } = useWallet();
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);

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
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* Hero Header */}
        <div className="text-center mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs text-indigo-300 mb-6 backdrop-blur">
            <Sparkles className="h-3 w-3" />
            <span>Built on Stellar Soroban Smart Contracts</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-none mb-6">
            Immutable Proof of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-500">
              Digital Existence
            </span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Permanently prove possession of files, documents, or research papers without exposing their content.
            All computations happen locally in your browser.
          </p>
        </div>

        {/* Action Panel */}
        <div className="w-full flex flex-col items-center gap-6">
          <Uploader onHashComputed={handleHashComputed} isLoading={txStep !== "idle" && txStep !== "success" && txStep !== "error"} />

          {/* Registration Section */}
          {fileHash && (
            <div className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950/40 backdrop-blur p-6">
              {txStep === "idle" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="truncate max-w-[220px]" title={fileName}>File: {fileName}</span>
                    <span>Size: {Math.round(fileSize / 1024)} KB</span>
                  </div>
                  
                  {connected ? (
                    <button
                      onClick={handleRegister}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-600/20"
                    >
                      <span>Register Proof on Stellar</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={connect}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 py-3 text-sm font-semibold text-white transition-all"
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
                  <p className="text-xs text-zinc-400 max-w-xs">
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
                  <div className="rounded-full bg-emerald-500/10 border border-emerald-500/30 p-3 text-emerald-400 mb-4">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-2">Proof Registered Successfully</h4>
                  <p className="text-xs text-zinc-400 max-w-md mb-6">
                    Your file&apos;s SHA-256 hash is permanently timestamped on the Stellar network.
                    You can view the transaction record or verify the file anytime on the Verify page.
                  </p>
                  
                  <div className="flex gap-4 w-full">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 py-2.5 text-xs font-semibold text-zinc-300 transition-colors"
                    >
                      View on Stellar Expert
                    </a>
                    <a
                      href="/verify"
                      className="flex-1 text-center rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white transition-colors"
                    >
                      Go to Verification
                    </a>
                  </div>
                </div>
              )}

              {/* Error Box */}
              {txStep === "error" && (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="rounded-full bg-red-500/10 border border-red-500/30 p-3 text-red-400 mb-4">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <h4 className="text-sm font-bold text-red-400 mb-2">Registration Failed</h4>
                  <p className="text-xs text-zinc-500 max-w-xs mb-6">{txError}</p>
                  <button
                    onClick={() => setTxStep("idle")}
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 py-2.5 text-xs font-semibold text-zinc-300 transition-colors"
                  >
                    Retry Registration
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
