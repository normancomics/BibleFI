
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
    logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880"
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389"
  },
  DAI: {
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18,
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    logoURI: "https://assets.coingecko.com/coins/images/9956/small/4943.png?1636636734"
  },
  USDT: {
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png?1668148663"
  },
  WETH: {
    name: "Wrapped Ethereum",
    symbol: "WETH",
    decimals: 18,
    address: "0x4200000000000000000000000000000000000006",
    logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295"
  },
  WBTC: {
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    decimals: 8,
    address: "0x1ceA84203673764244E05693e42E6Ace62bE9BA5",
    logoURI: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png?1548822744"
  },
  cbBTC: {
    name: "Coinbase Wrapped Bitcoin",
    symbol: "cbBTC",
    decimals: 8,
    address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    logoURI: "https://assets.coingecko.com/coins/images/33052/small/cbBTC_icon_yellowgradient.png?1701077237"
  },
  cbETH: {
    name: "Coinbase Wrapped Ethereum",
    symbol: "cbETH",
    decimals: 18,
    address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    logoURI: "https://assets.coingecko.com/coins/images/27008/small/cbeth.png?1661171210"
  },
  FRAX: {
    name: "Frax",
    symbol: "FRAX",
    decimals: 18,
    address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    logoURI: "https://assets.coingecko.com/coins/images/13422/small/frax_logo.png?1608476506"
  },
  USDbC: {
    name: "USD Base Coin",
    symbol: "USDbC",
    decimals: 6,
    address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389"
  }
};
