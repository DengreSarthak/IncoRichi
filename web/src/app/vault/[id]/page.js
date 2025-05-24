"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAccount, usePublicClient } from 'wagmi';
import { watchContractEvent, writeContract } from '@wagmi/core';
import { supportedChains } from '@inco/js';
import { Lightning } from '@inco/js/lite';
import { config } from '@/utils/config';
import { RichVaultAbi } from '@/utils/contractABI/RichVault';
import { Sparkles, User, Users, CheckCircle, XCircle, ArrowRight, Trophy } from 'lucide-react';

// Base Sepolia via Inco
const CHAIN_ID = supportedChains.baseSepolia;

export default function VaultPage() {
  const { id } = useParams();
  console.log(id);
  const { address, isConnected } = useAccount();
  console.log(address);
  const publicClient = usePublicClient({ chainId: CHAIN_ID });

  const [vault, setVault] = useState(null);
  const [participantDetails, setParticipantDetails] = useState([]);
  const [userStatus, setUserStatus] = useState(null);
  const [wealthInput, setWealthInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [winner, setWinner] = useState(null);

  const ParticipantStatus = {
    0: "NotInvited",
    1: "Invited",
    2: "Accepted",
    3: "Rejected",
  };

  // Initialize Inco FHE client once
  const zap = useMemo(
    () => Lightning.latest('testnet', CHAIN_ID),
    []
  );

  // Load vault on-chain data
  const loadVaultData = useCallback(async () => {
    if (!publicClient || !id) return;
    try {
      setLoading(true);
      setError(null);

      const [name, creator, participants, accepted, rejected, winnerAddress] = await Promise.all([
        publicClient.readContract({ address: id, abi: RichVaultAbi, functionName: 'vaultName' }),
        publicClient.readContract({ address: id, abi: RichVaultAbi, functionName: 'vaultCreator' }),
        publicClient.readContract({ address: id, abi: RichVaultAbi, functionName: 'getParticipants' }),
        publicClient.readContract({ address: id, abi: RichVaultAbi, functionName: 'getAccepted' }),
        publicClient.readContract({ address: id, abi: RichVaultAbi, functionName: 'getRejected' }),
        publicClient.readContract({ address: id, abi: RichVaultAbi, functionName: 'winnerAddress' }),
      ]);

      const details = await Promise.all(
        participants.map(async (p) => {
          const [statusCode, hasSubmitted] = await Promise.all([
            publicClient.readContract({ address: id, abi: RichVaultAbi, functionName: 'status', args: [p] }),
            publicClient.readContract({ address: id, abi: RichVaultAbi, functionName: 'hasSubmittedWealth', args: [p] }),
          ]);
          return {
            address: p,
            status: ParticipantStatus[statusCode],
            hasSubmittedWealth: hasSubmitted,
          };
        })
      );

      setVault({ address: id, name, creator, participants, acceptedParticipants: accepted, rejectedParticipants: rejected });
      setParticipantDetails(details);
      setWinner(winnerAddress);

      if (address) {
        const code = await publicClient.readContract({ address: id, abi: RichVaultAbi, functionName: 'status', args: [address] });
        setUserStatus(ParticipantStatus[code]);
      }
    } catch (err) {
      console.error("Failed to load vault data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [publicClient, id, address]);

  // Initial fetch and on connect
  useEffect(() => {
    if (isConnected) loadVaultData();
  }, [isConnected, loadVaultData]);

  // Watch for WealthSubmitted and RichestDeclared events
  useEffect(() => {
    if (!publicClient || !id) return;
    
    const unwatchWealth = publicClient.watchContractEvent(
      { address: id, abi: RichVaultAbi, eventName: 'WealthSubmitted' },
      loadVaultData
    );

    const unwatchRichest = publicClient.watchContractEvent(
      { address: id, abi: RichVaultAbi, eventName: 'RichestDeclared' },
      (event) => {
        console.log('RichestDeclared event:', event);
        loadVaultData();
      }
    );

    return () => {
      unwatchWealth();
      unwatchRichest();
    };
  }, [publicClient, id, loadVaultData]);

  // Handlers
  const handleAcceptInvitation = async () => {
    try {
      setSubmitting(true);
      const { hash } = await writeContract(config, {
        address: id,
        abi: RichVaultAbi,
        functionName: 'acceptInvitation',
        args: [],
        account: address,
        chainId: CHAIN_ID,
      });
      alert(`Invitation accepted! Tx: ${hash}`);
      loadVaultData(); // Reload data after transaction
    } catch (err) {
      console.error(err);
      alert(err.message.includes('Not invited') ? 'Not invited or already responded.' : 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectInvitation = async () => {
    try {
      setSubmitting(true);
      const { hash } = await writeContract(config, {
        address: id,
        abi: RichVaultAbi,
        functionName: 'rejectInvitation',
        args: [],
        account: address,
        chainId: CHAIN_ID,
      });
      alert(`Invitation rejected! Tx: ${hash}`);
      loadVaultData(); // Reload data after transaction
    } catch (err) {
      console.error(err);
      alert(err.message.includes('Not invited') ? 'Not invited or already responded.' : 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWealth = async () => {
    if (!wealthInput || isNaN(wealthInput)) return alert("Please enter a valid wealth amount");
    try {
      setSubmitting(true);
      const raw = parseInt(wealthInput, 10);
      const ciphertext = await zap.encrypt(raw, { accountAddress: address, dappAddress: id });
      console.log(ciphertext);
      const { hash } = await writeContract(config, {
        address: id,
        abi: RichVaultAbi,
        functionName: 'submitEncryptedWealth',
        args: [ciphertext],
        account: address,
        chainId: CHAIN_ID,
      });
      alert(`Wealth submitted! Tx: ${hash}`);
      setWealthInput(""); // Clear input after successful submission
      loadVaultData(); // Reload data after transaction
    } catch (err) {
      console.error("Wealth submission error:", err);
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclareRichest = async () => {
    try {
      setSubmitting(true);
      const { hash } = await writeContract(config, {
        address: id,
        abi: RichVaultAbi,
        functionName: 'declareRichest',
        args: [],
        account: address,
        chainId: CHAIN_ID,
      });
      alert(`Declared richest! Tx: ${hash}`);
      // Note: We don't reload here as the winner will be set by the callback
      // The RichestDeclared event listener will handle the reload
    } catch (err) {
      console.error(err);
      alert(err.message.includes('Some invitations still pending') ? 'Invitations pending.' : 'Declaration failed');
    } finally {
      setSubmitting(false);
    }
  };

  // UI states
  if (!isConnected) return <div className="min-h-screen flex items-center justify-center bg-[#181f2a] text-white font-futuristic">Connect wallet</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#181f2a] text-white font-futuristic">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-[#181f2a] text-red-400 font-futuristic">Error: {error}</div>;
  if (!vault) return <div className="min-h-screen flex items-center justify-center bg-[#181f2a] text-white font-futuristic">Vault not found.</div>;

  const allInvitationsResolved = vault.acceptedParticipants.length + vault.rejectedParticipants.length === vault.participants.length;
  const allAcceptedSubmitted = participantDetails.filter(p => p.status === "Accepted").every(p => p.hasSubmittedWealth);
  const currentUserParticipant = participantDetails.find(p => p.address.toLowerCase() === address?.toLowerCase());

  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden p-4" style={{ background: '#181f2a' }}>
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)'}} />
      
      {/* Header */}
      <header className="w-full max-w-5xl mt-12 mb-8 z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="relative">
            {/* Glowing background effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#3673F5]/20 to-[#7ecbff]/20 rounded-2xl blur-xl"></div>
            
            {/* Main container */}
            <div className="relative bg-[#232c3b] rounded-2xl overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#3673F5] via-[#7ecbff] to-[#3673F5] animate-gradient-x"></div>
              
              {/* Content container */}
              <div className="relative bg-[#232c3b] m-[2px] rounded-2xl px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-[#3673F5] to-[#7ecbff] p-2 rounded-xl">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="font-futuristic text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-[#7ecbff] to-white font-bold tracking-wider">
                      {vault.name}
                    </h1>
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#3673F5] to-transparent mt-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Winner Display */}
      {winner && winner !== '0x0000000000000000000000000000000000000000' && (
        <div className="w-full max-w-5xl mb-8 p-6 bg-gradient-to-r from-amber-900/40 to-yellow-900/40 border-2 border-amber-500 rounded-2xl shadow-xl z-10 relative overflow-hidden">
          {/* Animated sparkles overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,215,0,0.1)_0%,_transparent_70%)] animate-pulse"></div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 relative">
            <div className="bg-amber-500/20 p-2 rounded-full mb-2">
              <Trophy className="text-amber-400" size={24} />
            </div>
            <div className="text-center">
              {address && address.toLowerCase() === winner.toLowerCase() ? (
                <>
                  <p className="font-futuristic text-2xl text-amber-300 font-bold mb-1">
                    🎉 You are the Wealthiest! 🎉
                  </p>
                  <p className="font-futuristic text-lg text-amber-200/80">
                    Congratulations on being the richest in this vault!
                  </p>
                </>
              ) : (
                <>
                  <p className="font-futuristic text-xl text-amber-300 font-bold mb-1">
                    Winner is {winner.slice(0, 6)}...{winner.slice(-4)}
                  </p>
                  <p className="font-futuristic text-lg text-amber-200/80 italic">
                    But you're the Richest in Kindness ✨
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl flex flex-col gap-6 z-10">
        {/* Vault Info Box */}
        <div className="bg-[#232c3b] border-2 border-[#3673F5] rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col gap-6">
            {/* Vault Address Section */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#3673F5]/20">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-blue-300 font-futuristic text-lg">Vault Address:</p>
                  <code className="text-white font-mono text-sm">{vault.address.slice(0, 8)}...{vault.address.slice(-6)}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(vault.address);
                      alert('Address copied to clipboard!');
                    }}
                    className="p-1 hover:bg-[#3673F5]/20 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7ecbff]"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Creator and Participants Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#181f2a] rounded-xl p-4 border border-[#3673F5]/20">
                <div className="flex items-center gap-2 mb-2">
                  <User className="text-[#3673F5]" size={20} />
                  <span className="text-blue-300 font-futuristic">Creator</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-white font-mono text-sm">{vault.creator.slice(0, 6)}...{vault.creator.slice(-4)}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(vault.creator);
                      alert('Creator address copied to clipboard!');
                    }}
                    className="p-1 hover:bg-[#3673F5]/20 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7ecbff]"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </button>
                </div>
              </div>

              <div className="bg-[#181f2a] rounded-xl p-4 border border-[#3673F5]/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-[#3673F5]" size={20} />
                  <span className="text-blue-300 font-futuristic">Participants</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-green-900/40 text-green-300 px-3 py-1 rounded-full text-sm font-futuristic">
                    Accepted: {vault.acceptedParticipants.length}
                  </div>
                  <div className="bg-yellow-900/40 text-yellow-300 px-3 py-1 rounded-full text-sm font-futuristic">
                    Pending: {vault.participants.length - vault.acceptedParticipants.length - vault.rejectedParticipants.length}
                  </div>
                  <div className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full text-sm font-futuristic">
                    Rejected: {vault.rejectedParticipants.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Your Status Box */}
        {currentUserParticipant && (
          <div className="bg-[#181f2a] border-2 border-[#3673F5] rounded-2xl p-6 shadow-xl">
            <h3 className="font-futuristic font-bold text-lg text-[#3673F5] mb-3">Your Status: <span className="text-white">{currentUserParticipant.status}</span></h3>
            {currentUserParticipant.status === "Invited" && (
              <div className="space-x-3">
                <button onClick={handleAcceptInvitation} disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 font-futuristic font-bold shadow-neon">{submitting ? "Processing..." : "Accept Invitation"}</button>
                <button onClick={handleRejectInvitation} disabled={submitting} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 font-futuristic font-bold shadow-neon">{submitting ? "Processing..." : "Reject Invitation"}</button>
              </div>
            )}
            {currentUserParticipant.status === "Accepted" && !currentUserParticipant.hasSubmittedWealth && (
              <div className="space-y-3 mt-2">
                <input type="number" value={wealthInput} onChange={e => setWealthInput(e.target.value)} placeholder="Enter wealth..." className="w-full px-3 py-2 border rounded bg-[#181f2a] border-[#3673F5] text-white font-futuristic placeholder-[#b3e0ff]" />
                <button onClick={handleSubmitWealth} disabled={submitting} className="bg-[#3673F5] text-[#181f2a] px-4 py-2 rounded hover:bg-blue-700 hover:text-white disabled:opacity-50 font-futuristic font-bold shadow-neon w-full">{submitting ? "Submitting..." : "Submit Wealth"}</button>
              </div>
            )}
            {currentUserParticipant.status === "Accepted" && currentUserParticipant.hasSubmittedWealth && <p className="text-green-400 font-futuristic mt-2">✅ You've submitted your wealth.</p>}
          </div>
        )}
        {/* Participants Box */}
        <div className="bg-[#232c3b] border-2 border-blue-500 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-futuristic font-bold text-white mb-4">Participants</h3>
          <div className="space-y-2">
            {participantDetails.map((p, i) => (
              <div key={i} className="flex justify-between bg-[#181f2a] p-3 rounded-lg border border-[#3673F5] items-center">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm text-white">{p.address.slice(0,6)}…{p.address.slice(-4)}</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(p.address);
                        alert('Address copied to clipboard!');
                      }}
                      className="p-1 hover:bg-[#3673F5]/20 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7ecbff]"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                  </div>
                  {p.address.toLowerCase() === vault.creator.toLowerCase() && <span className="bg-purple-900 text-purple-300 text-xs px-2 py-1 rounded-full font-futuristic">Creator</span>}
                  {p.address.toLowerCase() === address?.toLowerCase() && <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded-full font-futuristic">You</span>}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-futuristic ${p.status==="Accepted"?"bg-green-900 text-green-300":p.status==="Rejected"?"bg-red-900 text-red-300":"bg-yellow-900 text-yellow-300"}`}>{p.status}</span>
                  {p.status==="Accepted" && <span className={`px-2 py-1 rounded text-xs font-futuristic ${p.hasSubmittedWealth?"bg-blue-900 text-blue-300":"bg-gray-800 text-gray-400"}`}>{p.hasSubmittedWealth?"Submitted":"Pending"}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Reveal/Status Box */}
        <div className="bg-[#181f2a] border-2 border-[#3673F5] rounded-2xl p-6 shadow-xl text-center">
          {!allInvitationsResolved ? (
            <p className="text-blue-300 font-futuristic">Waiting for all participants to respond…</p>
          ) : !allAcceptedSubmitted ? (
            <p className="text-blue-300 font-futuristic">Waiting for all accepted participants…</p>
          ) : (
            <button onClick={handleDeclareRichest} disabled={submitting || userStatus!="Accepted"} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 px-8 rounded-lg hover:scale-105 disabled:opacity-50 font-futuristic font-bold shadow-neon">{submitting?"Processing...":"🏆 Reveal Richest"}</button>
          )}
          {userStatus!="Accepted" && allInvitationsResolved && allAcceptedSubmitted && <p className="text-sm text-blue-300 mt-2 font-futuristic">Only accepted participants can reveal.</p>}
        </div>
      </div>
    </div>
  );
}
