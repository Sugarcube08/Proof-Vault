"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, QrCode, FileText, Check, ExternalLink, RefreshCw } from "lucide-react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

interface DatabaseProof {
  id: string;
  wallet: string;
  hash: string;
  createdAt: string;
}

interface CertificatesGridProps {
  proofs: DatabaseProof[];
  loading: boolean;
  walletAddress: string | null;
}

interface CertificateCardProps {
  proof: DatabaseProof;
}

function CertificateCard({ proof }: CertificateCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const shareLink = `${typeof window !== "undefined" ? window.location.origin : ""}/verify?hash=${proof.hash}`;

  useEffect(() => {
    if (showQR && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        shareLink,
        {
          width: 140,
          margin: 1,
          color: {
            dark: "#ffffff",
            light: "#00000000",
          },
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error);
        }
      );
    }
  }, [showQR, shareLink]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Dark Mode Theme Background
    doc.setFillColor(10, 10, 12);
    doc.rect(0, 0, 210, 297, "F");

    // Decorative Borders
    doc.setDrawColor(30, 30, 35);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277, "S");
    doc.rect(12, 12, 186, 273, "S");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("PROOFVAULT", 105, 45, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 110, 130);
    doc.text("DECENTRALIZED PROOF OF EXISTENCE & TIMESTAMP CERTIFICATE", 105, 53, { align: "center" });

    // Dividers
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.8);
    doc.line(40, 65, 170, 65);

    // Certificate Body
    doc.setFontSize(12);
    doc.setTextColor(200, 200, 210);
    doc.text("This document certifies that a digital file has been successfully registered on the", 105, 80, { align: "center" });
    doc.text("Stellar Soroban network, establishing immutable proof of its existence at the timestamp indicated.", 105, 87, { align: "center" });

    // Details Box
    doc.setFillColor(20, 20, 25);
    doc.setDrawColor(40, 40, 50);
    doc.setLineWidth(0.5);
    doc.rect(20, 105, 170, 110, "FD");

    // Details Content
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    
    // Hash
    doc.text("Cryptographic Hash (SHA-256):", 30, 120);
    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.setTextColor(165, 180, 252);
    const splitHash = doc.splitTextToSize(proof.hash, 150);
    doc.text(splitHash, 30, 128);

    // Owner Address
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("Registered Owner (Stellar Address):", 30, 148);
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 210);
    doc.text(proof.wallet, 30, 156);

    // Timestamp
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("Register Timestamp:", 30, 176);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 210);
    const dateStr = new Date(proof.createdAt).toUTCString();
    doc.text(dateStr, 30, 184);

    // Network Information
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("Network / Ledger Status:", 30, 198);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(34, 197, 94);
    doc.text("CONFIRMED (Soroban Smart Contract)", 30, 206);

    // Footer of Certificate
    doc.setDrawColor(30, 30, 35);
    doc.setLineWidth(0.5);
    doc.line(30, 240, 180, 240);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 90, 110);
    doc.text("To verify this certificate independently, scan the QR code below or visit the ProofVault website.", 105, 250, { align: "center" });

    // Save
    doc.save(`ProofVault-Certificate-${proof.hash.slice(0, 8)}.pdf`);
  };

  const formattedDate = new Date(proof.createdAt).toLocaleDateString();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="relative flex flex-col justify-between rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 hover:border-zinc-800 transition-colors shadow-sm overflow-hidden"
    >
      <div className="flex flex-col gap-3">
        {/* Certificate Card Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-bold text-zinc-300">CERTIFICATE</span>
          </div>
          <span className="text-[10px] text-zinc-550 font-semibold">{formattedDate}</span>
        </div>

        {/* Info */}
        <div className="space-y-3 text-left">
          <div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Fingerprint Signature</span>
            <span className="font-mono text-xs text-zinc-300 break-all select-all block mt-0.5">{proof.hash}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Register Account</span>
            <span className="font-mono text-xs text-zinc-400 truncate block mt-0.5" title={proof.wallet}>
              {proof.wallet.slice(0, 12)}...{proof.wallet.slice(-8)}
            </span>
          </div>
        </div>
      </div>

      {/* QR Expandable Panel */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col items-center justify-center pt-4 mt-4 border-t border-zinc-900 bg-black/25 rounded-lg"
          >
            <canvas ref={qrCanvasRef} className="rounded-lg border border-zinc-800 p-1 bg-black" />
            <span className="text-[10px] text-zinc-500 font-semibold mt-2">Scan to verify proof</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-6">
        <button
          onClick={() => setShowQR(!showQR)}
          className={`flex items-center gap-1.5 rounded-lg border border-zinc-850 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            showQR ? "bg-zinc-800 text-white" : "bg-transparent text-zinc-400 hover:text-white"
          }`}
          title="Toggle QR Code"
        >
          <QrCode className="h-3.5 w-3.5" />
          <span>QR</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={copyShareLink}
            className="rounded-lg border border-zinc-850 p-1.5 text-zinc-450 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Copy Share Link"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
          </button>
          <a
            href={`/verify?hash=${proof.hash}`}
            className="rounded-lg border border-zinc-850 p-1.5 text-zinc-450 hover:text-white hover:bg-zinc-900 transition-colors"
            title="Preview Verification"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:shadow-md cursor-pointer"
            title="Download PDF Certificate"
          >
            <Download className="h-3.5 w-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CertificatesGrid({ proofs, loading, walletAddress }: CertificatesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="animate-pulse rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 h-56 flex flex-col justify-between">
            <div className="h-4 w-32 rounded bg-zinc-900" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-zinc-900" />
              <div className="h-3 w-2/3 rounded bg-zinc-900" />
            </div>
            <div className="flex justify-between">
              <div className="h-6 w-12 rounded bg-zinc-900" />
              <div className="h-6 w-24 rounded bg-zinc-900" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (proofs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-zinc-900 bg-zinc-950/40 rounded-xl text-center w-full max-w-xl mx-auto">
        <FileText className="h-8 w-8 text-zinc-650 mb-3" />
        <h3 className="text-base font-bold text-zinc-300">No Certificates Found</h3>
        <p className="text-zinc-550 text-xs mt-1.5 max-w-xs leading-relaxed">
          You haven&apos;t registered any document proofs yet. Head to the homepage to create your first secure timestamp.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      <AnimatePresence mode="popLayout">
        {proofs.map((proof) => (
          <CertificateCard key={proof.id} proof={proof} />
        ))}
      </AnimatePresence>
    </div>
  );
}
