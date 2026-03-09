
export type TokenCategory = 'native' | 'stablecoin' | 'defi' | 'memecoin' | 'superfluid' | 'lsd' | 'privacy';

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  logoURI?: string;
  category: TokenCategory;
}

export const TOKEN_CATEGORIES: { key: TokenCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'stablecoin', label: 'Stablecoins' },
  { key: 'defi', label: 'DeFi' },
  { key: 'memecoin', label: 'Memecoins' },
  { key: 'superfluid', label: 'Superfluid' },
  { key: 'native', label: 'Native' },
  { key: 'lsd', label: 'LSDs' },
];

export const baseTokens: Record<string, TokenInfo> = {
  ETH: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    address: "0x0000000000000000000000000000000000000000",
    logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628",
    category: 'native'
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    logoURI: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696485980",
    category: 'stablecoin'
  },
  DAI: {
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18,
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    logoURI: "https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png?1696509996",
    category: 'stablecoin'
  },
  USDT: {
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    logoURI: "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661",
    category: 'stablecoin'
  },
  WETH: {
    name: "Wrapped Ethereum",
    symbol: "WETH",
    decimals: 18,
    address: "0x4200000000000000000000000000000000000006",
    logoURI: "https://assets.coingecko.com/coins/images/2518/standard/weth.png?1696503332",
    category: 'native'
  },
  WBTC: {
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    decimals: 8,
    address: "0x1ceA84203673764244E05693e42E6Ace62bE9BA5",
    logoURI: "https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png?1696507857",
    category: 'native'
  },
  cbBTC: {
    name: "Coinbase Wrapped Bitcoin",
    symbol: "cbBTC",
    decimals: 8,
    address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    logoURI: "https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp?1726136636",
    category: 'native'
  },
  cbETH: {
    name: "Coinbase Wrapped Ethereum",
    symbol: "cbETH",
    decimals: 18,
    address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    logoURI: "https://assets.coingecko.com/coins/images/27008/standard/cbeth.png?1709186989",
    category: 'lsd'
  },
  FRAX: {
    name: "Frax",
    symbol: "FRAX",
    decimals: 18,
    address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    logoURI: "https://assets.coingecko.com/coins/images/13422/standard/FRAX_icon.png?1696513182",
    category: 'stablecoin'
  },
  USDbC: {
    name: "USD Base Coin",
    symbol: "USDbC",
    decimals: 6,
    address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
    logoURI: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696485980",
    category: 'stablecoin'
  },
  SUP: {
    name: "Superfluid",
    symbol: "SUP",
    decimals: 18,
    address: "0x2740267Ef48ED3a8F2E9FA6A5De7F0e7E66e250c",
    logoURI: "https://assets.coingecko.com/coins/images/68697/standard/sup.png?1756287343",
    category: 'superfluid'
  },
  USDCx: {
    name: "Super USDC",
    symbol: "USDCx",
    decimals: 18,
    address: "0x4dd8db0c491c475f1335e0eaa58ab8601f26c86f",
    logoURI: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696485980",
    category: 'superfluid'
  },
  ETHx: {
    name: "Super ETH",
    symbol: "ETHx",
    decimals: 18,
    address: "0x46fd5cfB4c12D87acD3a13e92BAa53240C661D93",
    logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628",
    category: 'superfluid'
  },
  DAIx: {
    name: "Super DAI",
    symbol: "DAIx",
    decimals: 18,
    address: "0x708169c8C87563Ce904E0a7F3BFC1F3b0b767f41",
    logoURI: "https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png?1696509996",
    category: 'superfluid'
  },
  VEIL: {
    name: "Veil Cash",
    symbol: "VEIL",
    decimals: 18,
    address: "0x27D2DECb4bFC9C76F0309b8E88dec3a601Fe25a8",
    logoURI: "https://assets.coingecko.com/coins/images/53282/standard/avatar_x_fc.png?1735980729",
    category: 'privacy'
  },
  AERO: {
    name: "Aerodrome Finance",
    symbol: "AERO",
    decimals: 18,
    address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
    logoURI: "https://assets.coingecko.com/coins/images/31745/standard/token.png?1696530564",
    category: 'defi'
  },
  DEGEN: {
    name: "Degen",
    symbol: "DEGEN",
    decimals: 18,
    address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
    logoURI: "https://assets.coingecko.com/coins/images/34515/standard/android-chrome-512x512.png?1706198225",
    category: 'memecoin'
  },
  BRETT: {
    name: "Brett",
    symbol: "BRETT",
    decimals: 18,
    address: "0x532f27101965dd16442E59d40670FaF5eBB142E4",
    logoURI: "https://assets.coingecko.com/coins/images/33747/standard/ogbretttttttt.jpg?1703454425",
    category: 'memecoin'
  },
  TOSHI: {
    name: "Toshi",
    symbol: "TOSHI",
    decimals: 18,
    address: "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4",
    logoURI: "https://assets.coingecko.com/coins/images/31126/standard/Toshi_Logo_-_Circular.png?1721677476",
    category: 'memecoin'
  },
  HIGHER: {
    name: "Higher",
    symbol: "HIGHER",
    decimals: 18,
    address: "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe",
    logoURI: "https://assets.coingecko.com/coins/images/36084/standard/200x200logo.png?1710427814",
    category: 'memecoin'
  },
  rETH: {
    name: "Rocket Pool ETH",
    symbol: "rETH",
    decimals: 18,
    address: "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c",
    logoURI: "https://assets.coingecko.com/coins/images/20764/standard/reth.png?1696520456",
    category: 'lsd'
  },
  wstETH: {
    name: "Wrapped stETH",
    symbol: "wstETH",
    decimals: 18,
    address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
    logoURI: "https://assets.coingecko.com/coins/images/18834/standard/wstETH.png?1696518295",
    category: 'lsd'
  },
  COMP: {
    name: "Compound",
    symbol: "COMP",
    decimals: 18,
    address: "0x9e1028F5F1D5eDE59748FFceE5532509976840E0",
    logoURI: "https://assets.coingecko.com/coins/images/10775/standard/COMP.png?1696510737",
    category: 'defi'
  },
  SNX: {
    name: "Synthetix",
    symbol: "SNX",
    decimals: 18,
    address: "0x22e6966B799c4D5B13BE962E1D117b56327FDa66",
    logoURI: "https://assets.coingecko.com/coins/images/3406/standard/SNX.png?1696504103",
    category: 'defi'
  },
  AAVE: {
    name: "Aave",
    symbol: "AAVE",
    decimals: 18,
    address: "0x18709E89BD403F470088aBDAcEbE86CC60dda12e",
    logoURI: "https://assets.coingecko.com/coins/images/12645/standard/aave-token-round.png?1720472354",
    category: 'defi'
  },
  UNI: {
    name: "Uniswap",
    symbol: "UNI",
    decimals: 18,
    address: "0xc3De830EA07524a0761646a6a4e4be0e114a3C83",
    logoURI: "https://assets.coingecko.com/coins/images/12504/standard/uni.jpg?1696512319",
    category: 'defi'
  },
  SUSHI: {
    name: "SushiSwap",
    symbol: "SUSHI",
    decimals: 18,
    address: "0x7D49a065D17d6d4a55dc13649901fdBB98B2AFBA",
    logoURI: "https://assets.coingecko.com/coins/images/12271/standard/512x512_Logo_no_chop.png?1696512101",
    category: 'defi'
  }
};
