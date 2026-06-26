"use client";

import { useWallet } from "@/context/WalletContext";
import { useState } from "react";
import { LogOut, Wallet, Loader2 } from "lucide-react";

export default function WalletConnect() {
  const { address, connected, connecting, connect, disconnect } = useWallet();
  const [hovered, setHovered] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  if (connected && address) {
    return (
      <div className="relative">
        <button
          onClick={disconnect}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-sm font-medium text-zinc-100 backdrop-blur transition-all duration-200 hover:border-red-800 hover:bg-red-950/20 hover:text-red-400"
        >
          {hovered ? (
            <>
              <LogOut className="h-4 w-4 text-red-400" />
              <span>Disconnect</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{formatAddress(address)}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-white px-4 py-2 text-sm font-medium text-black transition-all duration-200 hover:bg-zinc-200 disabled:opacity-50"
    >
      {connecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-black" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4 text-black" />
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}
