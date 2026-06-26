"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletConnect from "./WalletConnect";
import MobileMenu from "./MobileMenu";
import { useWallet } from "@/context/WalletContext";
import { Shield } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const wallet = useWallet();

  const links = [
    { name: "Home", path: "/" },
    { name: "Verify", path: "/verify" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Certificates", path: "/certificates" },
    { name: "About", path: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 shadow-inner">
              <Shield className="h-5.5 w-5.5 text-indigo-400" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              ProofVault
            </span>
          </Link>

          <nav className="hidden md:flex gap-1 bg-zinc-950/40 p-1 rounded-full border border-zinc-900">
            {links.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-zinc-900 border border-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <WalletConnect />
          </div>
          <MobileMenu
            links={links}
            address={wallet.address}
            connected={wallet.connected}
            connecting={wallet.connecting}
            connect={wallet.connect}
            disconnect={wallet.disconnect}
          />
        </div>
      </div>
    </header>
  );
}
