"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, Search, ChevronLeft, ChevronRight, FileText } from "lucide-react";

interface DatabaseProof {
  id: string;
  wallet: string;
  hash: string;
  createdAt: string;
}

interface DashboardTableProps {
  proofs: DatabaseProof[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
}

export default function DashboardTable({
  proofs,
  loading,
  page,
  totalPages,
  total,
  onPageChange,
  onSearchChange,
}: DashboardTableProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [searchVal, setSearchVal] = useState("");

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchVal);
  };

  const handleSearchClear = () => {
    setSearchVal("");
    onSearchChange("");
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="w-full">
      {/* Search Header */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by hash..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200"
        >
          Search
        </button>
        {searchVal && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="text-xs text-zinc-500 hover:text-zinc-300 self-center px-2"
          >
            Clear
          </button>
        )}
      </form>

      {/* Table Box */}
      <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950/80 border-b border-zinc-900 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Proof Hash</th>
                <th className="px-6 py-4 font-semibold">Wallet Address</th>
                <th className="px-6 py-4 font-semibold">Registration Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-48 rounded bg-zinc-800" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 rounded bg-zinc-800" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 rounded bg-zinc-800" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 w-16 rounded bg-zinc-800 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : proofs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    <FileText className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                    <span>No registered proofs found.</span>
                  </td>
                </tr>
              ) : (
                proofs.map((proof) => (
                  <tr key={proof.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-300 select-all">
                      <span className="truncate max-w-[200px] inline-block sm:max-w-md">
                        {proof.hash}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                      {formatAddress(proof.wallet)}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400">
                      {formatDate(proof.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(proof.hash)}
                          className="rounded p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          title="Copy SHA-256 Hash"
                        >
                          {copiedHash === proof.hash ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <a
                          href={`/verify?hash=${proof.hash}`}
                          className="rounded p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          title="Verify On-Chain"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-900 bg-zinc-950/80 px-6 py-4 text-xs text-zinc-500">
            <div>
              Showing page <span className="font-semibold text-zinc-300">{page}</span> of{" "}
              <span className="font-semibold text-zinc-300">{totalPages}</span> (Total {total} proofs)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 hover:bg-zinc-900 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 hover:bg-zinc-900 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
