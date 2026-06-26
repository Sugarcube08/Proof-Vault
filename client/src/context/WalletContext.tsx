"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { isConnected, requestAccess } from "@stellar/freighter-api";

interface WalletContextType {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<string | null>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const savedAddress = localStorage.getItem("proofvault_wallet");
    if (savedAddress) {
      setTimeout(() => {
        setAddress(savedAddress);
      }, 0);
    }
  }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      const connection = await isConnected();
      if (!connection.isConnected) {
        alert("Freighter wallet not detected. Please install Freighter Extension!");
        setConnecting(false);
        return null;
      }
      
      const access = await requestAccess();
      if (access.address) {
        setAddress(access.address);
        localStorage.setItem("proofvault_wallet", access.address);
        setConnecting(false);
        return access.address;
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
    setConnecting(false);
    return null;
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem("proofvault_wallet");
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        connected: !!address,
        connecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
