# Zero-Knowledge Tithe Circuit Deployment Guide

## Step 1: Compile Noir Circuits

```bash
# Navigate to circuits directory
cd circuits

# Compile the private_tithe circuit
nargo compile

# Generate Solidity verifier
nargo codegen-verifier
```

This generates:
- `target/private_tithe.json` - Circuit artifact
- `contract/private_tithe/plonk_vk.sol` - Verification key
- `contract/private_tithe/UltraVerifier.sol` - Verifier contract

## Step 2: Deploy Verifier to Base

### Option A: Using Hardhat

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Create hardhat config
npx hardhat init
```

`hardhat.config.ts`:
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 84532,
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 8453,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY!,
      base: process.env.BASESCAN_API_KEY!,
    },
  },
};

export default config;
```

Deploy script `scripts/deploy.ts`:
```typescript
import { ethers } from "hardhat";

async function main() {
  // Deploy UltraVerifier first
  const UltraVerifier = await ethers.getContractFactory("UltraVerifier");
  const verifier = await UltraVerifier.deploy();
  await verifier.waitForDeployment();
  console.log("UltraVerifier deployed to:", await verifier.getAddress());

  // Deploy TitheVerifier
  const TitheVerifier = await ethers.getContractFactory("TitheVerifier");
  const titheVerifier = await TitheVerifier.deploy();
  await titheVerifier.waitForDeployment();
  console.log("TitheVerifier deployed to:", await titheVerifier.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

```bash
# Deploy to Base Sepolia (testnet)
npx hardhat run scripts/deploy.ts --network baseSepolia

# Verify on Basescan
npx hardhat verify --network baseSepolia <VERIFIER_ADDRESS>
npx hardhat verify --network baseSepolia <TITHE_VERIFIER_ADDRESS>
```

### Option B: Using Foundry

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Create Foundry project
forge init --no-commit

# Copy contracts
cp circuits/contract/private_tithe/UltraVerifier.sol src/
cp src/contracts/TitheVerifier.sol src/

# Deploy to Base Sepolia
forge create src/UltraVerifier.sol:UltraVerifier \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY

forge create src/TitheVerifier.sol:TitheVerifier \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY

# Verify
forge verify-contract <ADDRESS> \
  src/UltraVerifier.sol:UltraVerifier \
  --chain-id 84532 \
  --etherscan-api-key $BASESCAN_API_KEY
```

## Step 3: Update Frontend Configuration

Create `src/config/zk.ts`:
```typescript
export const ZK_CONFIG = {
  baseSepolia: {
    ultraVerifier: '0x...', // From deployment
    titheVerifier: '0x...', // From deployment
  },
  baseMainnet: {
    ultraVerifier: '0x...', 
    titheVerifier: '0x...',
  },
};

export function getVerifierAddress(chainId: number): string {
  if (chainId === 84532) return ZK_CONFIG.baseSepolia.titheVerifier;
  if (chainId === 8453) return ZK_CONFIG.baseMainnet.titheVerifier;
  throw new Error(`Unsupported chain: ${chainId}`);
}
```

## Step 4: Copy Circuit Artifact

```bash
# Copy compiled circuit to public folder
cp circuits/target/private_tithe.json public/circuits/
```

Update `zkProofService.ts`:
```typescript
private async loadCircuit(circuitName: string): Promise<any> {
  const response = await fetch(`/circuits/${circuitName}.json`);
  return await response.json();
}
```

## Step 5: Test End-to-End

```bash
# Start development server
npm run dev

# Navigate to Tithe page
# Select "Anonymous (ZK)" tab
# Test proof generation and submission
```

## Step 6: Register Churches

```typescript
import { ethers } from 'ethers';

const titheVerifier = new ethers.Contract(
  TITHE_VERIFIER_ADDRESS,
  TITHE_VERIFIER_ABI,
  signer
);

await titheVerifier.registerChurch(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'First Baptist Church'
);
```

## Production Checklist

- [ ] Compile circuits with `nargo compile`
- [ ] Generate verifier with `nargo codegen-verifier`
- [ ] Deploy UltraVerifier to Base
- [ ] Deploy TitheVerifier to Base
- [ ] Verify contracts on Basescan
- [ ] Copy circuit artifacts to public folder
- [ ] Update ZK_CONFIG with contract addresses
- [ ] Register churches on-chain
- [ ] Test proof generation in production
- [ ] Monitor gas costs (~200k-500k per verification)
- [ ] Set up event listeners for AnonymousTitheVerified

## Gas Optimization

- Batch church registrations
- Use CREATE2 for deterministic addresses
- Consider EIP-4337 for gasless submissions
- Aggregate multiple proofs if possible

## Security Considerations

1. **Commitment Uniqueness**: Each commitment should be unique (includes timestamp/nonce)
2. **Proof Verification**: Always verify proofs client-side before submission
3. **Rate Limiting**: Implement rate limits on proof submissions
4. **Church Verification**: Only verified churches should receive tithes
5. **Emergency Pause**: Admin can pause in case of exploits

## Monitoring

Watch for events:
```typescript
titheVerifier.on('AnonymousTitheVerified', (commitment, churchId, minThreshold, timestamp) => {
  console.log('Anonymous tithe received:', {
    commitment,
    churchId,
    minThreshold: ethers.formatUnits(minThreshold, 6), // USDC has 6 decimals
    timestamp: new Date(timestamp * 1000),
  });
});
```

## Cost Analysis

- **Proof Generation**: Free (client-side, ~5-10 seconds)
- **On-chain Verification**: ~200k-500k gas (~$1-5 on Base L2)
- **Total Cost**: Cheaper than Ethereum mainnet by 10-100x

## Biblical Reflection

> "Take heed that you do not do your charitable deeds before men, to be seen by them." - Matthew 6:1

Zero-knowledge proofs enable the most biblical form of giving—completely anonymous yet cryptographically verified.
