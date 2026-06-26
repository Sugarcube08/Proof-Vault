"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Zap, Lock, Cpu } from "lucide-react";

export default function Features() {
  const list = [
    {
      icon: <Lock className="h-5 w-5 text-indigo-400" />,
      title: "Private by Design",
      description: "Hash calculated entirely inside your browser sandbox. Your raw files are never uploaded to any server or blockchain.",
    },
    {
      icon: <Zap className="h-5 w-5 text-indigo-400" />,
      title: "Instant Verification",
      description: "Query on-chain smart contract state in milliseconds to instantly verify the existence and owner of any document.",
    },
    {
      icon: <ShieldAlert className="h-5 w-5 text-indigo-400" />,
      title: "Immutable Timestamp",
      description: "Protected by Stellar network validator consensus, establishing indisputable Proof of Existence at a specific time.",
    },
    {
      icon: <Cpu className="h-5 w-5 text-indigo-400" />,
      title: "Soroban Powered",
      description: "Engineered with next-generation Rust smart contracts on Stellar, providing gas-efficient and secure on-chain operations.",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-20">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Security & Architecture</h2>
        <p className="text-zinc-500 text-sm mt-2 max-w-lg mx-auto">
          ProofVault is built with trustless principles to provide mathematically verifiable proofs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {list.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col gap-4 text-left hover:border-zinc-800 hover:bg-zinc-900/10 transition-all duration-300"
          >
            <div className="rounded-lg bg-zinc-900 border border-zinc-850 p-2.5 w-fit group-hover:bg-indigo-600/10 group-hover:border-indigo-500/25 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-base font-bold text-zinc-150 group-hover:text-white transition-colors">{feature.title}</h3>
            <p className="text-zinc-500 text-xs leading-relaxed group-hover:text-zinc-400 transition-colors">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
