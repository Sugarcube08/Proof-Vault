"use client";

import React, { useEffect, useRef } from "react";
import { CheckCircle2, XCircle, Calendar, Shield, User, QrCode, Download, ExternalLink, RefreshCw } from "lucide-react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

interface ProofDetails {
  owner: string;
  hash: string;
  timestamp: number;
}

interface ProofCardProps {
  status: "verified" | "not_found" | "idle";
  proof: ProofDetails | null;
  onReset: () => void;
}

export default function ProofCard({ status, proof, onReset }: ProofCardProps) {
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
            light: "#00000000", // transparent background
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
    doc.setDrawColor(79, 70, 229); // indigo line
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
    doc.setTextColor(165, 180, 252); // indigo-200
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
    doc.setTextColor(34, 197, 94); // emerald-500
    doc.text("CONFIRMED (Soroban Smart Contract)", 30, 206);

    // Footer of Certificate
    doc.setDrawColor(30, 30, 35);
    doc.setLineWidth(0.5);
    doc.line(30, 240, 180, 240);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 90, 110);
    doc.text("To verify this certificate independently, scan the QR code below or visit the ProofVault website.", 105, 250, { align: "center" });

    // Save the PDF
    doc.save(`ProofVault-Certificate-${proof.hash.slice(0, 8)}.pdf`);
  };

  if (status === "idle") return null;

  return (
    <div className="w-full max-w-xl">
      {status === "verified" && proof ? (
        <div className="rounded-xl border border-emerald-950 bg-emerald-950/10 backdrop-blur p-6 text-zinc-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-emerald-950/60 p-2 text-emerald-400 border border-emerald-900">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-400">Proof Exists</h3>
              <p className="text-xs text-zinc-400">This document was registered and verified on-chain.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Hash */}
            <div className="rounded-lg bg-black/40 border border-zinc-900 p-4">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1 font-medium">
                <Shield className="h-3.5 w-3.5 text-indigo-400" />
                <span>SHA-256 HASH</span>
              </div>
              <p className="font-mono text-xs text-zinc-300 break-all select-all">{proof.hash}</p>
            </div>

            {/* Owner */}
            <div className="rounded-lg bg-black/40 border border-zinc-900 p-4">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1 font-medium">
                <User className="h-3.5 w-3.5 text-indigo-400" />
                <span>OWNER STELLAR ADDRESS</span>
              </div>
              <p className="font-mono text-xs text-zinc-300 break-all select-all">{proof.owner}</p>
            </div>

            {/* Timestamp */}
            <div className="rounded-lg bg-black/40 border border-zinc-900 p-4">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1 font-medium">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                <span>VERIFICATION TIMESTAMP</span>
              </div>
              <p className="text-xs text-zinc-300">
                {new Date(proof.timestamp * 1000).toLocaleString()} ({new Date(proof.timestamp * 1000).toUTCString()})
              </p>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* QR Code and Actions */}
              <div className="flex flex-col justify-center items-center rounded-lg bg-black/40 border border-zinc-900 p-4">
                <div className="flex items-center gap-1 text-xs text-zinc-500 mb-3">
                  <QrCode className="h-3.5 w-3.5 text-indigo-400" />
                  <span>VERIFICATION QR CODE</span>
                </div>
                <canvas ref={qrCanvasRef} className="rounded-lg border border-zinc-800 p-1 bg-black" />
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 justify-center">
                <button
                  onClick={generatePDF}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Certificate</span>
                </button>

                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${process.env.NEXT_PUBLIC_CONTRACT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Contract</span>
                </a>

                <button
                  onClick={onReset}
                  className="flex items-center justify-center gap-2 rounded-lg border border-zinc-900 bg-transparent px-4 py-2.5 text-sm font-semibold text-zinc-500 transition hover:text-zinc-300"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Verify Another</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-red-950 bg-red-950/10 backdrop-blur p-6 text-zinc-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-red-950/60 p-2 text-red-400 border border-red-900">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-400">Proof Not Found</h3>
              <p className="text-xs text-zinc-400">No matching record was found on the blockchain.</p>
            </div>
          </div>

          <div className="rounded-lg bg-black/40 border border-zinc-900 p-4 mb-6">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1 font-medium">
              <Shield className="h-3.5 w-3.5 text-red-400" />
              <span>SHA-256 HASH SEARCHED</span>
            </div>
            <p className="font-mono text-xs text-zinc-400 break-all select-all">{proof?.hash || "Hash does not match any registered certificate."}</p>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
