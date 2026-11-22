# Anonymous Giving (Privacy Cash + Noir)

Anonymous tithing. Two paths exist in the UI
([AnonymousTithe.tsx](../src/components/tithe/AnonymousTithe.tsx)):

- **Privacy Cash** — external privacy provider
  (<https://privacycash.mintlify.app/>). BibleFi links the donor to Privacy
  Cash to complete the private gift; the app does not submit privacy-pool
  transactions or custody funds. Config: [src/config/privacycash.ts](../src/config/privacycash.ts).
- **Noir** — custom threshold-proof circuits ([circuits/](../circuits/)).
  Proof-only until an on-chain verifier + settlement contract is deployed.

## Safety contract

**The app never tells a donor a tithe was sent privately.** Privacy Cash gifts
are completed on Privacy Cash, and the Noir path does not settle on-chain yet.

## Noir path — remaining work

Install `nargo`, `nargo compile` the circuits, deploy the generated UltraPlonk
verifier + a settlement contract to Base, and align the `@noir-lang` deps
(`noir_js@1.0.0-beta.15` pairs with `@aztec/bb.js`, not `backend_barretenberg`).
Until then the Noir tab generates proofs but does not settle on-chain, and the
UI does not claim funds moved.
