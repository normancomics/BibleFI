
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  logoURI?: string;
}

export const baseTokens: Record<string, TokenInfo> = {
  ETH: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    address: "0x0000000000000000000000000000000000000000",
    logoURI: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png"
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    logoURI: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png"
  },
  DAI: {
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18,
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    logoURI: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png"
  },
  USDT: {
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    logoURI: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png"
  },
  WETH: {
    name: "Wrapped Ethereum",
    symbol: "WETH",
    decimals: 18,
    address: "0x4200000000000000000000000000000000000006",
    logoURI: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png"
  },
  WBTC: {
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    decimals: 8,
    address: "0x1ceA84203673764244E05693e42E6Ace62bE9BA5",
    logoURI: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png"
  },
  cbBTC: {
    name: "Coinbase Wrapped Bitcoin",
    symbol: "cbBTC",
    decimals: 8,
    address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    logoURI: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png"
  },
  cbETH: {
    name: "Coinbase Wrapped Ethereum",
    symbol: "cbETH",
    decimals: 18,
    address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    logoURI: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png"
  },
  FRAX: {
    name: "Frax",
    symbol: "FRAX",
    decimals: 18,
    address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    logoURI: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png"
  },
  USDbC: {
    name: "USD Base Coin",
    symbol: "USDbC",
    decimals: 6,
    address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
    logoURI: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png"
  }
};
