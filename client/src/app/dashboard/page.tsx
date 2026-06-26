"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import DashboardTable from "@/components/DashboardTable";
import MetricsCards from "@/components/MetricsCards";
import { useWallet } from "@/context/WalletContext";
import { getProofsByOwner } from "@/lib/stellar";
import { Shield, Wallet, Lock } from "lucide-react";

interface DatabaseProof {
  id: string;
  wallet: string;
  hash: string;
  createdAt: string;
}

export default function Dashboard() {
  const { address, connected, connect } = useWallet();

  const [allProofs, setAllProofs] = useState<DatabaseProof[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  // Fetch proofs from Soroban contract on mount / when wallet changes
  useEffect(() => {
    if (connected && address) {
      fetchFromContract();
    } else {
      setAllProofs([]);
    }
  }, [connected, address]);

  const fetchFromContract = async () => {
    setLoading(true);
    try {
      const contractProofs = await getProofsByOwner(address!);
      const mapped: DatabaseProof[] = contractProofs.map((p) => ({
        id: p.hash,
        wallet: p.owner,
        hash: p.hash,
        createdAt: new Date(p.timestamp * 1000).toISOString(),
      }));
      setAllProofs(mapped);
    } catch (error) {
      console.error("Error fetching proofs from Soroban contract:", error);
      setAllProofs([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side search filter
  const filteredProofs = useMemo(() => {
    if (!search) return allProofs;
    const q = search.toLowerCase();
    return allProofs.filter((p) => p.hash.toLowerCase().includes(q));
  }, [allProofs, search]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filteredProofs.length / limit));
  const total = filteredProofs.length;
  const paginatedProofs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredProofs.slice(start, start + limit);
  }, [filteredProofs, page, limit]);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // reset to first page on search
  }, []);

  // Reset page when filters change
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredProofs.length / limit));
    if (page > maxPage) setPage(maxPage);
  }, [filteredProofs.length, page, limit]);

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
                Please connect your Freighter wallet to view and manage your registered document proofs.
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
            /* Authenticated Dashboard */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Your Dashboard</h1>
                  <p className="text-zinc-500 text-sm">
                    Manage and inspect proofs registered from your connected address.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-2 text-xs text-zinc-400 self-start shadow-sm">
                  <Shield className="h-4 w-4 text-indigo-400" />
                  <span className="font-mono text-zinc-300">
                    {address?.slice(0, 10)}...{address?.slice(-10)}
                  </span>
                </div>
              </div>

              {/* Metrics Section */}
              <MetricsCards
                proofs={allProofs}
                total={allProofs.length}
                loading={loading}
                walletAddress={address}
              />

              {/* Table Section */}
              <div className="space-y-4">
                <div className="text-left">
                  <h2 className="text-lg font-bold text-zinc-200">Registered Fingerprints</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Filter, search, or inspect your immutable ledger entries.</p>
                </div>
                <DashboardTable
                  proofs={paginatedProofs}
                  loading={loading}
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  onPageChange={setPage}
                  onSearchChange={handleSearchChange}
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
