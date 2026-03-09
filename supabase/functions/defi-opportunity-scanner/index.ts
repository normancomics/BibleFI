import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { withAgentSandbox, sandboxedInsert, sandboxedRead, logOperation, type AgentContext } from '../_shared/agent-sandbox.ts';
import { requireAgentAuth, unauthorizedResponse } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

/**
 * DeFi Opportunity Scanner Agent
 * 
 * Live monitoring of Base chain DeFi protocols for:
 * - Entry/exit points with Biblical wisdom guardrails
 * - Arbitrage opportunities across DEXes
 * - Staking & farming opportunities
 * - Yield optimization signals
 * - Whale movement tracking
 * - Risk alerts and liquidation warnings
 * 
 * Every signal is paired with 100% scripturally-sound Biblical wisdom.
 * 
 * "The heart of the prudent getteth knowledge; and the ear of the wise seeketh knowledge."
 * - Proverbs 18:15
 */

// === PROTOCOL MONITORING (Comprehensive Base Chain Coverage) ===

const BASE_PROTOCOLS = {
  dexes: [
    { name: 'Aerodrome', slug: 'aerodrome-v2', router: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43' },
    { name: 'Uniswap V3', slug: 'uniswap-v3-base', router: '0x2626664c2603336E57B271c5C0b26F421741e481' },
    { name: 'BaseSwap', slug: 'baseswap', router: '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86' },
    { name: 'SwapBased', slug: 'swapbased', router: '' },
    { name: 'SushiSwap', slug: 'sushi-base', router: '' },
    { name: 'PancakeSwap', slug: 'pancakeswap-amm-v3-base', router: '' },
    { name: 'Balancer V2', slug: 'balancer-v2-base', router: '' },
    { name: 'Maverick', slug: 'maverick-v2-base', router: '' },
    { name: 'Curve', slug: 'curve-dex-base', router: '' },
    { name: 'DODO', slug: 'dodo-base', router: '' },
    { name: 'Odos', slug: 'odos', router: '' },
    { name: 'WOOFi', slug: 'woofi-base', router: '' },
    { name: 'KyberSwap', slug: 'kyberswap-elastic-base', router: '' },
    { name: 'Alien Base', slug: 'alienbase', router: '' },
    { name: 'RocketSwap', slug: 'rocketswap-base', router: '' },
    { name: 'DackieSwap', slug: 'dackieswap', router: '' },
    { name: 'Synthswap', slug: 'synthswap', router: '' },
    { name: 'Scale', slug: 'scale-base', router: '' },
    { name: 'Equalizer', slug: 'equalizer-base', router: '' },
  ],
  lending: [
    { name: 'Aave V3', slug: 'aave-v3-base', pool: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5' },
    { name: 'Compound V3', slug: 'compound-v3-base', pool: '' },
    { name: 'Moonwell', slug: 'moonwell', pool: '' },
    { name: 'Morpho Blue', slug: 'morpho-blue-base', pool: '' },
    { name: 'Seamless', slug: 'seamless-protocol', pool: '' },
    { name: 'Silo Finance', slug: 'silo-finance-base', pool: '' },
    { name: 'Fluid', slug: 'fluid-base', pool: '' },
    { name: 'Euler V2', slug: 'euler-v2-base', pool: '' },
    { name: 'Ionic', slug: 'ionic-protocol', pool: '' },
    { name: 'Granary', slug: 'granary-finance', pool: '' },
    { name: 'Overnight Finance', slug: 'overnight-base', pool: '' },
  ],
  yield: [
    { name: 'Beefy Finance', slug: 'beefy', vault: '' },
    { name: 'Extra Finance', slug: 'extra-finance', vault: '' },
    { name: 'Yearn (Base)', slug: 'yearn-finance-base', vault: '' },
    { name: 'Harvest Finance', slug: 'harvest-finance-base', vault: '' },
    { name: 'Sommelier', slug: 'sommelier', vault: '' },
    { name: 'Gamma', slug: 'gamma-base', vault: '' },
    { name: 'Arrakis', slug: 'arrakis-finance', vault: '' },
    { name: 'Convex (Base)', slug: 'convex-finance-base', vault: '' },
    { name: 'Pendle', slug: 'pendle-base', vault: '' },
    { name: 'Aura', slug: 'aura-base', vault: '' },
    { name: 'Spectra', slug: 'spectra', vault: '' },
    { name: 'Stargate', slug: 'stargate-base', vault: '' },
  ],
  perpetuals: [
    { name: 'Synthetix V3', slug: 'synthetix-v3-base', contract: '' },
    { name: 'Kwenta', slug: 'kwenta', contract: '' },
    { name: 'Polynomial', slug: 'polynomial-protocol', contract: '' },
    { name: 'BMX', slug: 'bmx-base', contract: '' },
    { name: 'Thales', slug: 'thales', contract: '' },
    { name: 'Lyra', slug: 'lyra-v2-base', contract: '' },
  ],
  bridges: [
    { name: 'Stargate', slug: 'stargate', contract: '' },
    { name: 'Across', slug: 'across', contract: '' },
    { name: 'Hop', slug: 'hop-protocol', contract: '' },
    { name: 'Synapse', slug: 'synapse', contract: '' },
  ],
  cdp: [
    { name: 'Prisma (Base)', slug: 'prisma-finance', contract: '' },
    { name: 'Angle', slug: 'angle-base', contract: '' },
  ],
};

// === BIBLICAL WISDOM FOR DeFi ACTIONS ===

const OPPORTUNITY_WISDOM: Record<string, {
  scripture: string;
  reference: string;
  action_guidance: string;
  risk_warning: string;
}> = {
  entry_signal: {
    scripture: 'Cast thy bread upon the waters: for thou shalt find it after many days. Give a portion to seven, and also to eight; for thou knowest not what evil shall be upon the earth.',
    reference: 'Ecclesiastes 11:1-2',
    action_guidance: 'Diversify entry across multiple positions. Never concentrate in a single asset.',
    risk_warning: 'Only invest what you can afford to lose. The Lord provides, but the steward must be prudent.',
  },
  exit_signal: {
    scripture: 'To every thing there is a season, and a time to every purpose under the heaven.',
    reference: 'Ecclesiastes 3:1',
    action_guidance: 'Take profits gradually. Set trailing stops. Tithe from gains.',
    risk_warning: 'Greed is the enemy of the faithful steward. Take profits before they vanish.',
  },
  arbitrage: {
    scripture: 'A good man sheweth favour, and lendeth: he will guide his affairs with discretion.',
    reference: 'Psalm 112:5',
    action_guidance: 'Arbitrage requires speed and precision. Only attempt with verified contracts and sufficient gas.',
    risk_warning: 'Flash loan arbitrage carries smart contract risk. Verify all contracts are audited.',
  },
  staking: {
    scripture: 'His lord said unto him, Well done, thou good and faithful servant: thou hast been faithful over a few things, I will make thee ruler over many things.',
    reference: 'Matthew 25:21',
    action_guidance: 'Stake in verified protocols with strong track records. Prefer longer lockups for better yields.',
    risk_warning: 'Staking locks your capital. Ensure you have sufficient liquid reserves before committing.',
  },
  farming: {
    scripture: 'He that tilleth his land shall have plenty of bread: but he that followeth after vain persons shall have poverty enough.',
    reference: 'Proverbs 28:19',
    action_guidance: 'Farm established pairs with deep liquidity. Auto-compound when gas permits.',
    risk_warning: 'Impermanent loss is real. Understand the risks before providing liquidity.',
  },
  whale_alert: {
    scripture: 'Where no counsel is, the people fall: but in the multitude of counsellors there is safety.',
    reference: 'Proverbs 11:14',
    action_guidance: 'Large movements signal smart money. Research their thesis but never blindly follow.',
    risk_warning: 'Whales can manipulate markets. Do not chase whale moves without independent analysis.',
  },
  high_apy_warning: {
    scripture: 'Wealth gotten by vanity shall be diminished: but he that gathereth by labour shall increase.',
    reference: 'Proverbs 13:11',
    action_guidance: 'APYs above 100% are unsustainable. Enter small, take profits regularly.',
    risk_warning: 'Extremely high APY often indicates inflationary token emissions or ponzi mechanics.',
  },
  liquidation_risk: {
    scripture: 'The rich ruleth over the poor, and the borrower is servant to the lender.',
    reference: 'Proverbs 22:7',
    action_guidance: 'Reduce leverage immediately. Add collateral or repay debt to improve health factor.',
    risk_warning: 'Liquidation means total loss of collateral. Biblical wisdom warns against excessive debt.',
  },
  market_dip: {
    scripture: 'Buy the truth, and sell it not; also wisdom, and instruction, and understanding.',
    reference: 'Proverbs 23:23',
    action_guidance: 'Market dips create buying opportunities for the patient. DCA into quality assets.',
    risk_warning: 'Do not try to catch falling knives. Wait for confirmed support levels.',
  },
  market_peak: {
    scripture: 'Pride goeth before destruction, and an haughty spirit before a fall.',
    reference: 'Proverbs 16:18',
    action_guidance: 'Take profits. Reduce exposure. Increase stablecoin allocation and tithe.',
    risk_warning: 'Markets at all-time highs are dangerous. The humble steward secures gains.',
  },
  perpetuals_warning: {
    scripture: 'For which of you, intending to build a tower, sitteth not down first, and counteth the cost, whether he have sufficient to finish it?',
    reference: 'Luke 14:28',
    action_guidance: 'Perpetual positions require constant monitoring. Set stop-losses and never over-leverage.',
    risk_warning: 'Leveraged perpetuals can liquidate your entire position. Count the cost before entering.',
  },
  bridge_opportunity: {
    scripture: 'The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty.',
    reference: 'Proverbs 21:5',
    action_guidance: 'Bridge incentives can offer yield. Verify bridge security audits before transferring large amounts.',
    risk_warning: 'Bridge exploits have caused billions in losses. Only use audited, battle-tested bridges.',
  },
  new_protocol: {
    scripture: 'Prove all things; hold fast that which is good.',
    reference: '1 Thessalonians 5:21',
    action_guidance: 'New protocols may offer early rewards but carry higher risk. Start with small amounts.',
    risk_warning: 'Unaudited smart contracts are the most common source of DeFi losses.',
  },
};

// === COMPREHENSIVE TOKEN TRACKING (Base Chain Ecosystem) ===

const KEY_TOKENS: Record<string, { coingecko: string; address: string; category: string }> = {
  // --- Native & Wrapped ETH ---
  ETH: { coingecko: 'ethereum', address: '0x0000000000000000000000000000000000000000', category: 'native' },
  WETH: { coingecko: 'ethereum', address: '0x4200000000000000000000000000000000000006', category: 'native' },

  // --- Stablecoins ---
  USDC: { coingecko: 'usd-coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', category: 'stablecoin' },
  USDbC: { coingecko: 'bridged-usd-coin-base', address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', category: 'stablecoin' },
  DAI: { coingecko: 'dai', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', category: 'stablecoin' },
  USDT: { coingecko: 'tether', address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', category: 'stablecoin' },
  LUSD: { coingecko: 'liquity-usd', address: '0x368181499736d0c0CC614DBB145E2EC1AC86b8c6', category: 'stablecoin' },
  crvUSD: { coingecko: 'crvusd', address: '0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93', category: 'stablecoin' },
  DOLA: { coingecko: 'dola-usd', address: '0x4621b7A9c75199271F773Ebd9A499dbd165c3191', category: 'stablecoin' },
  USDz: { coingecko: 'usdz', address: '0x04D5ddf5f3a8939889F11E97f8c4BB48317F1938', category: 'stablecoin' },
  EURC: { coingecko: 'euro-coin', address: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42', category: 'stablecoin' },

  // --- Liquid Staking Derivatives (LSDs) ---
  cbETH: { coingecko: 'coinbase-wrapped-staked-eth', address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', category: 'lsd' },
  wstETH: { coingecko: 'wrapped-steth', address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452', category: 'lsd' },
  rETH: { coingecko: 'rocket-pool-eth', address: '0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c', category: 'lsd' },
  ezETH: { coingecko: 'renzo-restaked-eth', address: '0x2416092f143378750bb29b79eD961ab195CcEea5', category: 'lsd' },
  weETH: { coingecko: 'wrapped-eeth', address: '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A', category: 'lsd' },
  rsETH: { coingecko: 'rseth', address: '0xEDfa23602D0EC14714057867A78d01e94176BEA0', category: 'lsd' },
  swETH: { coingecko: 'sweth', address: '0x0ED2C6F0F4327fB1A3F0F0E53D3C0b0E8c735E24', category: 'lsd' },

  // --- Base Ecosystem & Governance ---
  AERO: { coingecko: 'aerodrome-finance', address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', category: 'governance' },
  WELL: { coingecko: 'moonwell-artemis', address: '0xA88594D404727625A9437C3f886C7643872296AE', category: 'governance' },
  SEAM: { coingecko: 'seamless-protocol', address: '0x1C7a460413dD4e964f96D8dFC56E7223cE88CD85', category: 'governance' },
  EXTRA: { coingecko: 'extra-finance', address: '0x2dAD3a13ef0C6366220f989157009e501e7e68a3', category: 'governance' },
  SNX: { coingecko: 'havven', address: '0x22e6966B799c4D5B13BE962E1D117b56327FDa66', category: 'governance' },
  BAL: { coingecko: 'balancer', address: '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2', category: 'governance' },
  CRV: { coingecko: 'curve-dao-token', address: '0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415', category: 'governance' },
  SUSHI: { coingecko: 'sushi', address: '0x7D49a065D17d6d4a55dc13649901fdBB98B2AFBA', category: 'governance' },
  PENDLE: { coingecko: 'pendle', address: '0xBC5B488369a82C12E12d20b5B12e3F39Aec1da1d', category: 'governance' },

  // --- Wrapped BTC ---
  WBTC: { coingecko: 'wrapped-bitcoin', address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', category: 'btc' },
  cbBTC: { coingecko: 'coinbase-wrapped-btc', address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', category: 'btc' },
  tBTC: { coingecko: 'tbtc', address: '0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b', category: 'btc' },

  // --- Major DeFi Tokens on Base ---
  COMP: { coingecko: 'compound-governance-token', address: '0x9e1028F5F1D5eDE59748FFceE5532509976840E0', category: 'defi' },
  UNI: { coingecko: 'uniswap', address: '0xc3De830EA07524a0761646a6a4e4be0e114a3C83', category: 'defi' },
  AAVE: { coingecko: 'aave', address: '0x6Bb7a212910682DCFdbd5BCBb3e28FB4E8da10Ee', category: 'defi' },
  LDO: { coingecko: 'lido-dao', address: '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60', category: 'defi' },
  RPL: { coingecko: 'rocket-pool', address: '0x1f73EAf55d696Bffa9b0EA16fa987B93b0f4d302', category: 'defi' },
  MKR: { coingecko: 'maker', address: '0x0a5E677a6A24b2F1A2Bf4F3bFfc443231d2fDEc8', category: 'defi' },
  YFI: { coingecko: 'yearn-finance', address: '0x9EaF8C1E34F05a589EDa6BAfdF391Cf6Ad3CB239', category: 'defi' },

  // --- Meme & Community Tokens on Base ---
  BRETT: { coingecko: 'based-brett', address: '0x532f27101965dd16442E59d40670FaF5eBB142E4', category: 'meme' },
  TOSHI: { coingecko: 'toshi', address: '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4', category: 'meme' },
  DEGEN: { coingecko: 'degen-base', address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', category: 'meme' },
  HIGHER: { coingecko: 'higher', address: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe', category: 'meme' },
  MFER: { coingecko: 'mfercoin', address: '0xE3086852A4B125803C815a158249ae468A3254Ca', category: 'meme' },
  NORMIE: { coingecko: 'normie-2', address: '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', category: 'meme' },
  BALD: { coingecko: 'bald', address: '0x27D2DECb4bFC9C76F0309b8E88dec3a601Fe25a8', category: 'meme' },

  // --- Real World Assets (RWA) ---
  USR: { coingecko: 'resolv-usr', address: '0x35E5dB674D8e93a03d814FA0ADa70731efe8a4b9', category: 'rwa' },

  // --- Layer 2 / Infrastructure ---
  OP: { coingecko: 'optimism', address: '0x4200000000000000000000000000000000000042', category: 'infrastructure' },
  ARB: { coingecko: 'arbitrum', address: '0x1DEBd73E752bEaF79865Fd6446b0c970EaE7732f', category: 'infrastructure' },
  LINK: { coingecko: 'chainlink', address: '0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196', category: 'infrastructure' },

  // --- Superfluid / BibleFi Ecosystem ---
  USDCx: { coingecko: 'usd-coin', address: '0x4dd8db0c491c475f1335e0eaa58ab8601f26c86f', category: 'supertoken' },
};

interface OpportunitySignal {
  type: 'entry' | 'exit' | 'arbitrage' | 'staking' | 'farming' | 'whale' | 'warning' | 'liquidation' | 'perpetual' | 'bridge' | 'new_protocol';
  protocol: string;
  asset: string;
  signal_strength: 'weak' | 'moderate' | 'strong';
  details: string;
  biblical_wisdom: typeof OPPORTUNITY_WISDOM[string];
  metrics: Record<string, any>;
  timestamp: string;
  actionable: boolean;
}

async function fetchPricesWithChanges(): Promise<Record<string, { usd: number; change_24h: number; change_7d: number }>> {
  try {
    const ids = Object.values(KEY_TOKENS).map(t => t.coingecko).filter((v, i, a) => a.indexOf(v) === i).join(',');
    const resp = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_7d_change=true`
    );
    if (!resp.ok) return {};
    const data = await resp.json();
    const result: Record<string, { usd: number; change_24h: number; change_7d: number }> = {};
    for (const [symbol, info] of Object.entries(KEY_TOKENS)) {
      const d = data[(info as any).coingecko];
      if (d) {
        result[symbol] = {
          usd: d.usd || 0,
          change_24h: d.usd_24h_change || 0,
          change_7d: d.usd_7d_change || 0,
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}

async function fetchProtocolYields(): Promise<{ protocol: string; type: string; tvl: number; apy?: number; change_1d: number }[]> {
  const results: { protocol: string; type: string; tvl: number; apy?: number; change_1d: number }[] = [];
  const allProtocols = [
    ...BASE_PROTOCOLS.dexes.map(p => ({ ...p, type: 'dex' })),
    ...BASE_PROTOCOLS.lending.map(p => ({ ...p, type: 'lending' })),
    ...BASE_PROTOCOLS.yield.map(p => ({ ...p, type: 'yield' })),
    ...BASE_PROTOCOLS.perpetuals.map(p => ({ ...p, type: 'perpetual' })),
    ...BASE_PROTOCOLS.bridges.map(p => ({ ...p, type: 'bridge' })),
    ...BASE_PROTOCOLS.cdp.map(p => ({ ...p, type: 'cdp' })),
  ];

  // Manual slug mapping for protocols whose DeFiLlama slug doesn't match our naming
  const SLUG_OVERRIDES: Record<string, string> = {
    'aerodrome-v2': 'aerodrome-v1',
    'uniswap-v3-base': 'uniswap',
    'sushi-base': 'sushi',
    'pancakeswap-amm-v3-base': 'pancakeswap-amm-v3',
    'balancer-v2-base': 'balancer-v2',
    'maverick-v2-base': 'maverick-v2',
    'curve-dex-base': 'curve-dex',
    'dodo-base': 'dodo',
    'woofi-base': 'woofi',
    'kyberswap-elastic-base': 'kyberswap-elastic',
    'rocketswap-base': 'rocketswap',
    'scale-base': 'scale',
    'equalizer-base': 'equalizer-exchange',
    'aave-v3-base': 'aave-v3',
    'compound-v3-base': 'compound-v3',
    'morpho-blue-base': 'morpho-blue',
    'silo-finance-base': 'silo-finance',
    'fluid-base': 'fluid',
    'euler-v2-base': 'euler',
    'overnight-base': 'overnight-finance',
    'yearn-finance-base': 'yearn-finance',
    'harvest-finance-base': 'harvest-finance',
    'gamma-base': 'gamma',
    'convex-finance-base': 'convex-finance',
    'pendle-base': 'pendle',
    'aura-base': 'aura',
    'stargate-base': 'stargate',
    'synthetix-v3-base': 'synthetix',
    'lyra-v2-base': 'lyra-v2',
    'bmx-base': 'bmx',
    'angle-base': 'angle',
  };

  // Fuzzy match: normalize a name for comparison
  const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_\.()v234]+/g, '').replace(/finance|protocol|exchange|swap/g, '');

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000);
    const resp = await fetch('https://api.llama.fi/protocols', { signal: controller.signal });
    if (!resp.ok) throw new Error('Failed to fetch protocols');
    const allDefiProtocols = await resp.json();

    // Build multiple lookup indexes for maximum match rate
    const bySlug = new Map<string, any>();
    const byNorm = new Map<string, any>();
    for (const p of allDefiProtocols) {
      if (p.slug) bySlug.set(p.slug, p);
      if (p.name) byNorm.set(normalize(p.name), p);
    }

    let matched = 0;
    for (const protocol of allProtocols) {
      // 1. Try exact slug
      let data = bySlug.get(protocol.slug);
      // 2. Try override slug
      if (!data && SLUG_OVERRIDES[protocol.slug]) {
        data = bySlug.get(SLUG_OVERRIDES[protocol.slug]);
      }
      // 3. Try fuzzy name match
      if (!data) {
        data = byNorm.get(normalize(protocol.name));
      }
      // 4. Try partial slug match (find any slug containing our key term)
      if (!data) {
        const core = protocol.name.toLowerCase().split(/[\s\-]/)[0]; // first word e.g. "aerodrome"
        for (const [slug, pData] of bySlug) {
          if (slug.includes(core) && (pData.chains?.includes('Base') || pData.chain === 'Base')) {
            data = pData;
            break;
          }
        }
      }

      if (data) {
        matched++;
        const tvl = data.chainTvls?.Base || data.tvl || 0;
        const change = data.change_1d || 0;
        results.push({ protocol: protocol.name, type: protocol.type, tvl, change_1d: change });
      }
    }
    console.log(`Protocol matching: ${matched}/${allProtocols.length} matched`);
  } catch (e) {
    console.error('Bulk protocol fetch failed, using fallback:', e);
  }

  return results;
}

async function fetchYieldPools(): Promise<{ pool: string; apy: number; tvl: number; chain: string; project: string }[]> {
  try {
    const resp = await fetch('https://yields.llama.fi/pools');
    if (!resp.ok) return [];
    const data = await resp.json();
    // Filter for Base chain pools with meaningful APY
    return (data.data || [])
      .filter((p: any) => p.chain === 'Base' && p.apy > 0 && p.tvlUsd > 100000)
      .sort((a: any, b: any) => b.apy - a.apy)
      .slice(0, 30)
      .map((p: any) => ({
        pool: p.symbol || p.pool,
        apy: p.apy,
        tvl: p.tvlUsd,
        chain: p.chain,
        project: p.project,
      }));
  } catch {
    return [];
  }
}

function generateSignals(
  prices: Record<string, { usd: number; change_24h: number; change_7d: number }>,
  protocols: { protocol: string; type: string; tvl: number; change_1d: number }[],
  yieldPools: { pool: string; apy: number; tvl: number; project: string }[]
): OpportunitySignal[] {
  const signals: OpportunitySignal[] = [];

  // === ENTRY/EXIT SIGNALS based on price action ===
  const ethData = prices['ETH'];
  if (ethData) {
    // Strong dip = entry opportunity
    if (ethData.change_24h < -5) {
      signals.push({
        type: 'entry', protocol: 'Base Chain', asset: 'ETH',
        signal_strength: ethData.change_24h < -10 ? 'strong' : 'moderate',
        details: `ETH dropped ${Math.abs(ethData.change_24h).toFixed(1)}% in 24h — potential entry point`,
        biblical_wisdom: OPPORTUNITY_WISDOM.market_dip,
        metrics: { price: ethData.usd, change_24h: ethData.change_24h, change_7d: ethData.change_7d },
        timestamp: new Date().toISOString(), actionable: true,
      });
    }
    // Strong pump = exit/take-profit signal
    if (ethData.change_24h > 8) {
      signals.push({
        type: 'exit', protocol: 'Base Chain', asset: 'ETH',
        signal_strength: ethData.change_24h > 15 ? 'strong' : 'moderate',
        details: `ETH surged ${ethData.change_24h.toFixed(1)}% in 24h — consider taking partial profits`,
        biblical_wisdom: OPPORTUNITY_WISDOM.market_peak,
        metrics: { price: ethData.usd, change_24h: ethData.change_24h },
        timestamp: new Date().toISOString(), actionable: true,
      });
    }
  }

  // === ARBITRAGE DETECTION across DEXes ===
  const dexProtocols = protocols.filter(p => p.type === 'dex');
  if (dexProtocols.length >= 2) {
    const tvlDiffs: { pair: string; diff: number }[] = [];
    for (let i = 0; i < dexProtocols.length; i++) {
      for (let j = i + 1; j < dexProtocols.length; j++) {
        const diff = Math.abs(dexProtocols[i].change_1d - dexProtocols[j].change_1d);
        if (diff > 10) {
          tvlDiffs.push({ pair: `${dexProtocols[i].protocol} vs ${dexProtocols[j].protocol}`, diff });
        }
      }
    }
    for (const arb of tvlDiffs.slice(0, 3)) {
      signals.push({
        type: 'arbitrage', protocol: arb.pair, asset: 'Multiple',
        signal_strength: arb.diff > 20 ? 'strong' : 'moderate',
        details: `TVL divergence of ${arb.diff.toFixed(1)}% between DEXes — potential arbitrage window`,
        biblical_wisdom: OPPORTUNITY_WISDOM.arbitrage,
        metrics: { tvl_divergence: arb.diff },
        timestamp: new Date().toISOString(), actionable: true,
      });
    }
  }

  // === STAKING OPPORTUNITIES from lending protocols ===
  const lendingProtocols = protocols.filter(p => p.type === 'lending');
  for (const lp of lendingProtocols) {
    if (lp.tvl > 10_000_000 && lp.change_1d > 3) {
      signals.push({
        type: 'staking', protocol: lp.protocol, asset: 'USDC/ETH',
        signal_strength: lp.change_1d > 8 ? 'strong' : lp.change_1d > 5 ? 'moderate' : 'weak',
        details: `${lp.protocol} TVL growing ${lp.change_1d.toFixed(1)}% — stable lending opportunity ($${(lp.tvl / 1e6).toFixed(1)}M TVL)`,
        biblical_wisdom: OPPORTUNITY_WISDOM.staking,
        metrics: { tvl: lp.tvl, tvl_change_1d: lp.change_1d },
        timestamp: new Date().toISOString(), actionable: true,
      });
    }
  }

  // === FARMING OPPORTUNITIES from yield pools ===
  for (const pool of yieldPools.slice(0, 10)) {
    let wisdomKey = 'farming';
    let signalType: OpportunitySignal['type'] = 'farming';

    if (pool.apy > 100) {
      wisdomKey = 'high_apy_warning';
      signalType = 'warning';
    }

    signals.push({
      type: signalType, protocol: pool.project, asset: pool.pool,
      signal_strength: pool.apy > 50 ? 'strong' : pool.apy > 20 ? 'moderate' : 'weak',
      details: `${pool.pool} on ${pool.project}: ${pool.apy.toFixed(1)}% APY ($${(pool.tvl / 1e6).toFixed(1)}M TVL)`,
      biblical_wisdom: OPPORTUNITY_WISDOM[wisdomKey],
      metrics: { apy: pool.apy, tvl: pool.tvl },
      timestamp: new Date().toISOString(), actionable: pool.apy < 200, // Don't recommend unsustainable yields
    });
  }

  // === LIQUIDITY CRISIS WARNING ===
  const crashingProtocols = protocols.filter(p => p.change_1d < -20);
  for (const cp of crashingProtocols) {
    signals.push({
      type: 'warning', protocol: cp.protocol, asset: 'ALL',
      signal_strength: 'strong',
      details: `⚠️ ${cp.protocol} TVL crashed ${Math.abs(cp.change_1d).toFixed(1)}% — POSSIBLE LIQUIDITY CRISIS`,
      biblical_wisdom: OPPORTUNITY_WISDOM.liquidation_risk,
      metrics: { tvl: cp.tvl, tvl_change_1d: cp.change_1d },
      timestamp: new Date().toISOString(), actionable: true,
    });
  }

  // === PERPETUALS SIGNALS ===
  const perpProtocols = protocols.filter(p => p.type === 'perpetual');
  for (const pp of perpProtocols) {
    if (pp.tvl > 5_000_000) {
      signals.push({
        type: 'perpetual', protocol: pp.protocol, asset: 'ETH/BTC perps',
        signal_strength: pp.change_1d > 10 ? 'strong' : pp.change_1d > 5 ? 'moderate' : 'weak',
        details: `${pp.protocol} perpetuals: $${(pp.tvl / 1e6).toFixed(1)}M TVL (${pp.change_1d > 0 ? '+' : ''}${pp.change_1d.toFixed(1)}% 24h)`,
        biblical_wisdom: OPPORTUNITY_WISDOM.perpetuals_warning,
        metrics: { tvl: pp.tvl, tvl_change_1d: pp.change_1d },
        timestamp: new Date().toISOString(), actionable: true,
      });
    }
  }

  // === BRIDGE INCENTIVE SIGNALS ===
  const bridgeProtocols = protocols.filter(p => p.type === 'bridge');
  for (const bp of bridgeProtocols) {
    if (bp.change_1d > 5) {
      signals.push({
        type: 'bridge', protocol: bp.protocol, asset: 'Cross-chain',
        signal_strength: bp.change_1d > 15 ? 'strong' : 'moderate',
        details: `${bp.protocol} bridge volume surging ${bp.change_1d.toFixed(1)}% — potential incentive program`,
        biblical_wisdom: OPPORTUNITY_WISDOM.bridge_opportunity,
        metrics: { tvl: bp.tvl, tvl_change_1d: bp.change_1d },
        timestamp: new Date().toISOString(), actionable: true,
      });
    }
  }

  // === NEW/GROWING PROTOCOL SIGNALS ===
  const growingProtocols = protocols.filter(p => p.tvl > 500_000 && p.tvl < 10_000_000 && p.change_1d > 15);
  for (const gp of growingProtocols) {
    signals.push({
      type: 'new_protocol', protocol: gp.protocol, asset: 'Various',
      signal_strength: gp.change_1d > 30 ? 'strong' : 'moderate',
      details: `🆕 ${gp.protocol} rapidly growing: $${(gp.tvl / 1e6).toFixed(1)}M TVL (+${gp.change_1d.toFixed(1)}% 24h) — early opportunity`,
      biblical_wisdom: OPPORTUNITY_WISDOM.new_protocol,
      metrics: { tvl: gp.tvl, tvl_change_1d: gp.change_1d },
      timestamp: new Date().toISOString(), actionable: true,
    });
  }

  // === TOKEN-SPECIFIC SIGNALS for all tracked tokens ===
  for (const [symbol, data] of Object.entries(prices)) {
    if (symbol === 'ETH') continue; // Already handled above
    const tokenInfo = KEY_TOKENS[symbol];
    if (!tokenInfo || tokenInfo.category === 'stablecoin' || tokenInfo.category === 'supertoken') continue;

    // Strong dip entry signal
    if (data.change_24h < -8) {
      signals.push({
        type: 'entry', protocol: 'Base Chain', asset: symbol,
        signal_strength: data.change_24h < -15 ? 'strong' : 'moderate',
        details: `${symbol} dropped ${Math.abs(data.change_24h).toFixed(1)}% in 24h ($${data.usd.toFixed(4)}) — potential DCA entry`,
        biblical_wisdom: OPPORTUNITY_WISDOM.market_dip,
        metrics: { price: data.usd, change_24h: data.change_24h, category: tokenInfo.category },
        timestamp: new Date().toISOString(), actionable: true,
      });
    }
    // Strong pump exit signal
    if (data.change_24h > 15) {
      signals.push({
        type: 'exit', protocol: 'Base Chain', asset: symbol,
        signal_strength: data.change_24h > 25 ? 'strong' : 'moderate',
        details: `${symbol} surged ${data.change_24h.toFixed(1)}% in 24h ($${data.usd.toFixed(4)}) — consider taking profits`,
        biblical_wisdom: OPPORTUNITY_WISDOM.market_peak,
        metrics: { price: data.usd, change_24h: data.change_24h, category: tokenInfo.category },
        timestamp: new Date().toISOString(), actionable: true,
      });
    }
  }

  return signals;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'scan';

    // Status mode is read-only and safe for unauthenticated access
    if (mode === 'status') {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { count: defiCount } = await supabase.from('defi_knowledge_base').select('*', { count: 'exact', head: true });
      const tokensByCategory: Record<string, number> = {};
      for (const t of Object.values(KEY_TOKENS)) {
        tokensByCategory[t.category] = (tokensByCategory[t.category] || 0) + 1;
      }
      const totalProtocols = BASE_PROTOCOLS.dexes.length + BASE_PROTOCOLS.lending.length +
        BASE_PROTOCOLS.yield.length + BASE_PROTOCOLS.perpetuals.length +
        BASE_PROTOCOLS.bridges.length + BASE_PROTOCOLS.cdp.length;
      return new Response(JSON.stringify({
        success: true, agent: 'defi-opportunity-scanner',
        status: {
          total_protocols_monitored: totalProtocols,
          monitored_dexes: BASE_PROTOCOLS.dexes.length,
          monitored_lending: BASE_PROTOCOLS.lending.length,
          monitored_yield: BASE_PROTOCOLS.yield.length,
          monitored_perpetuals: BASE_PROTOCOLS.perpetuals.length,
          monitored_bridges: BASE_PROTOCOLS.bridges.length,
          monitored_cdp: BASE_PROTOCOLS.cdp.length,
          tracked_tokens: Object.keys(KEY_TOKENS).length,
          tokens_by_category: tokensByCategory,
          opportunity_types: Object.keys(OPPORTUNITY_WISDOM).length,
          defi_knowledge_entries: defiCount || 0,
          last_run: new Date().toISOString(),
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Dry run mode: fetches live data and generates signals without persisting (read-only, no auth needed)
    if (mode === 'dry_run') {
      const [prices, protocols, yieldPools] = await Promise.all([
        fetchPricesWithChanges(),
        fetchProtocolYields(),
        fetchYieldPools(),
      ]);
      const signals = generateSignals(prices, protocols, yieldPools);
      const actionableSignals = signals.filter(s => s.actionable);
      const byType: Record<string, OpportunitySignal[]> = {};
      for (const s of signals) {
        if (!byType[s.type]) byType[s.type] = [];
        byType[s.type].push(s);
      }
      return new Response(JSON.stringify({
        success: true, agent: 'defi-opportunity-scanner', mode: 'dry_run',
        scan_timestamp: new Date().toISOString(),
        total_signals: signals.length,
        actionable_signals: actionableSignals.length,
        tokens_tracked: Object.keys(KEY_TOKENS).length,
        prices_fetched: Object.keys(prices).length,
        protocols_scanned: protocols.length,
        yield_pools_found: yieldPools.length,
        prices,
        protocols: protocols.slice(0, 20),
        yield_pools: yieldPools.slice(0, 10),
        signals_by_type: Object.fromEntries(
          Object.entries(byType).map(([type, sigs]) => [type, { count: sigs.length, top: sigs.slice(0, 3) }])
        ),
        top_opportunities: actionableSignals
          .sort((a, b) => {
            const strength = { strong: 3, moderate: 2, weak: 1 };
            return strength[b.signal_strength] - strength[a.signal_strength];
          })
          .slice(0, 10),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // All write/scan modes require auth
    const auth = await requireAgentAuth(req);
    if (!auth.authorized) {
      return unauthorizedResponse(auth.error || 'Unauthorized', corsHeaders);
    }

    const result = await withAgentSandbox(
      { agentName: 'defi-opportunity-scanner', runMode: body.manual ? 'manual' : 'scheduled', metadata: { mode } },
      async (ctx: AgentContext) => {
        // Fetch all data in parallel
        const [prices, protocols, yieldPools] = await Promise.all([
          fetchPricesWithChanges(),
          fetchProtocolYields(),
          fetchYieldPools(),
        ]);

        // Generate signals
        const signals = generateSignals(prices, protocols, yieldPools);

        // Persist protocol data to knowledge base
        for (const p of protocols) {
          await sandboxedInsert(ctx, 'defi_knowledge_base', {
            protocol_name: p.protocol,
            protocol_type: p.type,
            chain: 'base',
            tvl: p.tvl,
            description: `${p.protocol} (${p.type}) on Base. TVL: $${(p.tvl / 1e6).toFixed(1)}M. 24h: ${p.change_1d.toFixed(1)}%`,
            risk_level: Math.abs(p.change_1d) > 20 ? 'high' : Math.abs(p.change_1d) > 10 ? 'medium' : 'low',
          }, { onConflict: 'protocol_name' });
        }

        // Persist top yield opportunities to crossref
        const actionableSignals = signals.filter(s => s.actionable);
        for (const sig of actionableSignals.slice(0, 5)) {
          await sandboxedInsert(ctx, 'biblical_financial_crossref', {
            biblical_term: sig.biblical_wisdom.reference,
            financial_term: `${sig.type}_${sig.protocol}`,
            defi_concept: sig.details,
            relationship_type: 'market_signal',
            explanation: `${sig.biblical_wisdom.scripture} — ${sig.biblical_wisdom.action_guidance}`,
            practical_application: sig.details,
            risk_consideration: sig.biblical_wisdom.risk_warning,
          }, { onConflict: 'id' });
        }

        await logOperation(ctx, 'SCAN', 'defi_knowledge_base', {
          outputSummary: {
            total_signals: signals.length,
            actionable: actionableSignals.length,
            entry_signals: signals.filter(s => s.type === 'entry').length,
            exit_signals: signals.filter(s => s.type === 'exit').length,
            arbitrage: signals.filter(s => s.type === 'arbitrage').length,
            farming: signals.filter(s => s.type === 'farming').length,
            warnings: signals.filter(s => s.type === 'warning').length,
          },
        });

        // Categorize signals
        const byType: Record<string, OpportunitySignal[]> = {};
        for (const s of signals) {
          if (!byType[s.type]) byType[s.type] = [];
          byType[s.type].push(s);
        }

        return {
          scan_timestamp: new Date().toISOString(),
          total_signals: signals.length,
          actionable_signals: actionableSignals.length,
          prices,
          protocols_scanned: protocols.length,
          yield_pools_found: yieldPools.length,
          signals_by_type: Object.fromEntries(
            Object.entries(byType).map(([type, sigs]) => [type, { count: sigs.length, top: sigs.slice(0, 3) }])
          ),
          top_opportunities: actionableSignals
            .sort((a, b) => {
              const strength = { strong: 3, moderate: 2, weak: 1 };
              return strength[b.signal_strength] - strength[a.signal_strength];
            })
            .slice(0, 10),
        };
      }
    );

    return new Response(JSON.stringify({ agent: 'defi-opportunity-scanner', ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('DeFi Opportunity Scanner error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
