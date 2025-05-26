
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
  }
};
