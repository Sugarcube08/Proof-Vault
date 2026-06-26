export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-900 bg-black py-8">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-zinc-500 text-xs">
          &copy; {new Date().getFullYear()} ProofVault. Built on Stellar Soroban.
        </div>
        <div className="flex gap-4 text-xs text-zinc-500">
          <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-600">Stellar Testnet Ready</span>
        </div>
      </div>
    </footer>
  );
}
