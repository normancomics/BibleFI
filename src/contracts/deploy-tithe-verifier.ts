/**
 * Deployment script for TitheVerifier contract
 * Deploy to Base Sepolia (testnet) or Base Mainnet
 * 
 * NOTE: This uses ethers v5 syntax. Upgrade to v6 for production.
 */

import { ethers } from 'ethers';

// Contract deployment configuration
export const DEPLOYMENT_CONFIG = {
  baseSepolia: {
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
  },
  baseMainnet: {
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
  },
};

/**
 * Deploy TitheVerifier contract to Base chain
 * 
 * Usage:
 * 1. Set PRIVATE_KEY in .env
 * 2. Run: npx ts-node src/contracts/deploy-tithe-verifier.ts
 */
export async function deployTitheVerifier(network: 'baseSepolia' | 'baseMainnet') {
  const config = DEPLOYMENT_CONFIG[network];
  
  console.log(`🚀 Deploying TitheVerifier to ${network}...`);
  console.log(`   Chain ID: ${config.chainId}`);
  console.log(`   RPC: ${config.rpcUrl}`);
  
  // Initialize provider and wallet (ethers v5)
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not set in environment');
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  
  console.log(`   Deployer: ${wallet.address}`);
  console.log(`   Balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  // Load contract ABI and bytecode
  // In production, import from compiled artifacts
  const contractArtifact = {
    abi: [
      "constructor()",
      "function registerChurch(address churchAddress, string calldata churchName) external",
      "function verifyAndRecordTithe(bytes calldata proof, uint256 minThreshold, bytes32 churchId, bytes32 commitment) external payable",
      "function getChurch(bytes32 churchId) external view returns (tuple(address paymentAddress, string name, bool isVerified, uint256 totalTithesReceived, uint256 registrationTime))",
      "event AnonymousTitheVerified(bytes32 indexed commitment, bytes32 indexed churchId, uint256 minThreshold, uint256 timestamp)",
      "event ChurchRegistered(bytes32 indexed churchId, address indexed churchAddress, string churchName, uint256 timestamp)"
    ],
    bytecode: "0x" // Add actual bytecode here after compiling with Hardhat/Foundry
  };
  
  // Deploy contract
  console.log('\n📝 Deploying contract...');
  const factory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    wallet
  );
  
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log('\n✅ Contract deployed!');
  console.log(`   Address: ${contractAddress}`);
  console.log(`   Explorer: ${config.explorerUrl}/address/${contractAddress}`);
  
  // Verify on Basescan (optional)
  console.log('\n📋 To verify contract on Basescan:');
  console.log(`   npx hardhat verify --network ${network} ${contractAddress}`);
  
  return {
    address: contractAddress,
    contract,
    network,
  };
}

/**
 * Register churches after deployment
 */
export async function registerChurches(
  contractAddress: string,
  network: 'baseSepolia' | 'baseMainnet',
  churches: Array<{ address: string; name: string }>
) {
  const config = DEPLOYMENT_CONFIG[network];
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  const contract = new ethers.Contract(
    contractAddress,
    [
      "function registerChurch(address churchAddress, string calldata churchName) external",
    ],
    wallet
  );
  
  console.log(`\n⛪ Registering ${churches.length} churches...`);
  
  for (const church of churches) {
    console.log(`   - ${church.name}`);
    const tx = await contract.registerChurch(church.address, church.name);
    await tx.wait();
    console.log(`     ✅ Registered (tx: ${tx.hash})`);
  }
  
  console.log('\n✅ All churches registered!');
}

// Example usage (uncomment to run)
/*
async function main() {
  // Deploy to Base Sepolia testnet
  const deployment = await deployTitheVerifier('baseSepolia');
  
  // Register some test churches
  await registerChurches(deployment.address, 'baseSepolia', [
    {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      name: 'First Baptist Church'
    },
    {
      address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      name: 'Grace Community Church'
    },
    {
      address: '0xdd2FD4581271e230360230F9337D5c0430Bf44C0',
      name: 'Hope Fellowship'
    },
  ]);
}

main().catch(console.error);
*/
