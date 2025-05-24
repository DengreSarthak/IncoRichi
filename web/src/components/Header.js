'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-[#232c3b] border-b-2 border-[#3673F5] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#3673F5] text-2xl font-bold font-futuristic">INCO</span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent text-2xl font-bold font-futuristic tracking-widest">RichiTheRich</span>
            </div>
          </div>
          <div className="transform hover:scale-105 transition-transform duration-200">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
