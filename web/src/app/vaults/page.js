"use client";

import Link from "next/link";
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { getPublicClient } from '@wagmi/core';
import { config } from '@/utils/config';
import { RichVaultFactoryAbi } from '@/utils/contractABI/RichVaultFactory';
import { RichVaultAbi } from '@/utils/contractABI/RichVault';
import { writeContract } from '@wagmi/core';
import { Loader2, Sparkles, User, Users, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

// Base Sepolia factory address
const FACTORY_ADDRESS = "0xe147994f9064dc73a3f72dbf78704de9e6951623";
const CHAIN_ID = 84532; // Base Sepolia

export default function MyVaults() {
  const [vaults, setVaults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingVault, setProcessingVault] = useState(null);
  const { address, isConnected } = useAccount();

  const fetchVaults = async () => {
    if (!address || !isConnected) return;

    try {
      setIsLoading(true);
      setError(null);

      const publicClient = getPublicClient(config, {
        chainId: CHAIN_ID,
      });

      if (!publicClient) {
        throw new Error('Unable to get public client');
      }

      // Get vault addresses where user is involved (either created or invited)
      const [createdVaults, userVaults] = await Promise.all([
        publicClient.readContract({
          address: FACTORY_ADDRESS,
          abi: RichVaultFactoryAbi,
          functionName: 'getCreatedVaults',
          args: [address],
        }),
        publicClient.readContract({
          address: FACTORY_ADDRESS,
          abi: RichVaultFactoryAbi,
          functionName: 'getUserVaults',
          args: [address],
        })
      ]);

      // Combine and deduplicate vault addresses
      const allVaultAddresses = Array.from(
        new Set([...createdVaults, ...userVaults])
      );

      console.log('Found vault addresses:', allVaultAddresses);

      // Fetch details for each vault
      const vaultPromises = allVaultAddresses.map(async (vaultAddress) => {
        try {
          // Get vault details from the vault contract itself
          const [
            vaultName,
            vaultCreator,
            participants,
            acceptedParticipants,
            rejectedParticipants,
            userStatus
          ] = await Promise.all([
            publicClient.readContract({
              address: vaultAddress,
              abi: RichVaultAbi,
              functionName: 'vaultName',
            }),
            publicClient.readContract({
              address: vaultAddress,
              abi: RichVaultAbi,
              functionName: 'vaultCreator',
            }),
            publicClient.readContract({
              address: vaultAddress,
              abi: RichVaultAbi,
              functionName: 'getParticipants',
            }),
            publicClient.readContract({
              address: vaultAddress,
              abi: RichVaultAbi,
              functionName: 'getAccepted',
            }),
            publicClient.readContract({
              address: vaultAddress,
              abi: RichVaultAbi,
              functionName: 'getRejected',
            }),
            publicClient.readContract({
              address: vaultAddress,
              abi: RichVaultAbi,
              functionName: 'status',
              args: [address],
            })
          ]);

          // Convert status number to string
          const statusMap = ['NotInvited', 'Invited', 'Accepted', 'Rejected'];
          const userStatusString = statusMap[userStatus];

          // Determine vault status
          const allInvitationsResolved = 
            acceptedParticipants.length + rejectedParticipants.length === participants.length;
          
          let vaultStatus;
          if (userStatusString === 'Rejected') {
            vaultStatus = 'rejected';
          } else if (userStatusString === 'Invited') {
            vaultStatus = 'pending';
          } else {
            vaultStatus = 'active';
          }

          return {
            id: vaultAddress,
            name: vaultName,
            creator: vaultCreator,
            vaultAddress: vaultAddress,
            participants: participants,
            acceptedParticipants: acceptedParticipants,
            rejectedParticipants: rejectedParticipants,
            status: vaultStatus,
            userStatus: userStatusString,
            allInvitationsResolved: allInvitationsResolved
          };
        } catch (error) {
          console.error(`Error fetching vault ${vaultAddress}:`, error);
          return null;
        }
      });

      const results = await Promise.all(vaultPromises);
      const validVaults = results.filter(vault => vault !== null);
      
      console.log('Fetched vaults:', validVaults);
      setVaults(validVaults);

    } catch (error) {
      console.error('Error fetching vaults:', error);
      setError('Failed to fetch vaults. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (vault) => {
    try {
      setProcessingVault(vault.id);
      
      console.log('Accepting invitation for vault:', vault.vaultAddress);
      console.log('User address:', address);
      
      const txHash = await writeContract(config, {
        address: vault.vaultAddress,
        abi: RichVaultAbi,
        functionName: 'acceptInvitation',
        args: [], // acceptInvitation takes no arguments
        account: address,
        chainId: CHAIN_ID,
      });

      console.log('Accept invitation transaction hash:', txHash);
      alert(`Invitation accepted successfully! Transaction: ${txHash}`);
      
      // Wait a bit for the transaction to be mined before refreshing
      setTimeout(() => {
        fetchVaults();
      }, 2000);
      
    } catch (error) {
      console.error('Error accepting invitation:', error);
      
      // More detailed error handling
      if (error.message.includes('Not invited')) {
        alert('Error: You are not invited to this vault or have already responded.');
      } else if (error.message.includes('User rejected the request')) {
        alert('Transaction was rejected by user.');
      } else {
        alert(`Failed to accept invitation: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setProcessingVault(null);
    }
  };

  const handleRejectInvitation = async (vault) => {
    try {
      setProcessingVault(vault.id);
      
      console.log('Rejecting invitation for vault:', vault.vaultAddress);
      console.log('User address:', address);
      
      const txHash = await writeContract(config, {
        address: vault.vaultAddress,
        abi: RichVaultAbi,
        functionName: 'rejectInvitation',
        args: [], // rejectInvitation takes no arguments
        account: address,
        chainId: CHAIN_ID,
      });

      console.log('Reject invitation transaction hash:', txHash);
      alert(`Invitation rejected successfully! Transaction: ${txHash}`);
      
      // Wait a bit for the transaction to be mined before refreshing
      setTimeout(() => {
        fetchVaults();
      }, 2000);
      
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      
      // More detailed error handling
      if (error.message.includes('Not invited')) {
        alert('Error: You are not invited to this vault or have already responded.');
      } else if (error.message.includes('User rejected the request')) {
        alert('Transaction was rejected by user.');
      } else {
        alert(`Failed to reject invitation: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setProcessingVault(null);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchVaults();
    }
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="bg-[#181f2a] min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-8 tracking-wider">My Vaults</h1>
          <p className="text-blue-300">Please connect your wallet to view your vaults.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden p-4" style={{ background: '#181f2a' }}>
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)'}} />
      {/* Header */}
      <header className="flex items-center justify-between w-full max-w-5xl mt-12 mb-8 z-10">
        <div className="flex items-center gap-3">
          <Sparkles className="text-[#7ecbff] animate-pulse" size={32} />
          <span className="font-futuristic text-3xl md:text-4xl text-white font-bold tracking-widest">MY VAULTS</span>
        </div>
        <Link href="/createVault" className="bg-[#3673F5] text-[#1A2857] border-2 border-[#3673F5] font-futuristic px-6 py-2 rounded-lg text-lg font-bold shadow-neon transition-all hover:bg-blue-700 hover:text-white hover:scale-105">+ CREATE VAULT</Link>
      </header>
      {/* Vaults Grid */}
      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 z-10">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-[#3673F5]" size={48} />
          </div>
        ) : error ? (
          <div className="col-span-full text-red-400 font-futuristic text-lg text-center" style={{textShadow: '0 0 2px #fff'}}>{error}</div>
        ) : vaults.length === 0 ? (
          <div className="col-span-full text-white font-futuristic text-xl text-center opacity-80" style={{textShadow: '0 0 2px #7ecbff'}}>
            No vaults found. <Link href="/createVault" className="underline text-[#3673F5]">Create one?</Link>
          </div>
        ) : (
          vaults.map((vault) => (
            <div key={vault.id} className="bg-[#232c3b] border-2 border-blue-500 rounded-2xl p-6 shadow-xl flex flex-col gap-4 relative">
              <div className="flex items-center gap-2 mb-2">
                <User className="text-[#3673F5]" size={20} />
                <span className="font-futuristic text-lg text-white font-bold tracking-wide" style={{textShadow: '0 0 2px #7ecbff'}}>{vault.name}</span>
                {vault.status === 'active' && <span className="ml-2 px-2 py-1 rounded-full bg-green-900/60 text-green-300 text-xs font-bold font-futuristic">ACTIVE</span>}
                {vault.status === 'pending' && <span className="ml-2 px-2 py-1 rounded-full bg-yellow-900/60 text-yellow-300 text-xs font-bold font-futuristic">PENDING</span>}
                {vault.status === 'rejected' && <span className="ml-2 px-2 py-1 rounded-full bg-red-900/60 text-red-300 text-xs font-bold font-futuristic">REJECTED</span>}
              </div>
              <div className="flex items-center gap-2 text-blue-300 text-xs font-futuristic">
                <span className="truncate">{vault.vaultAddress.slice(0, 6)}...{vault.vaultAddress.slice(-4)}</span>
                <span className="mx-2">•</span>
                <Users className="inline-block" size={16} />
                <span>{vault.participants.length} participants</span>
              </div>
              <div className="flex gap-2 mt-4">
                {vault.status === 'pending' && (
                  <>
                    <button onClick={() => handleAcceptInvitation(vault)} disabled={processingVault === vault.id} className="flex-1 bg-[#3673F5] text-[#1A2857] font-futuristic font-bold py-2 rounded-lg shadow-neon border-2 border-[#3673F5] hover:bg-green-500 hover:text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                      {processingVault === vault.id ? <Loader2 className="animate-spin inline-block mr-2" size={18} /> : <CheckCircle className="inline-block mr-1" size={18} />} Accept
                    </button>
                    <button onClick={() => handleRejectInvitation(vault)} disabled={processingVault === vault.id} className="flex-1 bg-[#232c3b] text-red-300 font-futuristic font-bold py-2 rounded-lg border-2 border-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                      <XCircle className="inline-block mr-1" size={18} /> Reject
                    </button>
                  </>
                )}
                {vault.status === 'active' && (
                  <Link href={`/vault/${vault.id}`} className="flex-1 bg-[#3673F5] text-[#1A2857] font-futuristic font-bold py-2 rounded-lg shadow-neon border-2 border-[#3673F5] hover:bg-blue-700 hover:text-white transition-all duration-200 flex items-center justify-center gap-2">
                    <ArrowRight size={18} /> Go to Vault
                  </Link>
                )}
                {vault.status === 'rejected' && (
                  <span className="flex-1 text-center text-red-400 font-futuristic font-bold py-2 rounded-lg border-2 border-red-400 bg-[#232c3b] cursor-not-allowed opacity-60">Rejected</span>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}