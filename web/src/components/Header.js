'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
  return (
    <header className="bg-[#232c3b] border-b-2 border-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded p-2 text-2xl font-bold text-white">INCO</div>
          <span className="text-green-300 text-2xl font-bold tracking-widest">RichiTheRich</span>
        </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
