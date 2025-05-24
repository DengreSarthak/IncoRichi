'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, PlusCircle, XCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { writeContract, simulateContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { config } from '@/utils/config'
import { RichVaultFactoryAbi } from '@/utils/contractABI/RichVaultFactory'
import { motion } from 'framer-motion'

export default function CreateRoomPage() {
  const FACTORY_CHAIN = 84532 // Base Sepolia
  const FACTORY_ADDRESS = '0xe147994f9064dc73a3f72dbf78704de9e6951623'
  const EXPLORER = 'https://sepolia.basescan.org'

  const { address, isConnected } = useAccount()
  const [roomName, setRoomName] = useState('')
  const [participants, setParticipants] = useState([''])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState('')

  const addParticipant = () => setParticipants(p => [...p, ''])
  const removeParticipant = i => setParticipants(p => p.filter((_, idx) => idx !== i))
  const updateParticipant = (i, v) => setParticipants(p => p.map((x, idx) => idx === i ? v : x))

  const validateInputs = () => {
    const newErrors = {}
    if (!roomName.trim()) newErrors.name = 'Room name is required'
    const validList = participants.filter(a => a.trim())
    if (!validList.length) newErrors.participants = 'Add at least one participant'
    else if (validList.some(a => !/^0x[a-fA-F0-9]{40}$/.test(a)))
      newErrors.participants = 'Invalid address format'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createRoom = async () => {
    if (!isConnected) return alert('Connect your wallet!')
    if (!validateInputs()) return
    try {
      setLoading(true)
      const validList = participants.filter(a => a.trim())
      await simulateContract(config, {
        address: FACTORY_ADDRESS,
        abi: RichVaultFactoryAbi,
        functionName: 'createVault',
        args: [roomName, validList],
        account: address,
        chainId: FACTORY_CHAIN,
      })
      const hash = await writeContract(config, {
        address: FACTORY_ADDRESS,
        abi: RichVaultFactoryAbi,
        functionName: 'createVault',
        args: [roomName, validList],
        account: address,
        chainId: FACTORY_CHAIN,
      })
      setTxHash(hash)
      alert(`Room created! Tx: ${hash}`)
    } catch (err) {
      console.error(err)
      alert(err.message || 'Error creating room')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181f2a]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Sparkles className="text-neon-green mx-auto mb-4" size={48} />
          <h1 className="font-futuristic text-4xl text-white drop-shadow-glow">Connect Your Wallet</h1>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden p-4" style={{ background: '#181f2a' }}>
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)'}} />
      
      {/* Header */}
      <header className="flex items-center justify-center w-full max-w-5xl mt-12 mb-8 z-10">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center gap-4 bg-[#232c3b] px-12 py-4 rounded-lg border border-emerald-500/20">
            <div className="flex flex-col">
              <h1 className="font-futuristic text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400 font-bold tracking-wider px-4">
                Create New Room
              </h1>
              <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500/50 to-transparent mt-1"></div>
            </div>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-2xl z-10"
      >
        <div className="bg-[#232c3b] border-2 border-[#3673F5] rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col gap-6">
            {/* Room Name Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#3673F5]" size={20} />
                <span className="text-blue-300 font-futuristic">Room Name</span>
              </div>
              <Input
                placeholder="Enter room name..."
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                className={`w-full bg-[#181f2a] border-2 ${errors.name ? 'border-red-500' : 'border-[#3673F5]'} placeholder-[#b3e0ff] text-white font-futuristic text-lg px-4 py-6 rounded-lg focus:ring-2 focus:ring-[#3673F5] transition-all`}
              />
              {errors.name && <p className="text-xs text-red-400 font-bold">{errors.name}</p>}
            </div>

            {/* Participants Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Users className="text-[#3673F5]" size={20} />
                <span className="text-blue-300 font-futuristic">Participants</span>
              </div>
              
              <div className="space-y-4">
                {participants.map((addr, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder="0x..."
                      value={addr}
                      onChange={e => updateParticipant(i, e.target.value)}
                      className={`flex-1 bg-[#181f2a] border-2 ${errors.participants ? 'border-red-500' : 'border-[#3673F5]'} placeholder-[#b3e0ff] text-white font-futuristic text-lg px-4 py-6 rounded-lg focus:ring-2 focus:ring-[#3673F5] transition-all`}
                    />
                    {participants.length > 1 && (
                      <button 
                        onClick={() => removeParticipant(i)} 
                        className="p-2 hover:bg-[#3673F5]/20 rounded-lg transition-colors"
                      >
                        <XCircle className="text-red-400" size={24} />
                      </button>
                    )}
                  </motion.div>
                ))}
                {errors.participants && <p className="text-xs text-red-400 font-bold">{errors.participants}</p>}
                
                <button 
                  onClick={addParticipant}
                  className="w-full flex items-center justify-center gap-2 bg-[#181f2a] border-2 border-[#3673F5] text-[#7ecbff] px-4 py-3 rounded-lg hover:bg-[#3673F5]/20 transition-colors font-futuristic"
                >
                  <PlusCircle size={20} /> Add Participant
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={createRoom}
              disabled={loading}
              className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-green-400 text-white px-6 py-4 rounded-lg hover:scale-105 disabled:opacity-50 font-futuristic font-bold shadow-neon flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating Room...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Create Room
                </>
              )}
            </button>

            {txHash && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.5 }} 
                className="text-center"
              >
                <Link href={`${EXPLORER}/tx/${txHash}`} target="_blank" className="text-emerald-300 hover:text-emerald-400 transition-colors">
                  <p className="text-sm font-futuristic">View Transaction on Explorer</p>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}