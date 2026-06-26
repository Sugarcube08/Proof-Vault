"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Database, Globe, Layers } from "lucide-react";

interface StatsCardsProps {
  walletAddress: string | null;
}

export default function StatsCards({ walletAddress }: StatsCardsProps) {
  const [totalProofs, setTotalProofs] = useState<number | null>(null);
  const [userProofs, setUserProofs] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        // Fetch total proofs
        const totalRes = await fetch("/api/proofs?limit=1");
        const totalData = await totalRes.json();
        if (totalRes.ok) {
          setTotalProofs(totalData.total || 0);
        }

        // Fetch user proofs if connected
        if (walletAddress) {
          const userRes = await fetch(`/api/proofs?wallet=${walletAddress}&limit=1`);
          const userData = await userRes.json();
          if (userRes.ok) {
            setUserProofs(userData.total || 0);
          }
        } else {
          setUserProofs(0);
        }
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [walletAddress]);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ID || "";
  const network = process.env.NEXT_PUBLIC_NETWORK || "testnet";

  const stats = [
    {
      icon: <Layers className="h-5 w-5 text-indigo-400" />,
      label: "Total Proofs",
      value: loading ? null : totalProofs?.toLocaleString(),
      desc: "Global documents timestamped",
    },
    {
      icon: <Database className="h-5 w-5 text-indigo-400" />,
      label: "Your Proofs",
      value: loading ? null : walletAddress ? userProofs?.toLocaleString() : "—",
      desc: walletAddress ? "Registered by your wallet" : "Connect wallet to view",
    },
    {
      icon: <Globe className="h-5 w-5 text-indigo-400" />,
      label: "Active Network",
      value: loading ? null : `Stellar ${network.charAt(0).toUpperCase() + network.slice(1)}`,
      desc: "Underlying blockchain layer",
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-indigo-400" />,
      label: "Contract Address",
      value: loading ? null : contractAddress ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-6)}` : "—",
      desc: "Soroban protocol registry",
      link: contractAddress ? `https://stellar.expert/explorer/testnet/contract/${contractAddress}` : undefined,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const cardContent = (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                <div className="rounded-md bg-zinc-900 border border-zinc-800 p-1.5">{stat.icon}</div>
              </div>
              {stat.value === null ? (
                <div className="h-8 w-24 rounded bg-zinc-900 animate-pulse my-1" />
              ) : (
                <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
              )}
              <span className="text-zinc-500 text-xs">{stat.desc}</span>
            </div>
          );

          const className = "rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 text-left hover:border-zinc-850 hover:bg-zinc-900/5 transition-all duration-300";

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className={className}
            >
              {stat.link ? (
                <a href={stat.link} target="_blank" rel="noopener noreferrer" className="block h-full cursor-pointer">
                  {cardContent}
                </a>
              ) : (
                cardContent
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
