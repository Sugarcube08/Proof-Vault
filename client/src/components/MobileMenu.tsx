"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Wallet, Shield, LogOut } from "lucide-react";

interface LinkItem {
  name: string;
  path: string;
}

interface MobileMenuProps {
  links: LinkItem[];
  address: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<string | null>;
  disconnect: () => void;
}

export default function MobileMenu({
  links,
  address,
  connected,
  connecting,
  connect,
  disconnect,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="md:hidden">
      {/* Toggle Button */}
      <button
        onClick={toggleMenu}
        className="rounded-lg p-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />

            {/* Slide-over Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-[280px] border-l border-zinc-900 bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-lg flex flex-col justify-between"
            >
              <div className="flex flex-col gap-8">
                {/* Header inside drawer */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <span className="font-semibold text-white text-lg tracking-tight">Navigation</span>
                  <button
                    onClick={toggleMenu}
                    className="rounded-md p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Links */}
                <nav className="flex flex-col gap-4">
                  {links.map((link) => {
                    const isActive = pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        href={link.path}
                        onClick={toggleMenu}
                        className={`text-base font-medium transition-colors py-2 px-3 rounded-lg ${
                          isActive
                            ? "bg-indigo-600/10 border border-indigo-500/20 text-white font-semibold"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Wallet info or CTA in drawer bottom */}
              <div className="border-t border-zinc-900 pt-6">
                {connected && address ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300">
                      <Shield className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="font-mono text-zinc-300 truncate">{formatAddress(address)}</span>
                    </div>
                    <button
                      onClick={() => {
                        disconnect();
                        toggleMenu();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-red-950/10 hover:bg-red-950/20 py-2.5 text-sm font-medium text-red-400 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      await connect();
                      toggleMenu();
                    }}
                    disabled={connecting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-semibold text-white transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>{connecting ? "Connecting..." : "Connect Wallet"}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
