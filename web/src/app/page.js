"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Sparkles, ArrowRight, PlusCircle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden p-4" style={{ background: '#181f2a' }}>
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)'}} />
      
      {/* Header */}
      <header className="w-full max-w-5xl mt-12 mb-12 z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="relative">
            {/* Glowing background effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#3673F5]/20 via-emerald-500/20 to-[#7ecbff]/20 rounded-2xl blur-xl"></div>
            
            {/* Main container */}
            <div className="relative bg-[#232c3b] rounded-2xl overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#3673F5] via-emerald-500 to-[#7ecbff] animate-gradient-x"></div>
              
              {/* Content container */}
              <div className="relative bg-[#232c3b] m-[2px] rounded-2xl px-12 py-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#3673F5] via-emerald-500 to-[#7ecbff] rounded-xl blur-sm"></div>
                    <div className="relative bg-[#232c3b] p-2 rounded-xl">
                      <Sparkles className="text-emerald-400" size={24} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="font-futuristic text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-400 to-[#7ecbff] font-bold tracking-wider">
                        Millionaire's Dilemma
                    </h1>
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent mt-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
        {/* My Rooms Box */}
        <div className="relative group">
          {/* Glowing background effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#3673F5]/20 to-[#7ecbff]/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          
          {/* Main container */}
          <div className="relative bg-[#232c3b] rounded-2xl overflow-hidden">
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#3673F5] via-[#7ecbff] to-[#3673F5] animate-gradient-x"></div>
            
            {/* Content container */}
            <div className="relative bg-[#232c3b] m-[2px] rounded-2xl p-8 flex flex-col h-[300px]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-[#3673F5] to-[#7ecbff] p-2 rounded-xl">
                  <Sparkles className="text-white" size={20} />
                </div>
                <h2 className="font-futuristic text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-[#7ecbff] font-bold">
                  My Rooms
                </h2>
              </div>
              <p className="text-blue-300 font-futuristic mb-6 text-center px-4">
                View and manage your existing rooms. Access your wealth comparisons and participant statuses.
              </p>
              <button
                onClick={() => router.push('/rooms')}
                className="mt-auto w-full bg-[#3673F5] text-white px-6 py-3 rounded-lg hover:bg-[#3673F5]/80 transition-colors font-futuristic font-bold shadow-neon flex items-center justify-center gap-2"
              >
                View My Rooms <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Create Room Box */}
        <div className="relative group">
          {/* Glowing background effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-green-400/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          
          {/* Main container */}
          <div className="relative bg-[#232c3b] rounded-2xl overflow-hidden">
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 animate-gradient-x"></div>
            
            {/* Content container */}
            <div className="relative bg-[#232c3b] m-[2px] rounded-2xl p-8 flex flex-col h-[300px]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-emerald-500 to-green-400 p-2 rounded-xl">
                  <PlusCircle className="text-white" size={20} />
                </div>
                <h2 className="font-futuristic text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400 font-bold">
                  Create Room
                </h2>
              </div>
              <p className="text-emerald-300 font-futuristic mb-6 text-center px-4">
                Start a new private wealth comparison room. Invite participants and discover who's the richest while keeping everyone's wealth private.
              </p>
              <button
                onClick={() => router.push('/createRoom')}
                className="mt-auto w-full bg-gradient-to-r from-emerald-500 to-green-400 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-green-500 transition-colors font-futuristic font-bold shadow-neon flex items-center justify-center gap-2"
              >
                Create New Room <PlusCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 