# Noir Zero-Knowledge Integration for Bible.fi

## What is Noir?

[Noir](https://noir-lang.org/) is a domain-specific language for creating and verifying zero-knowledge proofs. It allows you to write circuits that prove computations were performed correctly without revealing the inputs.

## Why Noir for Bible.fi?

### Privacy-Preserving Features

1. **Anonymous Tithing**
   - Users can prove they tithed without revealing the amount
   - Churches receive donations without knowing the donor
   - Tax deductions can be proven without exposing church choice

2. **Private Wisdom Scores**
   - Prove your wisdom score is above a threshold without revealing exact score
   - Unlock features based on score without broadcasting it on-chain
   - Privacy-preserving leaderboards

3. **Confidential DeFi Positions**
   - Prove portfolio value for achievements without revealing holdings
   - Private lending/borrowing positions
   - Anonymous yield farming strategies

4. **Zero-Knowledge Tax Reporting**
   - Prove compliance without revealing full financial details
   - Generate IRS-compliant proofs of donations
   - Privacy-preserving charitable giving records

## Integration Architecture

### Current Bible.fi Stack
```
React/TypeScript Frontend (Vite)
    ↓
Wagmi + Viem (Web3)
    ↓
Base Chain Smart Contracts
    ↓
BibleToken.sol (has ZK transfer placeholder)
```

### With Noir Integration
```
React/TypeScript Frontend
    ↓
Noir.js (WASM) - Client-side proof generation
    ↓
Smart Contracts with Noir Verifier
    ↓
Base Chain (verification on-chain)
```

## Installation & Setup

### 1. Install Noir
```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
noirup
```

### 2. Add to Bible.fi
```bash
# Create circuits directory
mkdir -p circuits/src

# Install Noir.js for browser integration
npm install @noir-lang/noir_js @noir-lang/backend_barretenberg
```

### 3. Example Circuit: Private Tithe Proof
```noir
// circuits/src/private_tithe.nr
fn main(
    tithe_amount: Field,        // Private input
    min_threshold: pub Field,    // Public input
    church_hash: pub Field       // Public input
) {
    // Prove tithe amount >= minimum without revealing amount
    assert(tithe_amount >= min_threshold);
    
    // Prove tithe goes to verified church
    let computed_hash = hash_to_field([tithe_amount, church_hash]);
    assert(computed_hash != 0);
}
```

### 4. Generate Proof in React
```typescript
// src/services/zkProofService.ts
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import circuit from '../../circuits/target/private_tithe.json';

export async function generateTitheProof(
  titheAmount: bigint,
  minThreshold: bigint,
  churchHash: bigint
) {
  const backend = new BarretenbergBackend(circuit);
  const noir = new Noir(circuit, backend);

  const inputs = {
    tithe_amount: titheAmount.toString(),
    min_threshold: minThreshold.toString(),
    church_hash: churchHash.toString(),
  };

  const proof = await noir.generateProof(inputs);
  return proof;
}
```

### 5. Verify On-Chain
```solidity
// contracts/TitheVerifier.sol
contract TitheVerifier {
    UltraVerifier public verifier;
    
    function verifyAndRecordTithe(
        bytes calldata proof,
        uint256 minThreshold,
        bytes32 churchHash
    ) external {
        bytes32[] memory publicInputs = new bytes32[](2);
        publicInputs[0] = bytes32(minThreshold);
        publicInputs[1] = churchHash;
        
        require(verifier.verify(proof, publicInputs), "Invalid proof");
        
        // Record tithe without knowing amount
        emit TitheVerified(msg.sender, churchHash, block.timestamp);
    }
}
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Install Noir toolchain
- [ ] Create basic circuit structure
- [ ] Integrate Noir.js into React app
- [ ] Deploy test verifier contract on Base testnet

### Phase 2: Private Tithing (Week 3-4)
- [ ] Build private tithe circuit
- [ ] Create UI for proof generation
- [ ] Deploy tithe verifier contract
- [ ] Test with real Base chain transactions

### Phase 3: Wisdom Score Privacy (Week 5-6)
- [ ] Wisdom score threshold circuits
- [ ] Achievement unlock proofs
- [ ] Private leaderboard system

### Phase 4: Advanced Features (Week 7-8)
- [ ] Multi-denomination tithe proofs
- [ ] Recursive proofs for complex strategies
- [ ] Zero-knowledge tax reporting

## Benefits for Bible.fi

1. **Enhanced Privacy**: Users maintain financial privacy while staying compliant
2. **Trust**: Cryptographic proofs instead of trusting centralized systems
3. **Competitive Advantage**: First faith-based DeFi app with ZK privacy
4. **Tax Compliance**: Prove donations without revealing full financial picture
5. **Biblical Alignment**: "Give in secret" (Matthew 6:3-4)

## Considerations

### Development Complexity
- Learning curve for Noir language
- Circuit design requires ZK expertise
- Additional build pipeline complexity

### Performance
- Proof generation takes 1-10 seconds (client-side)
- Verification is fast (~100ms on-chain)
- WASM bundle adds ~2MB to app size

### Cost
- Gas costs for verification (~200k-500k gas)
- Worth it for high-value privacy features
- Can optimize with batching

## Resources

- [Noir Documentation](https://noir-lang.org/docs)
- [Noir Examples](https://github.com/noir-lang/noir-examples)
- [Aztec Protocol](https://aztec.network/) - Noir's parent project
- [ZK Learning Resources](https://zk-learning.org/)

## Biblical Precedent

> "But when you give to the needy, do not let your left hand know what your right hand is doing, so that your giving may be in secret." - Matthew 6:3-4

Zero-knowledge proofs enable this biblical principle in the digital age—proving generosity without publicity.
