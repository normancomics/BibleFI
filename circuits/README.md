# Bible.fi Noir Circuits

Zero-knowledge circuits for privacy-preserving features in Bible.fi.

## Prerequisites

Install Noir toolchain:
```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
noirup
```

## Circuits

### 1. Private Tithe (`private_tithe.nr`)
Proves a user tithed at least a minimum amount to a verified church without revealing:
- Exact tithe amount
- Donor identity

**Inputs:**
- Private: `tithe_amount`, `donor_secret`
- Public: `min_threshold`, `church_id`, `commitment`

### 2. Wisdom Threshold (`wisdom_threshold.nr`)
Proves a user's wisdom score exceeds a threshold without revealing the exact score.

**Inputs:**
- Private: `actual_score`, `user_secret`
- Public: `required_threshold`, `score_commitment`

## Building Circuits

```bash
# Navigate to circuits directory
cd circuits

# Compile the circuits
nargo compile

# Generate Solidity verifier
nargo codegen-verifier
```

## Integration

The circuits are integrated into the React app via:
- `src/services/zkProofService.ts` - Proof generation
- `src/contracts/TitheVerifier.sol` - On-chain verification
- `src/components/tithe/AnonymousTithe.tsx` - UI component

## Testing Locally

```bash
# Create a Prover.toml with test values
nargo prove

# Verify the proof
nargo verify
```

## Biblical Foundation

> "But when you give to the needy, do not let your left hand know what your right hand is doing, so that your giving may be in secret. Then your Father, who sees what is done in secret, will reward you." - Matthew 6:3-4

Zero-knowledge proofs enable truly anonymous giving while maintaining accountability.
