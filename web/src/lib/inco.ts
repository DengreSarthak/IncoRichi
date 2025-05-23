import { Inco } from '@inco/lightning';

// Contract ABIs
const RichVaultFactoryABI = [
  "function createVault(string name, address[] participants) external returns (address)",
  "function getCreatedVaults(address user) external view returns (address[])",
  "function getUserVaults(address user) external view returns (address[])",
  "function vaults(uint256) external view returns (address vaultAddress, string name, address creator)"
];

const RichVaultABI = [
  "function vaultName() external view returns (string)",
  "function vaultCreator() external view returns (address)",
  "function getParticipants() external view returns (address[])",
  "function getAccepted() external view returns (address[])",
  "function getRejected() external view returns (address[])",
  "function status(address) external view returns (uint8)",
  "function acceptInvitation() external",
  "function rejectInvitation() external",
  "function submitEncryptedWealth(bytes wealthInput) external",
  "function declareRichest() external returns (uint256 requestId, uint256 richestHandle)"
];

// Initialize Inco SDK
export const inco = new Inco({
  network: process.env.NEXT_PUBLIC_INCO_NETWORK || 'testnet',
  rpcUrl: process.env.NEXT_PUBLIC_INCO_RPC_URL,
});

// Contract addresses - replace with your deployed contract addresses
export const RICH_VAULT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_RICH_VAULT_FACTORY_ADDRESS;

// Contract instances
export const getRichVaultFactory = () => {
  return inco.getContract(RICH_VAULT_FACTORY_ADDRESS!, RichVaultFactoryABI);
};

export const getRichVault = (address: string) => {
  return inco.getContract(address, RichVaultABI);
};

// Helper functions
export const getVaultStatus = (status: number) => {
  switch (status) {
    case 0: return 'Not Invited';
    case 1: return 'Invited';
    case 2: return 'Accepted';
    case 3: return 'Rejected';
    default: return 'Unknown';
  }
};

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}; 