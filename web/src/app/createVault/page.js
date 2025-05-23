'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, PlusCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { writeContract, simulateContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { config } from '@/utils/config'
import { RichVaultFactoryAbi } from '@/utils/contractABI/RichVaultFactory'
import { motion } from 'framer-motion'

export default function CreateVaultPage() {
  const FACTORY_CHAIN = 84532 // Base Sepolia
  const FACTORY_ADDRESS = '0xe147994f9064dc73a3f72dbf78704de9e6951623'
  const EXPLORER = 'https://sepolia.basescan.org'

  const { address, isConnected } = useAccount()
  const [vaultName, setVaultName] = useState('')
  const [participants, setParticipants] = useState([''])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState('')

  const addParticipant = () => setParticipants(p => [...p, ''])
  const removeParticipant = i => setParticipants(p => p.filter((_, idx) => idx !== i))
  const updateParticipant = (i, v) => setParticipants(p => p.map((x, idx) => idx === i ? v : x))

  const validateInputs = () => {
    const newErrors = {}
    if (!vaultName.trim()) newErrors.name = 'Vault name is required'
    const validList = participants.filter(a => a.trim())
    if (!validList.length) newErrors.participants = 'Add at least one participant'
    else if (validList.some(a => !/^0x[a-fA-F0-9]{40}$/.test(a)))
      newErrors.participants = 'Invalid address format'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createVault = async () => {
    if (!isConnected) return alert('Connect your wallet!')
    if (!validateInputs()) return
    try {
      setLoading(true)
      const validList = participants.filter(a => a.trim())
      await simulateContract(config, {
        address: FACTORY_ADDRESS,
        abi: RichVaultFactoryAbi,
        functionName: 'createVault',
        args: [vaultName, validList],
        account: address,
        chainId: FACTORY_CHAIN,
      })
      const hash = await writeContract(config, {
        address: FACTORY_ADDRESS,
        abi: RichVaultFactoryAbi,
        functionName: 'createVault',
        args: [vaultName, validList],
        account: address,
        chainId: FACTORY_CHAIN,
      })
      setTxHash(hash)
      alert(`Vault created! Tx: ${hash}`)
    } catch (err) {
      console.error(err)
      alert(err.message || 'Error creating vault')
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
    <div className="relative min-h-screen flex items-center justify-center bg-[#181f2a] overflow-hidden p-4">
      {/* Animated Radial Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#1a2857,_#181f2a)] animate-[pulse_10s_ease-in-out_infinite]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="z-10 w-full max-w-lg"
      >
        <Card className="bg-[#232c3b] border-2 border-[#3673F5] rounded-2xl backdrop-blur-lg shadow-2xl">
          <CardHeader className="text-center pt-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="mx-auto mb-2"
            >
              <Sparkles className="text-[#7ecbff]" size={40} />
            </motion.div>
            <CardTitle className="text-4xl font-futuristic text-white drop-shadow-glow">Create Your Vault</CardTitle>
            <CardDescription className="text-center text-sm text-[#b3e0ff]">
              Securely pool and compare wealth with friends
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 mt-6">
            <Input
              placeholder="Vault Name"
              value={vaultName}
              onChange={e => setVaultName(e.target.value)}
              className={`w-full bg-[#1A2857] border-2 ${errors.name ? 'border-red-500' : 'border-[#3673F5]'} placeholder-[#b3e0ff] text-white font-futuristic text-lg px-4 py-3 rounded-lg focus:ring-2 focus:ring-neon-green transition-all`}
            />
            {errors.name && <p className="text-xs text-red-400 font-bold">{errors.name}</p>}

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
                    className={`flex-1 bg-[#1A2857] border-2 ${errors.participants ? 'border-red-500' : 'border-[#3673F5]'} placeholder-[#b3e0ff] text-white font-futuristic text-lg px-4 py-3 rounded-lg focus:ring-2 focus:ring-neon-green transition-all`}
                  />
                  {participants.length > 1 && (
                    <Button variant="ghost" onClick={() => removeParticipant(i)} className="p-2">
                      <XCircle size={24} />
                    </Button>
                  )}
                </motion.div>
              ))}
              {errors.participants && <p className="text-xs text-red-400 font-bold">{errors.participants}</p>}
              <Button variant="outline" onClick={addParticipant} className="w-full flex items-center justify-center gap-2">
                <PlusCircle size={20} /> Add Participant
              </Button>
            </div>
          </CardContent>

          <CardFooter className="mt-2 pb-6">
            <Button
              onClick={createVault}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white transition-colors font-bold text-lg py-3 w-full flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Submit'}
            </Button>
          </CardFooter>

          {txHash && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mb-6 text-center">
              <Link href={`${EXPLORER}/tx/${txHash}`} target="_blank">
                <p className="text-xs text-white underline">Tx Hash: {txHash}</p>
              </Link>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}