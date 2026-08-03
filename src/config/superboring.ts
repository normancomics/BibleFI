/**
 * SuperBoring configuration — streaming dollar-cost-averaging (DCA) on
 * Superfluid, deployed on Base. You stream an in-token super token into a
 * TOREX (Twap Oracle Exchange) market and it continuously DCAs into the
 * out-token, streaming it back plus BORING emissions.
 *
 * DCA is a core BWTYA principle — "He who gathers money little by little makes
 * it grow" (Proverbs 13:11), cited in BWTYACore.sol — so SuperBoring is a
 * natural biblical-finance rail. Non-custodial: the user's own wallet opens
 * the Superfluid stream.
 *
 * Addresses verified on-chain (Base mainnet, chainId 8453) 2026-07.
 * Docs: https://docs.superboring.xyz/docs/smart-contracts and /docs/integrate
 */
export const SUPERBORING_CHAIN_ID = 8453; // Base mainnet

export const SUPERBORING_CONTRACTS = {
  main: '0x37D607BD9dfFf80acf37184c1F27E88388914262',
  torexFactory: '0x9C6C84Cc69b26967A09f7b57f7089d3e04E24470',
  emissionsTreasury: '0x14a201A50b3FFC7ca9851DD137Aa47fF33924025',
  boringToken: '0x2112b92A4f6496B7b2f10850857FfA270464d054',
  /** SBMacro: getParams(torex, flowRate, distributor, referrer, upgradeAmount). */
  sbMacro: '0xE581E09a9c2a9188c3e6F0fAb5a0b3EC88cA39aE',
  /** MacroForwarder.runMacro(macro, params) — same on all Superfluid networks. */
  macroForwarder: '0xfD01285b9435bc45C243E5e7F978E288B2912de6',
  /** CFAv1Forwarder — used to stop a DCA flow (deleteFlow). */
  cfaForwarder: '0xcfA132E353cB4E398080B9700609bb008eceB125',
} as const;

export interface TorexMarket {
  label: string;      // e.g. "USDC → ETH"
  inSymbol: string;   // super token you stream in (e.g. USDCx)
  outSymbol: string;  // super token streamed back (e.g. ETHx)
  torex: string;      // TOREX market address
}

/** Verified live TOREX DCA markets on Base. */
export const TOREX_MARKETS: TorexMarket[] = [
  { label: 'USDC → ETH', inSymbol: 'USDCx', outSymbol: 'ETHx', torex: '0x269F9EF6868F70fB20DDF7CfDf69Fe1DBFD307dE' },
  { label: 'ETH → USDC', inSymbol: 'ETHx', outSymbol: 'USDCx', torex: '0x267264cFB67b015Ea23c97C07d609fbFc06AdC17' },
  { label: 'ETH → AERO', inSymbol: 'ETHx', outSymbol: 'AEROx', torex: '0x27aEe792433e4c8faA55396f91EE4119d282a83a' },
  { label: 'AERO → ETH', inSymbol: 'AEROx', outSymbol: 'ETHx', torex: '0x76bA7A8A4d8320c6e9d4542255fb05268F1B48Be' },
  { label: 'ETH → wstETH', inSymbol: 'ETHx', outSymbol: 'WSTETHx', torex: '0xd21549892bF317CCFe7Fb220dcF14aB15DfE5428' },
  { label: 'wstETH → ETH', inSymbol: 'WSTETHx', outSymbol: 'ETHx', torex: '0x78EFcd2Bc1175d69863b1c9aAC9996b766c07a3a' },
  { label: 'ETH → DEGEN', inSymbol: 'ETHx', outSymbol: 'DEGENx', torex: '0x0700d3bDbc8fd357B28C209DAc74C23242B343c7' },
  { label: 'DEGEN → ETH', inSymbol: 'DEGENx', outSymbol: 'ETHx', torex: '0x68e5E539374353445b03Ec87D2ABfE2c791deEbc' },
];

/**
 * Whether real-funds DCA opening is enabled for this build. Reads/scoring
 * always work; opening a real Superfluid DCA stream requires opt-in.
 */
export function isSuperBoringLive(): boolean {
  try {
    return import.meta.env?.VITE_SUPERBORING_LIVE === 'true';
  } catch {
    return false;
  }
}
