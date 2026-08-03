# $BIBLEFI & $WISDOM Superfluid token architecture

Hybrid design, chosen to keep on-chain governance intact while still shipping
a truly native Superfluid token:

| Token | Type | Why |
|---|---|---|
| **$BIBLEFI** | Standard ERC-20 + `ERC20Votes` + `ERC20Permit` (`BibleFiGovernanceToken.sol`), wrapped into **$xBIBLEFI** (`xBibleFiToken.sol` / `XBibleFiDeployer`) | A native Super Token can't carry `ERC20Votes` — vote delegation and checkpoints require the standard OZ governance base. Wrapping into `$xBIBLEFI` still gives full real-time DAO treasury streaming. |
| **$WISDOM** | **Native Super Token** (`WisdomNativeSuperToken.sol` — `WisdomNativeSuperTokenProxy`) | $WISDOM has no voting requirement — it's an earned rewards token. As a native Super Token, every reward is minted directly via `ISuperToken.selfMint` and is streamable the instant it's issued. No underlying ERC-20, no wrap/unwrap step, no separate `$xWISDOM`. |

The native pattern follows Superfluid's own reference implementation
([`superfluid-finance/custom-supertokens`](https://github.com/superfluid-finance/custom-supertokens)):
a minimal UUPS proxy (`CustomSuperTokenBase` + `UUPSProxy`) whose `initialize()`
calls `SuperTokenFactory.initializeCustomSuperToken(address(this))` internally,
then `ISuperToken.initialize(...)`. All of $WISDOM's existing reward-issuance
business logic (tithe-stream rewards, quiz rewards, church referrals,
governance-vote rewards, risk-avoidance rewards, daily per-user caps, the
1B-token supply cap) was ported onto this base unchanged — only the mint
mechanism changed, from OZ's `_mint` to `ISuperToken.selfMint`.

## Bugs fixed while verifying compilation

These were pre-existing and unrelated to the architecture change — found only
because the contracts had never actually been compiled before:

- `BibleToken.sol`, `WisdomRewardsPool.sol`: stray trailing `` ``` `` (markdown
  code-fence artifact) breaking the parser.
- `xBibleFiToken.sol`, `xWisdomToken.sol`, `scripts/contracts/deploy-superfluid-tokens.ts`:
  the `SuperTokenFactory` address literal had an invalid EIP-55 checksum
  (`0x73743A7B7af23CAc5A3BFBD11B0CF0A3D11E7CA3` → correct checksum
  `0x73743A7b7Af23CAc5A3bfbD11b0cf0a3D11E7Ca3`; same address, just re-cased).
- `xWisdomToken.sol`: a ternary type mismatch (`int96` vs. untyped `0`) in
  `getVIPStatus`.
- `BibleToken.sol` also references an undefined `ZKProof` type and is not used
  by any real deployment path (`deploy-superfluid-tokens.ts` uses
  `BibleFiGovernanceToken` instead) — left as-is, out of scope for this token
  launch, but worth fixing or removing separately.

## Compiling

```sh
cd contracts_forge
forge install                     # fetches forge-std, OpenZeppelin v4.9.6,
                                   # OpenZeppelin v5.0.2, Superfluid protocol-monorepo
forge build \
  ../src/contracts/BibleFiGovernanceToken.sol \
  ../src/contracts/WisdomRewardsToken.sol \
  ../src/contracts/WisdomNativeSuperToken.sol \
  ../src/contracts/xBibleFiToken.sol \
  ../src/contracts/xWisdomToken.sol
```

Verified working: compiles cleanly with `solc 0.8.26`, producing real bytecode
for every contract (`WisdomNativeSuperTokenProxy`: 14,632 hex chars / 39 ABI
functions including all reward-issuance methods — confirmed by inspecting the
compiled artifact directly).

`contracts_forge/lib/`, `contracts_forge/cache/`, and `artifacts_forge/` are
gitignored (118 MB of vendored dependencies) — re-run `forge install` /
`forge build` locally before deploying.

## Deploying — YOU run this, not Claude

Deploying mints real tokens on Base mainnet and costs real ETH gas from a
wallet you control. This requires signing transactions with a funded private
key, which is not something an AI assistant should hold or execute on your
behalf — you run the script yourself, the same way you'd run any deployment.

```sh
# Testnet first (recommended) — Base Sepolia
PRIVATE_KEY=0xyourDeployerKey \
  ts-node scripts/contracts/deploy-superfluid-tokens.ts --network=base-sepolia

# Mainnet — Base
PRIVATE_KEY=0xyourDeployerKey \
COMMUNITY_WALLET=0x... DEV_WALLET=0x... CHURCH_WALLET=0x... \
TEAM_WALLET=0x... EARLY_SUPPORT_WALLET=0x... \
  ts-node scripts/contracts/deploy-superfluid-tokens.ts --network=base-mainnet
```

What it does, in order:
1. Deploys `BibleFiGovernanceToken` ($BIBLEFI), minting the full supply split
   across the five wallet allocations you pass in.
2. Deploys `XBibleFiDeployer`, then calls `deployXBIBLEFI(biblefiAddress)` to
   create the `$xBIBLEFI` wrapper.
3. Deploys `WisdomNativeSuperTokenProxy`, then calls `initialize(tokenFactory,
   deployerAddress)` — this mints **zero** initial $WISDOM (it's earned, not
   premined) and grants `DEFAULT_ADMIN_ROLE` / `MINTER_ROLE` / `PAUSER_ROLE` /
   `ORACLE_ROLE` to the deployer wallet.
4. Deploys `BibleFiDAOTreasury` pointed at `$xBIBLEFI`.
5. Deploys `WisdomVIPRewards` pointed directly at native `$WISDOM` (no
   wrapping needed — `wrapWisdom()` on that contract is now dead code for
   $WISDOM specifically and is never called by this flow).

Deployment results are written to `deployments/superfluid-tokens-<timestamp>.json`.

### After deploying
- Transfer `ORACLE_ROLE` on native $WISDOM from the deployer to your actual
  backend oracle wallet (the one issuing rewards from Supabase edge functions).
- Update `src/integrations/superfluid/realClient.ts`'s token map with the real
  addresses (replace the `ZeroAddress` / `PENDING_TGE` placeholders).
- Update `public/.well-known/farcaster.json`'s `tokens.BIBLEFI.address` and
  `tokens.WISDOM.address` (currently `"PENDING_TGE"`).
- Verify contracts on BaseScan: `forge verify-contract --chain <id> <address> <Contract>`.
