"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import CertificatesGrid from "@/components/CertificatesGrid";
import { useWallet } from "@/context/WalletContext";
import { Shield, Wallet, Lock, Award } from "lucide-react";
import { motion } from "framer-motion";

interface DatabaseProof {
  id: string;
  wallet: string;
  hash: string;
  createdAt: string;
}

export default function Certificates() {
  const { address, connected, connect } = useWallet();

  const [proofs, setProofs] = useState<DatabaseProof[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProofs = async () => {
      setLoading(true);
      try {
        // Fetch user proofs (limit up to 100 for the certificates directory)
        const url = `/api/proofs?wallet=${address}&page=1&limit=100`;
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
          setProofs(data.proofs || []);
        }
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    if (connected && address) {
      fetchProofs();
    }
  }, [connected, address]);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-black text-white">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start px-6 py-20">
        <div className="w-full max-w-5xl">
          {!connected ? (
            /* Locked State */
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <div className="rounded-full bg-zinc-950 border border-zinc-800 p-5 text-zinc-400 mb-6 shadow-inner">
                <Lock className="h-10 w-10 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                Authentication Required
              </h1>
              <p className="text-zinc-500 text-sm max-w-sm mb-6 leading-relaxed">
                Please connect your Freighter wallet to view and manage your generated proof certificates.
              </p>
              <button
                onClick={connect}
                className="flex items-center gap-2 rounded-lg bg-indigo-650 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors cursor-pointer shadow-md shadow-indigo-600/10"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Freighter Wallet</span>
              </button>
            </motion.div>
          ) : (
            /* Authenticated Certificates view */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Your Certificates</h1>
                  <p className="text-zinc-500 text-sm">
                    View, share, and download PDF certificates for your registered document signatures.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-2 text-xs text-zinc-400 self-start shadow-sm">
                  <Award className="h-4 w-4 text-indigo-400" />
                  <span className="font-mono text-zinc-300">
                    {proofs.length} Generated
                  </span>
                </div>
              </div>

              {/* Grid Section */}
              <div className="space-y-4">
                <CertificatesGrid
                  proofs={proofs}
                  loading={loading}
                  walletAddress={address}
                />
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
