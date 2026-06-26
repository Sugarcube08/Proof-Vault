"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Calendar, Shield, User, QrCode, Download, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

interface ProofDetails {
  owner: string;
  hash: string;
  timestamp: number;
}

interface ProofResultProps {
  status: "idle" | "searching" | "verified" | "not_found";
  proof: ProofDetails | null;
  onReset: () => void;
}

export default function ProofResult({ status, proof, onReset }: ProofResultProps) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (status === "verified" && proof && qrCanvasRef.current) {
      const verifyUrl = `${window.location.origin}/verify?hash=${proof.hash}`;
      QRCode.toCanvas(
        qrCanvasRef.current,
        verifyUrl,
        {
          width: 120,
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
  }, [status, proof]);

  const generatePDF = () => {
    if (!proof) return;

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
    doc.text(proof.owner, 30, 156);

    // Timestamp
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("Register Timestamp:", 30, 176);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 210);
    const dateStr = new Date(proof.timestamp * 1000).toUTCString();
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

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ID || "";

  if (status === "idle") return null;

  return (
    <div className="w-full max-w-xl">
      {status === "searching" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-12 rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-md text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
          <h3 className="text-base font-bold text-zinc-200 uppercase tracking-wider">Searching Ledger Records</h3>
          <p className="text-zinc-500 text-xs mt-2 max-w-xs leading-relaxed">
            Querying the Stellar Soroban contract state registry. Please wait.
          </p>
        </motion.div>
      )}

      {status === "verified" && proof && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-emerald-950/30 bg-emerald-950/5 backdrop-blur-md p-6 text-zinc-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-emerald-950/50 p-2 text-emerald-400 border border-emerald-900/30 shadow-inner">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-emerald-400">On-Chain Proof Exists</h3>
              <p className="text-xs text-zinc-500">This document fingerprint is registered on the Stellar blockchain.</p>
            </div>
          </div>

          <div className="space-y-4 text-left">
            {/* Hash */}
            <div className="rounded-lg bg-black/40 border border-zinc-900 p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                <Shield className="h-3.5 w-3.5 text-indigo-400" />
                <span>SHA-256 HASH</span>
              </div>
              <p className="font-mono text-xs text-zinc-300 break-all select-all">{proof.hash}</p>
            </div>

            {/* Owner */}
            <div className="rounded-lg bg-black/40 border border-zinc-900 p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                <User className="h-3.5 w-3.5 text-indigo-400" />
                <span>OWNER STELLAR ADDRESS</span>
              </div>
              <p className="font-mono text-xs text-zinc-300 break-all select-all">{proof.owner}</p>
            </div>

            {/* Timestamp */}
            <div className="rounded-lg bg-black/40 border border-zinc-900 p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                <span>VERIFICATION TIMESTAMP</span>
              </div>
              <p className="text-xs text-zinc-300 font-semibold">
                {new Date(proof.timestamp * 1000).toLocaleString()} <span className="text-zinc-550 font-normal">({new Date(proof.timestamp * 1000).toUTCString()})</span>
              </p>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* QR Code */}
              <div className="flex flex-col justify-center items-center rounded-lg bg-black/40 border border-zinc-900 p-4">
                <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-wider">
                  <QrCode className="h-3.5 w-3.5 text-indigo-400" />
                  <span>VERIFICATION QR CODE</span>
                </div>
                <canvas ref={qrCanvasRef} className="rounded-lg border border-zinc-800 p-1.5 bg-black" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 justify-center">
                <button
                  onClick={generatePDF}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-650 hover:bg-indigo-500 px-4 py-3 text-xs font-semibold text-white transition hover:shadow-md cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF Certificate</span>
                </button>

                {contractAddress && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/contract/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View contract on Explorer</span>
                  </a>
                )}

                <button
                  onClick={onReset}
                  className="flex items-center justify-center gap-2 rounded-lg border border-zinc-900 bg-transparent px-4 py-3 text-xs font-semibold text-zinc-500 transition hover:text-zinc-300 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Verify another document</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {status === "not_found" && proof && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-red-950/30 bg-red-950/5 backdrop-blur-md p-6 text-zinc-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-red-950/50 p-2 text-red-400 border border-red-900/30 shadow-inner">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-red-400">Proof Not Found</h3>
              <p className="text-xs text-zinc-500">No matching registry was found on the blockchain.</p>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <div className="rounded-lg bg-black/40 border border-zinc-900 p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                <Shield className="h-3.5 w-3.5 text-red-400" />
                <span>SHA-256 HASH SEARCHED</span>
              </div>
              <p className="font-mono text-xs text-zinc-400 break-all select-all">{proof.hash}</p>
            </div>

            <p className="text-zinc-500 text-xs leading-relaxed">
              This means the document fingerprint has not been registered on the Stellar Soroban contract. Make sure you selected the correct file or did not modify its contents since registration.
            </p>
          </div>

          <div className="flex gap-4 justify-end mt-6">
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-250 transition hover:bg-zinc-800 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try another file</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
