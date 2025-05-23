import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getRichVaultFactory, getRichVault, formatAddress, getVaultStatus } from '@/lib/inco';

export interface VaultData {
  address: string;
  name: string;
  creator: string;
  participants: string[];
  status: string;
}

export function useVaults() {
  const { address } = useAccount();
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVaults = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      const factory = getRichVaultFactory();
      
      // Get both created and user vaults
      const [createdVaults, userVaults] = await Promise.all([
        factory.getCreatedVaults(address),
        factory.getUserVaults(address)
      ]);

      // Combine and deduplicate vault addresses
      const uniqueVaults = [...new Set([...createdVaults, ...userVaults])];
      
      // Fetch details for each vault
      const vaultDetails = await Promise.all(
        uniqueVaults.map(async (vaultAddress) => {
          const vault = getRichVault(vaultAddress);
          const [name, creator, participants] = await Promise.all([
            vault.vaultName(),
            vault.vaultCreator(),
            vault.getParticipants()
          ]);

          const status = await vault.status(address);
          
          return {
            address: vaultAddress,
            name,
            creator: formatAddress(creator),
            participants: participants.map(formatAddress),
            status: getVaultStatus(Number(status))
          };
        })
      );

      setVaults(vaultDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vaults');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults();
  }, [address]);

  const acceptInvitation = async (vaultAddress: string) => {
    try {
      const vault = getRichVault(vaultAddress);
      const tx = await vault.acceptInvitation();
      await tx.wait();
      await fetchVaults(); // Refresh vault data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    }
  };

  const submitWealth = async (vaultAddress: string, wealthInput: string) => {
    try {
      const vault = getRichVault(vaultAddress);
      const tx = await vault.submitEncryptedWealth(wealthInput);
      await tx.wait();
      await fetchVaults(); // Refresh vault data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit wealth');
    }
  };

  const declareRichest = async (vaultAddress: string) => {
    try {
      const vault = getRichVault(vaultAddress);
      const tx = await vault.declareRichest();
      await tx.wait();
      await fetchVaults(); // Refresh vault data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to declare richest');
    }
  };

  return {
    vaults,
    loading,
    error,
    acceptInvitation,
    submitWealth,
    declareRichest,
    refreshVaults: fetchVaults
  };
} 