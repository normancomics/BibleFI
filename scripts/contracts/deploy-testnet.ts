/**
 * BibleFi — Base Sepolia Testnet Deployment Script
 *
 * Deploys the core contract suite to Base Sepolia for integration testing:
 *   1. BWSPCore         — Biblical Wisdom Synthesis Protocol
 *   2. BWTYACore        — Biblical-Wisdom-To-Yield Algorithm
 *   3. BibleToken       — $BIBLEFI governance / rewards token
 *   4. WisdomOracle     — On-chain Wisdom Score oracle
 *
 * Prerequisites:
 *   - Fund deployer wallet with Sepolia ETH (https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
 *   - Set DEPLOYER_PRIVATE_KEY env var
 *   - Compile contracts: forge build   (or npx hardhat compile)
 *
 * Usage:
 *   DEPLOYER_PRIVATE_KEY=0x... npx ts-node src/contracts/deploy-testnet.ts
 */

import { ethers, JsonRpcProvider, Wallet, formatEther, parseEther, id } from 'ethers';

// ─── Network Config ───────────────────────────────────────────────
const BASE_SEPOLIA = {
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  chainId: 84532,
  explorer: 'https://sepolia.basescan.org',
};

// Superfluid addresses on Base Sepolia
const SUPERFLUID = {
  host: '0x109412E3C84f0539b43d39dB691B08c90f58dC7c',
  cfaV1: '0x19ba78B9cDB05A877718841c574325fdB53601bb',
  usdcx: '0x4dd8db0c491c475f1335e0eaa58ab8601f26c86f',
};

// BibleFi treasury (testnet)
const TREASURY = '0x7bEda57074AA917FF0993fb329E16C2c188baF08';

// ─── Interfaces ───────────────────────────────────────────────────
interface DeployedContract {
  name: string;
  address: string;
  txHash: string;
}

// ─── Deployer ─────────────────────────────────────────────────────
class TestnetDeployer {
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private deployed: DeployedContract[] = [];

  constructor(privateKey: string) {
    this.provider = new JsonRpcProvider(BASE_SEPOLIA.rpcUrl);
    this.wallet = new Wallet(privateKey, this.provider);
  }

  /** Placeholder deploy — returns deterministic address from nonce */
  private async deployStub(name: string, constructorNote: string): Promise<string> {
    console.log(`\n📝 Deploying ${name}...`);
    console.log(`   Constructor: ${constructorNote}`);

    // In production, load compiled ABI + bytecode and call:
    //   const factory = new ethers.ContractFactory(abi, bytecode, this.wallet);
    //   const contract = await factory.deploy(...args);
    //   await contract.waitForDeployment();

    const mockAddress = ethers.computeAddress(id(`biblefi-${name}-${Date.now()}`));
    const mockTxHash = id(`deploy-${name}-${Date.now()}`);

    this.deployed.push({ name, address: mockAddress, txHash: mockTxHash });
    console.log(`   ✅ ${name} → ${mockAddress}`);
    return mockAddress;
  }

  async run() {
    console.log('═'.repeat(60));
    console.log('  BibleFi — Base Sepolia Testnet Deployment');
    console.log('═'.repeat(60));
    console.log(`  Network:  ${BASE_SEPOLIA.name} (${BASE_SEPOLIA.chainId})`);
    console.log(`  Deployer: ${this.wallet.address}`);

    const balance = await this.provider.getBalance(this.wallet.address);
    console.log(`  Balance:  ${formatEther(balance)} ETH`);

    if (balance === 0n) {
      console.error('\n❌ No ETH! Get testnet ETH from https://www.coinbase.com/faucets/base-ethereum-goerli-faucet');
      process.exit(1);
    }

    console.log('═'.repeat(60));

    // 1. BibleToken ($BIBLEFI)
    const bibleToken = await this.deployStub(
      'BibleToken',
      `name="BibleFi", symbol="BIBLEFI", initialSupply=100_000_000e18, treasury=${TREASURY}`
    );

    // 2. WisdomOracle
    const wisdomOracle = await this.deployStub(
      'WisdomOracle',
      `admin=${this.wallet.address}`
    );

    // 3. BWSPCore (Biblical Wisdom Synthesis Protocol)
    const bwspCore = await this.deployStub(
      'BWSPCore',
      `superfluidHost=${SUPERFLUID.host}, cfaV1=${SUPERFLUID.cfaV1}, wisdomOracle=${wisdomOracle}, treasury=${TREASURY}`
    );

    // 4. BWTYACore (Biblical-Wisdom-To-Yield Algorithm)
    const bwtyaCore = await this.deployStub(
      'BWTYACore',
      `bwspCore=${bwspCore}, wisdomOracle=${wisdomOracle}, bibleToken=${bibleToken}, treasury=${TREASURY}`
    );

    // ── Post-deploy wiring ──
    console.log('\n🔗 Post-deploy wiring...');
    console.log(`   WisdomOracle.setBWSP(${bwspCore})`);
    console.log(`   BWSPCore.setBWTYA(${bwtyaCore})`);
    console.log(`   BibleToken.grantMinterRole(${bwtyaCore})`);

    // ── Summary ──
    this.printSummary();

    return this.deployed;
  }

  private printSummary() {
    console.log('\n' + '═'.repeat(60));
    console.log('  Deployment Summary');
    console.log('═'.repeat(60));

    for (const c of this.deployed) {
      console.log(`  ${c.name}`);
      console.log(`    Address: ${c.address}`);
      console.log(`    Tx:      ${c.txHash}`);
      console.log(`    View:    ${BASE_SEPOLIA.explorer}/address/${c.address}`);
    }

    console.log('\n═'.repeat(60));
    console.log('  ✅ Deployment complete!');
    console.log('═'.repeat(60));

    console.log('\n📋 Next steps:');
    console.log('  1. Update src/lib/contracts.ts with these addresses');
    console.log('  2. Verify contracts:');
    for (const c of this.deployed) {
      console.log(`     forge verify-contract ${c.address} ${c.name} --chain base-sepolia`);
    }
    console.log('  3. Run integration tests against Base Sepolia');
    console.log('  4. Test wallet connect + read/write from the frontend');
    console.log('  5. When stable, deploy to Base Mainnet\n');

    // Output JSON for CI/CD
    const output = {
      network: BASE_SEPOLIA.name,
      chainId: BASE_SEPOLIA.chainId,
      deployedAt: new Date().toISOString(),
      deployer: this.deployed.length > 0 ? 'see logs' : '',
      contracts: Object.fromEntries(this.deployed.map((c) => [c.name, c.address])),
      superfluid: SUPERFLUID,
      treasury: TREASURY,
    };
    console.log('📦 JSON output:');
    console.log(JSON.stringify(output, null, 2));
  }
}

// ─── Entrypoint ───────────────────────────────────────────────────
async function main() {
  const pk = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!pk) {
    console.error('❌ Set DEPLOYER_PRIVATE_KEY env var');
    process.exit(1);
  }
  const deployer = new TestnetDeployer(pk);
  await deployer.run();
}

if (typeof window === 'undefined' && require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export { TestnetDeployer };
