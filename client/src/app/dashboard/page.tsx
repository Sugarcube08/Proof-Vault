"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import DashboardTable from "@/components/DashboardTable";
import { useWallet } from "@/context/WalletContext";
import { Shield, Wallet, Lock } from "lucide-react";

interface DatabaseProof {
  id: string;
  wallet: string;
  hash: string;
  createdAt: string;
}

export default function Dashboard() {
  const { address, connected, connect } = useWallet();

  const [proofs, setProofs] = useState<DatabaseProof[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (connected && address) {
      fetchProofs();
    }
  }, [connected, address, page, search]);

  const fetchProofs = async () => {
    setLoading(true);
    try {
      const url = `/api/proofs?wallet=${address}&page=${page}&limit=10&search=${search}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setProofs(data.proofs || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching dashboard proofs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // reset to first page on search
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start px-6 py-20">
        <div className="w-full max-w-5xl">
          {!connected ? (
            /* Locked State */
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="rounded-full bg-zinc-950 border border-zinc-800 p-5 text-zinc-400 mb-6">
                <Lock className="h-10 w-10 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                Authentication Required
              </h1>
              <p className="text-zinc-500 text-sm max-w-sm mb-6">
                Please connect your Freighter wallet to view and manage your registered document proofs.
              </p>
              <button
                onClick={connect}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Freighter Wallet</span>
              </button>
            </div>
          ) : (
            /* Authenticated Dashboard */
            <div>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Your Dashboard</h1>
                  <p className="text-zinc-500 text-sm">
                    Manage and inspect proofs registered from your connected address.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-xs text-zinc-400 backdrop-blur self-start">
                  <Shield className="h-4 w-4 text-indigo-400" />
                  <span className="font-mono text-zinc-300">
                    {address?.slice(0, 10)}...{address?.slice(-10)}
                  </span>
                </div>
              </div>

              {/* Table */}
              <DashboardTable
                proofs={proofs}
                loading={loading}
                page={page}
                totalPages={totalPages}
                total={total}
                onPageChange={setPage}
                onSearchChange={handleSearchChange}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
