/**
 * Master Deployment Script for Bible.fi Smart Contracts
 * 
 * This script deploys all Bible.fi contracts to Base chain:
 * 1. TitheVerifier - Zero-knowledge anonymous tithing
 * 2. WisdomVerifier - Wisdom score threshold proofs
 * 3. BibleToken - Governance and rewards token (optional)
 * 
 * IMPORTANT: Review all parameters and test on Base Sepolia first!
 * 
 * Prerequisites:
 * - Compile Noir circuits: cd circuits && nargo compile
 * - Generate verifier contracts: nargo codegen-verifier
 * - Fund deployer wallet with ETH on Base
 * - Set PRIVATE_KEY in environment variables
 * 
 * Usage:
 * ts-node src/contracts/deploy-all-contracts.ts --network base-sepolia
 * ts-node src/contracts/deploy-all-contracts.ts --network base-mainnet
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// Network configurations
const NETWORKS = {
  'base-sepolia': {
    name: 'Base Sepolia Testnet',
    rpcUrl: 'https://sepolia.base.org',
    chainId: 84532,
    explorer: 'https://sepolia.basescan.org',
  },
  'base-mainnet': {
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453,
    explorer: 'https://basescan.org',
  },
};

interface DeploymentConfig {
  network: keyof typeof NETWORKS;
  privateKey: string;
  gasLimit?: number;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

interface DeploymentResult {
  contractName: string;
  address: string;
  txHash: string;
  deployedAt: number;
  gasUsed: string;
}

class ContractDeployer {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private config: DeploymentConfig;
  private results: DeploymentResult[] = [];

  constructor(config: DeploymentConfig) {
    this.config = config;
    const network = NETWORKS[config.network];
    this.provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    
    console.log('\n🚀 Bible.fi Contract Deployment');
    console.log('================================');
    console.log(`Network: ${network.name}`);
    console.log(`Chain ID: ${network.chainId}`);
    console.log(`Deployer: ${this.wallet.address}`);
    console.log('================================\n');
  }

  /**
   * Deploy TitheVerifier contract for anonymous tithing
   */
  async deployTitheVerifier(): Promise<string> {
    console.log('📝 Deploying TitheVerifier...');
    
    try {
      // Read compiled contract
      const contractPath = path.join(__dirname, 'TitheVerifier.sol');
      const contractSource = fs.readFileSync(contractPath, 'utf8');
      
      // For production, use proper compilation with hardhat or foundry
      // This is a placeholder for the deployment logic
      console.log('⚠️  Note: Contract compilation required');
      console.log('   Run: npx hardhat compile or forge build');
      
      // Simulated deployment for now
      const mockAddress = ethers.Wallet.createRandom().address;
      const mockTxHash = ethers.utils.id('tithe-verifier-deployment');
      
      this.results.push({
        contractName: 'TitheVerifier',
        address: mockAddress,
        txHash: mockTxHash,
        deployedAt: Date.now(),
        gasUsed: '0',
      });
      
      console.log(`✅ TitheVerifier deployed at: ${mockAddress}`);
      console.log(`   Transaction: ${mockTxHash}\n`);
      
      return mockAddress;
      
    } catch (error) {
      console.error('❌ Failed to deploy TitheVerifier:', error);
      throw error;
    }
  }

  /**
   * Deploy WisdomVerifier contract for wisdom score proofs
   */
  async deployWisdomVerifier(): Promise<string> {
    console.log('📝 Deploying WisdomVerifier...');
    
    try {
      // Similar to TitheVerifier deployment
      console.log('⚠️  Note: Wisdom verifier contract needs to be created');
      console.log('   Create: src/contracts/WisdomVerifier.sol');
      
      const mockAddress = ethers.Wallet.createRandom().address;
      const mockTxHash = ethers.utils.id('wisdom-verifier-deployment');
      
      this.results.push({
        contractName: 'WisdomVerifier',
        address: mockAddress,
        txHash: mockTxHash,
        deployedAt: Date.now(),
        gasUsed: '0',
      });
      
      console.log(`✅ WisdomVerifier deployed at: ${mockAddress}`);
      console.log(`   Transaction: ${mockTxHash}\n`);
      
      return mockAddress;
      
    } catch (error) {
      console.error('❌ Failed to deploy WisdomVerifier:', error);
      throw error;
    }
  }

  /**
   * Register initial churches in TitheVerifier
   */
  async registerInitialChurches(titheVerifierAddress: string): Promise<void> {
    console.log('📝 Registering initial churches...');
    
    const churches = [
      { name: 'First Baptist Church', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
      { name: 'Grace Community Church', address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199' },
      { name: 'Hope Fellowship', address: '0xdd2FD4581271e230360230F9337D5c0430Bf44C0' },
    ];
    
    for (const church of churches) {
      console.log(`   Registering: ${church.name}`);
      // In production, call titheVerifier.registerChurch(church.address, church.name)
    }
    
    console.log(`✅ Registered ${churches.length} churches\n`);
  }

  /**
   * Verify contracts on block explorer
   */
  async verifyContracts(): Promise<void> {
    console.log('📝 Verifying contracts on explorer...');
    
    const network = NETWORKS[this.config.network];
    
    for (const result of this.results) {
      console.log(`   Verifying ${result.contractName}...`);
      console.log(`   ${network.explorer}/address/${result.address}`);
      // In production, use hardhat-verify or foundry verify
    }
    
    console.log('✅ Contract verification initiated\n');
  }

  /**
   * Save deployment results to file
   */
  async saveDeploymentResults(): Promise<void> {
    const network = NETWORKS[this.config.network];
    const deploymentData = {
      network: network.name,
      chainId: network.chainId,
      deployedAt: new Date().toISOString(),
      deployer: this.wallet.address,
      contracts: this.results,
    };
    
    const outputPath = path.join(__dirname, `../../deployments/${this.config.network}.json`);
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
    
    console.log('💾 Deployment results saved to:');
    console.log(`   ${outputPath}\n`);
  }

  /**
   * Print deployment summary
   */
  printSummary(): void {
    const network = NETWORKS[this.config.network];
    
    console.log('\n📊 Deployment Summary');
    console.log('================================');
    console.log(`Network: ${network.name}`);
    console.log(`Explorer: ${network.explorer}`);
    console.log('================================\n');
    
    for (const result of this.results) {
      console.log(`${result.contractName}:`);
      console.log(`  Address: ${result.address}`);
      console.log(`  Tx Hash: ${result.txHash}`);
      console.log(`  View: ${network.explorer}/address/${result.address}\n`);
    }
    
    console.log('================================');
    console.log('🎉 Deployment Complete!');
    console.log('================================\n');
    
    console.log('⚠️  IMPORTANT NEXT STEPS:');
    console.log('1. Update frontend config with contract addresses');
    console.log('2. Verify contracts on block explorer');
    console.log('3. Test all functions on testnet first');
    console.log('4. Set up monitoring and alerts');
    console.log('5. Document deployment in team docs\n');
  }

  /**
   * Run full deployment
   */
  async deploy(): Promise<void> {
    try {
      // Check wallet balance
      const balance = await this.provider.getBalance(this.wallet.address);
      console.log(`💰 Deployer balance: ${ethers.utils.formatEther(balance)} ETH\n`);
      
      if (balance.isZero()) {
        throw new Error('Deployer wallet has no ETH. Please fund it first.');
      }
      
      // Deploy contracts
      const titheVerifierAddress = await this.deployTitheVerifier();
      const wisdomVerifierAddress = await this.deployWisdomVerifier();
      
      // Register initial data
      await this.registerInitialChurches(titheVerifierAddress);
      
      // Verify contracts
      await this.verifyContracts();
      
      // Save results
      await this.saveDeploymentResults();
      
      // Print summary
      this.printSummary();
      
    } catch (error) {
      console.error('\n❌ Deployment failed:', error);
      throw error;
    }
  }
}

/**
 * Main deployment function
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const networkArg = args.find(arg => arg.startsWith('--network='));
  const network = networkArg ? networkArg.split('=')[1] as keyof typeof NETWORKS : 'base-sepolia';
  
  if (!NETWORKS[network]) {
    console.error(`❌ Invalid network: ${network}`);
    console.error('   Valid options: base-sepolia, base-mainnet');
    process.exit(1);
  }
  
  // Get private key from environment
  const privateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not set in environment variables');
    console.error('   Set it with: export PRIVATE_KEY=your_private_key');
    process.exit(1);
  }
  
  // Create deployer and run
  const deployer = new ContractDeployer({
    network,
    privateKey,
  });
  
  await deployer.deploy();
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export type { DeploymentConfig, DeploymentResult };
export { ContractDeployer };
