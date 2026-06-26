"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletConnect from "./WalletConnect";
import { ShieldAlert } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: "Register", path: "/" },
    { name: "Verify", path: "/verify" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "About", path: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700">
              <ShieldAlert className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-lg">ProofVault</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            {links.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    isActive ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
