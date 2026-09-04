# BWTYA Vault — Base Sepolia Deployment & Dashboard Wiring

The church dashboard shows **estimates only** until a real vault address is registered.
Nothing in this repo can invent a funded wallet, so the broadcast step must be run from a
machine that holds the deployer key. Everything else is already wired.

## 1. Prerequisites

- A Base Sepolia wallet funded with test ETH (Coinbase Base Sepolia faucet).
- [Foundry](https://book.getfoundry.sh/) installed (`curl -L https://foundry.paradigm.xyz | bash && foundryup`).
- Dependencies: `forge install OpenZeppelin/openzeppelin-contracts foundry-rs/forge-std`

## 2. Deploy (one command)

```bash
export DEPLOYER_PRIVATE_KEY=0x...                                   # funded, testnet-only key
export DEPOSIT_TOKEN=0x036CbD53842c5426634e7929541eC2318f3dCF7e     # USDC on Base Sepolia
export TREASURY=0x...                                               # treasury receiving the 10% tithe
export BASE_APY_BPS=800
export BASESCAN_API_KEY=...                                         # optional, for --verify

forge script script/DeployBWTYAVault.s.sol \
  --rpc-url https://sepolia.base.org --broadcast --verify
```

The script prints the vault address plus the exact `.env` lines to copy.

## 3. Paste the address into the dashboard

Add to `.env` (or the hosting environment variables):

```
VITE_BWTYA_VAULT_CHAIN=base-sepolia
VITE_BWTYA_VAULT_BASE_SEPOLIA=0xYourVaultAddress
```

`src/config/bwtyaVault.ts` reads these; `useBWTYAVault` then calls `previewYield(address)`
on-chain and `/church-dashboard` switches its yield card from
"Pending BWTYA yield (estimate)" to "BWTYA yield (on-chain)", dropping the
"projections only" notice automatically. No component changes are needed.

## 4. Post-deploy checks

```bash
cast call $VAULT "TITHE_RATE()(uint256)" --rpc-url https://sepolia.base.org   # expect 1000 (10%)
cast call $VAULT "treasury()(address)"   --rpc-url https://sepolia.base.org
```

Then set the yield oracle and (if needed) unpause:

```bash
cast send $VAULT "setYieldOracle(address)" $ORACLE --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url https://sepolia.base.org
```

Mainnet later: deploy the same script with `--rpc-url https://mainnet.base.org`, set
`VITE_BWTYA_VAULT_CHAIN=base` and `VITE_BWTYA_VAULT_BASE`, and only after an audit.

*"The tithe is the LORD's" — Leviticus 27:30*
