"use client";

import React from "react";
import { motion } from "framer-motion";
import { Upload, Cpu, PenTool, CheckCircle } from "lucide-react";

export default function Timeline() {
  const steps = [
    {
      num: "01",
      title: "Upload",
      desc: "Select or drag any digital file locally.",
      icon: <Upload className="h-4 w-4" />,
    },
    {
      num: "02",
      title: "Hash",
      desc: "SHA-256 digest is computed in-browser.",
      icon: <Cpu className="h-4 w-4" />,
    },
    {
      num: "03",
      title: "Sign",
      desc: "Approve Freighter wallet signature.",
      icon: <PenTool className="h-4 w-4" />,
    },
    {
      num: "04",
      title: "Confirm",
      desc: "Validators secure and timestamp on-chain.",
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-24">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">How it Works</h2>
        <p className="text-zinc-500 text-sm mt-2 max-w-lg mx-auto">
          Establish permanent proof of existence in four straightforward cryptographic steps.
        </p>
      </div>

      <div className="relative">
        {/* Horizontal Line for Desktop */}
        <div className="hidden lg:block absolute top-7 left-10 right-10 h-0.5 bg-gradient-to-r from-indigo-500/10 via-indigo-500/30 to-indigo-500/10 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center lg:items-start text-center lg:text-left group"
            >
              <div className="flex items-center gap-4 mb-4">
                {/* Step Circle */}
                <div className="h-14 w-14 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-indigo-400 group-hover:border-indigo-500/40 group-hover:bg-indigo-600/5 transition-all duration-300 relative shadow-inner">
                  {step.icon}
                  {/* Step number badge */}
                  <span className="absolute -top-1 -right-1 bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 px-1 rounded">
                    {step.num}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-zinc-200 group-hover:text-white transition-colors">{step.title}</h3>
              <p className="text-zinc-500 text-xs mt-2 leading-relaxed max-w-[200px] lg:max-w-none group-hover:text-zinc-400 transition-colors">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
