// src/app/profile/page.js  (or wherever your Profile component lives)

'use client';

import { Wallet } from 'lucide-react';
import EncryptedTokenInterface from '@/components/encrypted-token-ineterface';
import EncryptedSend from '@/components/encrypted-send';

export default function Profile() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Wallet className="text-blue-400" />
            Encrypted Tokens
          </h1>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 place-items-start gap-6 mt-32">
          <EncryptedTokenInterface />
          <EncryptedSend />
        </div>
      </div>
    </div>
  );
}
