
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
    logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628"
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    logoURI: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696485980"
  },
  DAI: {
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18,
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    logoURI: "https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png?1696509996"
  },
  USDT: {
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    logoURI: "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661"
  },
  WETH: {
    name: "Wrapped Ethereum",
    symbol: "WETH",
    decimals: 18,
    address: "0x4200000000000000000000000000000000000006",
    logoURI: "https://assets.coingecko.com/coins/images/2518/standard/weth.png?1696503332"
  },
  WBTC: {
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    decimals: 8,
    address: "0x1ceA84203673764244E05693e42E6Ace62bE9BA5",
    logoURI: "https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png?1696507857"
  },
  cbBTC: {
    name: "Coinbase Wrapped Bitcoin",
    symbol: "cbBTC",
    decimals: 8,
    address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    logoURI: "https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp?1726136636"
  },
  cbETH: {
    name: "Coinbase Wrapped Ethereum",
    symbol: "cbETH",
    decimals: 18,
    address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    logoURI: "https://assets.coingecko.com/coins/images/27008/standard/cbeth.png?1709186989"
  },
  FRAX: {
    name: "Frax",
    symbol: "FRAX",
    decimals: 18,
    address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    logoURI: "https://assets.coingecko.com/coins/images/13422/standard/FRAX_icon.png?1696513182"
  },
  USDbC: {
    name: "USD Base Coin",
    symbol: "USDbC",
    decimals: 6,
    address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
    logoURI: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696485980"
  },
  // Superfluid tokens
  SUP: {
    name: "Superfluid",
    symbol: "SUP",
    decimals: 18,
    address: "0x2740267Ef48ED3a8F2E9FA6A5De7F0e7E66e250c",
    logoURI: "https://assets.coingecko.com/coins/images/68697/standard/sup.png?1756287343"
  },
  USDCx: {
    name: "Super USDC",
    symbol: "USDCx",
    decimals: 18,
    address: "0x4dd8db0c491c475f1335e0eaa58ab8601f26c86f",
    logoURI: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696485980"
  },
  ETHx: {
    name: "Super ETH",
    symbol: "ETHx",
    decimals: 18,
    address: "0x46fd5cfB4c12D87acD3a13e92BAa53240C661D93",
    logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628"
  },
  DAIx: {
    name: "Super DAI",
    symbol: "DAIx",
    decimals: 18,
    address: "0x708169c8C87563Ce904E0a7F3BFC1F3b0b767f41",
    logoURI: "https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png?1696509996"
  },
  // Veil.cash
  VEIL: {
    name: "Veil Cash",
    symbol: "VEIL",
    decimals: 18,
    address: "0x27D2DECb4bFC9C76F0309b8E88dec3a601Fe25a8",
    logoURI: "https://assets.coingecko.com/coins/images/53282/standard/avatar_x_fc.png?1735980729"
  },
  // Base ecosystem tokens
  AERO: {
    name: "Aerodrome Finance",
    symbol: "AERO",
    decimals: 18,
    address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
    logoURI: "https://assets.coingecko.com/coins/images/31745/standard/token.png?1696530564"
  },
  DEGEN: {
    name: "Degen",
    symbol: "DEGEN",
    decimals: 18,
    address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
    logoURI: "https://assets.coingecko.com/coins/images/34515/standard/android-chrome-512x512.png?1706198225"
  },
  BRETT: {
    name: "Brett",
    symbol: "BRETT",
    decimals: 18,
    address: "0x532f27101965dd16442E59d40670FaF5eBB142E4",
    logoURI: "https://assets.coingecko.com/coins/images/33747/standard/ogbretttttttt.jpg?1703454425"
  },
  TOSHI: {
    name: "Toshi",
    symbol: "TOSHI",
    decimals: 18,
    address: "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4",
    logoURI: "https://assets.coingecko.com/coins/images/31126/standard/Toshi_Logo_-_Circular.png?1721677476"
  },
  HIGHER: {
    name: "Higher",
    symbol: "HIGHER",
    decimals: 18,
    address: "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe",
    logoURI: "https://assets.coingecko.com/coins/images/36084/standard/200x200logo.png?1710427814"
  },
  rETH: {
    name: "Rocket Pool ETH",
    symbol: "rETH",
    decimals: 18,
    address: "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c",
    logoURI: "https://assets.coingecko.com/coins/images/20764/small/reth.png"
  },
  wstETH: {
    name: "Wrapped stETH",
    symbol: "wstETH",
    decimals: 18,
    address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
    logoURI: "https://assets.coingecko.com/coins/images/18834/small/wstETH.png"
  },
  COMP: {
    name: "Compound",
    symbol: "COMP",
    decimals: 18,
    address: "0x9e1028F5F1D5eDE59748FFceE5532509976840E0",
    logoURI: "https://assets.coingecko.com/coins/images/10775/small/COMP.png"
  },
  SNX: {
    name: "Synthetix",
    symbol: "SNX",
    decimals: 18,
    address: "0x22e6966B799c4D5B13BE962E1D117b56327FDa66",
    logoURI: "https://assets.coingecko.com/coins/images/3406/small/SNX.png"
  },
  AAVE: {
    name: "Aave",
    symbol: "AAVE",
    decimals: 18,
    address: "0x18709E89BD403F470088aBDAcEbE86CC60dda12e",
    logoURI: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png"
  },
  UNI: {
    name: "Uniswap",
    symbol: "UNI",
    decimals: 18,
    address: "0xc3De830EA07524a0761646a6a4e4be0e114a3C83",
    logoURI: "https://assets.coingecko.com/coins/images/12504/small/uni.jpg"
  },
  SUSHI: {
    name: "SushiSwap",
    symbol: "SUSHI",
    decimals: 18,
    address: "0x7D49a065D17d6d4a55dc13649901fdBB98B2AFBA",
    logoURI: "https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png"
  }
};
