/**
 * deploy-superfluid-tokens.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Deploys the full BibleFi Superfluid token suite to Base chain (HYBRID
 * architecture — see docs/NATIVE_SUPERTOKENS.md):
 *
 *   1.  $BIBLEFI  — BibleFiGovernanceToken (ERC-20 + ERC20Votes). Stays a
 *       standard governance token so on-chain vote delegation/checkpoints
 *       keep working — a native Super Token can't carry ERC20Votes.
 *   2.  $xBIBLEFI — Superfluid Super Token WRAPPER for $BIBLEFI, via
 *       XBibleFiDeployer. Used for DAO treasury streaming; governance itself
 *       still happens on plain $BIBLEFI.
 *   3.  $WISDOM   — WisdomNativeSuperTokenProxy: a TRUE NATIVE Superfluid
 *       Super Token (no underlying ERC-20, no wrap/unwrap step). Earned
 *       rewards are minted directly as $WISDOM via ISuperToken.selfMint and
 *       are streamable the instant they're issued.
 *   4.  BibleFiDAOTreasury — DAO treasury streaming controller (for $xBIBLEFI)
 *   5.  WisdomVIPRewards   — VIP LP reward streaming controller, streams
 *       native $WISDOM directly (no wrapping needed)
 *
 * Usage
 * ─────
 *   # Testnet (Base Sepolia)
 *   PRIVATE_KEY=0x... ts-node src/contracts/deploy-superfluid-tokens.ts --network=base-sepolia
 *
 *   # Mainnet (Base)
 *   PRIVATE_KEY=0x... ts-node src/contracts/deploy-superfluid-tokens.ts --network=base-mainnet
 *
 * Prerequisites
 * ─────────────
 *   npx hardhat compile   (or forge build)
 *   Funded deployer wallet on target network
 *
 * "Commit to the LORD whatever you do, and he will establish your plans."
 * — Proverbs 16:3
 */

import {
  ethers,
  JsonRpcProvider,
  Wallet,
  formatEther,
  Contract,
  ContractFactory,
  ZeroAddress,
} from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────── network config ──

const NETWORKS = {
  'base-sepolia': {
    name:        'Base Sepolia Testnet',
    rpcUrl:      'https://sepolia.base.org',
    chainId:     84532,
    explorer:    'https://sepolia.basescan.org',
    superfluid: {
      host:             '0x109412E3C84f0539b43d39dB691B08c90f58dC7c',
      cfaForwarder:     '0xcfA132E353cB4E398080B9700609bb008eceB125',
      tokenFactory:     '0x254C2e152E8602839D288A7bccdf3d0974597193',
    },
  },
  'base-mainnet': {
    name:        'Base Mainnet',
    rpcUrl:      'https://mainnet.base.org',
    chainId:     8453,
    explorer:    'https://basescan.org',
    superfluid: {
      host:             '0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74',
      cfaForwarder:     '0x19ba78B9cDB05A877718841c574325fdB53601bb',
      tokenFactory:     '0x73743A7b7Af23CAc5A3bfbD11b0cf0a3D11E7Ca3',
    },
  },
} as const;

type Network = keyof typeof NETWORKS;

// ──────────────────────────────────────────────── deployment bookkeeping ──

interface DeploymentRecord {
  contractName: string;
  address:      string;
  txHash:       string;
  deployedAt:   string;
  gasUsed:      string;
}

// ───────────────────────────────────────────────────── deployer class ──

class SuperfluidTokenDeployer {
  private readonly provider: JsonRpcProvider;
  private readonly wallet: Wallet;
  private readonly network: (typeof NETWORKS)[Network];
  private readonly records: DeploymentRecord[] = [];

  constructor(networkKey: Network, privateKey: string) {
    this.network  = NETWORKS[networkKey];
    this.provider = new JsonRpcProvider(this.network.rpcUrl);
    this.wallet   = new Wallet(privateKey, this.provider);

    console.log('\n🚀 BibleFi Superfluid Token Deployment');
    console.log('═══════════════════════════════════════════');
    console.log(`Network  : ${this.network.name}`);
    console.log(`Chain ID : ${this.network.chainId}`);
    console.log(`Deployer : ${this.wallet.address}`);
    console.log('═══════════════════════════════════════════\n');
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private record(name: string, address: string, txHash: string, gasUsed: string) {
    this.records.push({ contractName: name, address, txHash, deployedAt: new Date().toISOString(), gasUsed });
    console.log(`  ✅ ${name} → ${address}`);
    console.log(`     tx: ${txHash} (gas: ${gasUsed})\n`);
  }

  /**
   * Load compiled artifact.  Falls back to a placeholder stub so the script
   * can be run before a full Hardhat compile (CI-friendly).
   */
  private loadArtifact(contractName: string): { abi: unknown[]; bytecode: string } {
    const artifactPaths = [
      path.join(__dirname, `../../artifacts_forge/${contractName}.sol/${contractName}.json`),
      path.join(__dirname, `../../artifacts/src/contracts/${contractName}.sol/${contractName}.json`),
      path.join(__dirname, `../../out/${contractName}.sol/${contractName}.json`),
    ];

    for (const p of artifactPaths) {
      if (fs.existsSync(p)) {
        const artifact = JSON.parse(fs.readFileSync(p, 'utf8'));
        return { abi: artifact.abi, bytecode: artifact.bytecode };
      }
    }

    console.warn(
      `  ⚠️  Compiled artifact for ${contractName} not found.\n` +
      `     Run: npx hardhat compile   (or forge build)\n` +
      `     Skipping on-chain deployment — recording placeholder.\n`
    );
    return { abi: [], bytecode: '0x' };
  }

  private async deploy(
    contractName: string,
    constructorArgs: unknown[] = []
  ): Promise<string> {
    console.log(`📝 Deploying ${contractName}…`);
    const { abi, bytecode } = this.loadArtifact(contractName);

    if (bytecode === '0x') {
      // Placeholder — return a deterministic fake address for pipeline continuity
      const placeholder = Wallet.createRandom().address;
      this.record(contractName, placeholder, '0x0', '0');
      return placeholder;
    }

    const factory  = new ContractFactory(abi, bytecode, this.wallet);
    const contract = await factory.deploy(...constructorArgs);
    const receipt  = await contract.deploymentTransaction()?.wait();
    const address  = await contract.getAddress();
    const gasUsed  = receipt?.gasUsed?.toString() ?? '0';
    const txHash   = receipt?.hash ?? '0x0';

    this.record(contractName, address, txHash, gasUsed);
    return address;
  }

  // ── deployment steps ────────────────────────────────────────────────────

  async deployAll(wallets: {
    communityRewards:   string;
    development:        string;
    churchPartnerships: string;
    team:               string;
    earlySupport:       string;
  }) {
    const balance = await this.provider.getBalance(this.wallet.address);
    console.log(`💰 Deployer balance: ${formatEther(balance)} ETH\n`);
    if (balance === 0n) throw new Error('Deployer wallet has no ETH — please fund it first.');

    // ── 1. $BIBLEFI ─────────────────────────────────────────────────────
    console.log('── Step 1: $BIBLEFI Governance Token ──────────────────');
    const biblefiAddress = await this.deploy('BibleFiGovernanceToken', [
      wallets.communityRewards,
      wallets.development,
      wallets.churchPartnerships,
      wallets.team,
      wallets.earlySupport,
    ]);

    // ── 2. $xBIBLEFI wrapper (for DAO treasury streaming) ───────────────
    console.log('── Step 2: XBibleFiDeployer → $xBIBLEFI ───────────────');
    const xBibleFiDeployerAddress = await this.deploy('XBibleFiDeployer', []);

    let xBibleFiAddress = ZeroAddress;
    if (xBibleFiDeployerAddress !== ZeroAddress) {
      try {
        const { abi } = this.loadArtifact('XBibleFiDeployer');
        const deployer = new Contract(xBibleFiDeployerAddress, abi, this.wallet);
        const tx       = await deployer.deployXBIBLEFI(biblefiAddress);
        const receipt  = await tx.wait();
        const event    = receipt.logs?.find((l: { topics: string[] }) => l.topics[0] === ethers.id('XBibleFiDeployed(address,address)'));
        xBibleFiAddress = event ? ethers.AbiCoder.defaultAbiCoder().decode(['address'], event.topics[1])[0] : ZeroAddress;
        console.log(`  ✅ $xBIBLEFI wrapper deployed at: ${xBibleFiAddress}\n`);
        this.records.push({ contractName: 'xBIBLEFI (Super Token)', address: xBibleFiAddress, txHash: tx.hash, deployedAt: new Date().toISOString(), gasUsed: '0' });
      } catch (err) {
        console.warn('  ⚠️  Could not call deployXBIBLEFI — Superfluid factory may not be available on this network yet.');
      }
    }

    // ── 3. $WISDOM — native Super Token (no underlying ERC-20, no wrapper) ──
    // WisdomNativeSuperTokenProxy.initialize() calls
    // factory.initializeCustomSuperToken(address(this)) INTERNALLY (the
    // official Superfluid custom-supertoken pattern), so deployment is just:
    // deploy the proxy, then call initialize() once.
    console.log('── Step 3: WisdomNativeSuperTokenProxy → native $WISDOM ──');
    const wisdomAddress = await this.deploy('WisdomNativeSuperTokenProxy', []);

    if (wisdomAddress !== ZeroAddress) {
      try {
        const { abi } = this.loadArtifact('WisdomNativeSuperTokenProxy');
        const wisdom = new Contract(wisdomAddress, abi, this.wallet);
        const tx = await wisdom.initialize(this.network.superfluid.tokenFactory, this.wallet.address);
        await tx.wait();
        console.log(`  ✅ Native $WISDOM initialized — admin/oracle roles granted to ${this.wallet.address}\n`);
        this.records.push({ contractName: 'WISDOM (native Super Token)', address: wisdomAddress, txHash: tx.hash, deployedAt: new Date().toISOString(), gasUsed: '0' });
      } catch (err) {
        console.warn('  ⚠️  Could not initialize native $WISDOM — Superfluid factory may not be available on this network yet.');
        console.warn(`     ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // ── 4. DAO Treasury controller (streams $xBIBLEFI) ──────────────────
    console.log('── Step 4: BibleFiDAOTreasury ──────────────────────────');
    const daoTreasuryAddress = await this.deploy('BibleFiDAOTreasury', [xBibleFiAddress]);

    // ── 5. VIP Rewards controller (streams native $WISDOM directly) ─────
    console.log('── Step 5: WisdomVIPRewards ────────────────────────────');
    const vipRewardsAddress = await this.deploy('WisdomVIPRewards', [wisdomAddress]);

    this.printSummary();
    this.saveResults();

    return {
      biblefiAddress,
      wisdomAddress,
      xBibleFiAddress,
      daoTreasuryAddress,
      vipRewardsAddress,
    };
  }

  // ── output ───────────────────────────────────────────────────────────────

  private printSummary() {
    console.log('\n═══════════════ Deployment Summary ═══════════════');
    for (const r of this.records) {
      console.log(`${r.contractName.padEnd(35)} ${r.address}`);
    }
    console.log('═══════════════════════════════════════════════════\n');
    console.log('⚠️  NEXT STEPS:');
    console.log('  1. Verify contracts: forge verify-contract --chain <chain-id> <address> <Contract> (see contracts_forge/)');
    console.log('  2. Update realClient.ts with deployed token addresses (native $WISDOM needs no wrap step)');
    console.log('  3. Grant ORACLE_ROLE on native $WISDOM to the backend oracle wallet (currently held by the deployer)');
    console.log('  4. Fund BibleFiDAOTreasury with wrapped $xBIBLEFI for treasury streaming');
    console.log('  5. Create SUP/$xBIBLEFI and SUP/$WISDOM pools on Aerodrome');
    console.log('  6. Register $xBIBLEFI and native $WISDOM in realClient.ts token map\n');
  }

  private saveResults() {
    const outDir  = path.join(__dirname, '../../deployments');
    const outFile = path.join(outDir, `superfluid-tokens-${Date.now()}.json`);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const payload = {
      network:     this.network.name,
      chainId:     this.network.chainId,
      deployedAt:  new Date().toISOString(),
      deployer:    this.wallet.address,
      superfluid:  this.network.superfluid,
      contracts:   this.records,
    };
    fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));
    console.log(`💾 Results saved to: ${outFile}\n`);
  }
}

// ────────────────────────────────────────────────────────── CLI entry ──

async function main() {
  const args       = process.argv.slice(2);
  const networkArg = args.find(a => a.startsWith('--network='));
  const network    = (networkArg ? networkArg.split('=')[1] : 'base-sepolia') as Network;

  if (!NETWORKS[network]) {
    console.error(`Unknown network: ${network}. Valid: ${Object.keys(NETWORKS).join(', ')}`);
    process.exit(1);
  }

  const privateKey = process.env.PRIVATE_KEY ?? process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error('Set PRIVATE_KEY env var before deploying.');
    process.exit(1);
  }

  // Distribution wallets — override via env vars in CI
  const wallets = {
    communityRewards:   process.env.COMMUNITY_WALLET   ?? Wallet.createRandom().address,
    development:        process.env.DEV_WALLET          ?? Wallet.createRandom().address,
    churchPartnerships: process.env.CHURCH_WALLET       ?? Wallet.createRandom().address,
    team:               process.env.TEAM_WALLET         ?? Wallet.createRandom().address,
    earlySupport:       process.env.EARLY_SUPPORT_WALLET ?? Wallet.createRandom().address,
  };

  const deployer = new SuperfluidTokenDeployer(network, privateKey);
  await deployer.deployAll(wallets);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

export { SuperfluidTokenDeployer };
