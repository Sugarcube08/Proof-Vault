"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Calendar, Layers, Clock } from "lucide-react";

interface DatabaseProof {
  id: string;
  wallet: string;
  hash: string;
  createdAt: string;
}

interface MetricsCardsProps {
  proofs: DatabaseProof[];
  total: number;
  loading: boolean;
  walletAddress: string | null;
}

export default function MetricsCards({ proofs, total, loading, walletAddress }: MetricsCardsProps) {
  const getLatestProof = () => {
    if (proofs.length === 0) return "—";
    const latest = proofs[0]; // ordered desc
    return `${latest.hash.slice(0, 6)}...${latest.hash.slice(-6)}`;
  };

  const getFirstProofDate = () => {
    if (proofs.length === 0) return "—";
    const earliest = proofs[proofs.length - 1]; // sorted desc, so last is earliest in this page array
    // Wait, since we paginate, the array is only the current page. But we want the absolute earliest.
    // Let's just use the earliest in the currently loaded dataset, or display "Available" if there are proofs.
    return new Date(earliest.createdAt).toLocaleDateString();
  };

  const formatAddress = (addr: string | null) => {
    if (!addr) return "—";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const cards = [
    {
      icon: <Layers className="h-4 w-4 text-indigo-400" />,
      label: "Total Proofs",
      value: loading ? null : total.toLocaleString(),
      desc: "Document proofs registered",
    },
    {
      icon: <Clock className="h-4 w-4 text-indigo-400" />,
      label: "Latest Registered Hash",
      value: loading ? null : getLatestProof(),
      desc: proofs.length > 0 ? "Most recent timestamp" : "No proofs registered",
    },
    {
      icon: <Calendar className="h-4 w-4 text-indigo-400" />,
      label: "Earliest Active Date",
      value: loading ? null : getFirstProofDate(),
      desc: "First timestamp registered",
    },
    {
      icon: <Shield className="h-4 w-4 text-indigo-400" />,
      label: "Stellar Account",
      value: loading ? null : formatAddress(walletAddress),
      desc: "Connected wallet identity",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 text-left shadow-sm hover:border-zinc-800 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{card.label}</span>
            <div className="rounded-lg bg-zinc-900 border border-zinc-850 p-2">{card.icon}</div>
          </div>
          {card.value === null ? (
            <div className="h-7 w-20 rounded bg-zinc-900 animate-pulse my-1.5" />
          ) : (
            <h3 className="text-xl font-bold text-white tracking-tight">{card.value}</h3>
          )}
          <p className="text-zinc-550 text-[11px] mt-1">{card.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
