"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Sparkles, ArrowRight, PlusCircle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4" style={{ background: '#181f2a' }}>
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)'}} />
      
      {/* Main Content */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
        {/* My Vaults Box */}
        <div className="bg-[#232c3b] border-2 border-[#3673F5] rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform duration-300 h-[300px] flex flex-col">
          <h2 className="font-futuristic text-2xl text-white font-bold mb-4 text-center">My Vaults</h2>
          <p className="text-blue-300 font-futuristic mb-6 text-center">
            View and manage your existing vaults. Access your wealth comparisons and participant statuses.
          </p>
          <button
            onClick={() => router.push('/vaults')}
            className="mt-auto w-full bg-[#3673F5] text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-futuristic font-bold shadow-neon flex items-center justify-center gap-2"
          >
            View My Vaults <ArrowRight size={20} />
          </button>
        </div>

        {/* Create Vault Box */}
        <div className="bg-[#232c3b] border-2 border-[#3673F5] rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform duration-300 h-[300px] flex flex-col">
          <h2 className="font-futuristic text-2xl text-white font-bold mb-4 text-center">Create Vault</h2>
          <p className="text-blue-300 font-futuristic mb-6 text-center">
            Start a new private wealth comparison vault. Invite participants and discover who's the richest while keeping everyone's wealth private.
          </p>
          <button
            onClick={() => router.push('/create-vault')}
            className="mt-auto w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-4 px-8 rounded-lg hover:scale-105 font-futuristic font-bold shadow-neon flex items-center justify-center gap-2"
          >
            Create New Vault <PlusCircle size={20} />
          </button>
        </div>
      </div>
    </div>
  );
} 