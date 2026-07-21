# Anonymous Giving (Veil.cash + Noir)

Zero-knowledge anonymous tithing. Two paths exist in the UI
([AnonymousTithe.tsx](../src/components/tithe/AnonymousTithe.tsx)):

- **Veil.cash** — real Base-mainnet privacy protocol (UTXO, Poseidon +
  Groth16). This is the production path.
- **Noir** — custom threshold-proof circuits ([circuits/](../circuits/)).
  Proof-only until an on-chain verifier + settlement contract is deployed.

## Safety contract

**The app never tells a donor a tithe was sent unless a real transaction
confirmed.** In the default PREVIEW mode nothing is submitted on-chain, no
funds move, and the UI says so explicitly. Success (and any "sent privately to
<church>" message) is shown only after a confirmed on-chain `txHash` /
relayer receipt.

## Veil.cash — architecture

| Layer | File | Notes |
|---|---|---|
| Config + addresses | [src/config/veil.ts](../src/config/veil.ts) | Verified live Base contracts; `VITE_VEIL_LIVE` flag |
| Client | [src/integrations/veil/client.ts](../src/integrations/veil/client.ts) | Honest gating, real `pool.nextIndex()` anonymity-set read |
| SDK adapter | [src/integrations/veil/sdkAdapter.ts](../src/integrations/veil/sdkAdapter.ts) | Real `@veil-cash/sdk` wiring, lazily loaded |

The adapter imports `@veil-cash/sdk` via a runtime dynamic import with a
non-literal specifier, so the heavy snarkjs/circomlib proving stack never
enters the default bundle and the app builds without the package installed.
When the package is absent or a call fails, the adapter returns `{ error }`
with **no** `txHash` — the caller reports failure honestly.

### Deposit flow (real, per @veil-cash/sdk 0.7)
1. Derive the Veil keypair from the wallet: `Keypair.fromSigner(signMessage)`.
2. If the account is new, register the deposit key on-chain
   (`checkRecipientRegistration` → `buildRegisterTx`).
3. USDC only: `buildApproveUSDCTx` → send → wait.
4. `buildDepositETHTx` / `buildDepositUSDCTx` → send with the wallet → wait for
   the receipt → real `txHash`.

### Withdraw flow (real)
1. Re-derive the same keypair from the wallet (deterministic — no secret note
   needed to move the private balance).
2. `withdraw({ amount, recipient, keypair, pool, provingKeyPath })` — proves
   with Groth16 and submits via the Veil relayer, returning `transactionHash`.

## Going live

1. `npm install @veil-cash/sdk`
2. Host the Groth16 proving artifacts at same-origin `/keys/`:
   `transaction2.wasm`, `transaction2.zkey`, `transaction16.wasm`,
   `transaction16.zkey` — or set `VITE_VEIL_PROVING_KEY_PATH` to a CDN base URL.
3. Set `VITE_VEIL_LIVE=true`.
4. Note: Veil screens deposits for compliance (Coinbase EAS / Binance BABT /
   Ethos / 0xbow). Verify your users' path per <https://docs.veil.cash/>.
5. Test with small real amounts on Base before announcing.

## Verified live Veil contracts (Base, chainId 8453)

| Contract | Address |
|---|---|
| Entry | `0xc2535c547B64b997A4BD9202E1663deaF11c78a5` |
| ETH Pool | `0x293dCda114533FF8f477271c5cA517209FFDEEe7` |
| USDC Pool | `0x5c50d58E49C59d112680c187De2Bf989d2a91242` |
| Verifier (2-input) | `0x69013e62EF76BF1A7B980957607c944C9BD4FDF5` |
| Verifier (16-input) | `0xB5e025044b09cAe75bace1c8dB9701aE383792e4` |

Live anonymity-set sizes (deposits) are read from `pool.nextIndex()` at runtime.

## Noir path — remaining work

Install `nargo`, `nargo compile` the circuits, deploy the generated UltraPlonk
verifier + a settlement contract to Base, and align the `@noir-lang` deps
(`noir_js@1.0.0-beta.15` pairs with `@aztec/bb.js`, not `backend_barretenberg`).
Until then the Noir tab generates proofs but does not settle on-chain, and the
UI does not claim funds moved.
