import contractMetadata from '@metamask/contract-metadata';
import { baseTokens } from '@/data/baseTokens';

export interface EnhancedTokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  logoURI?: string;
  chainId: number;
  verified?: boolean;
  isStablecoin?: boolean;
  category?: string;
}

class TokenMetadataService {
  private baseChainId = 8453; // Base chain ID
  
  // MetaMask metadata is primarily for mainnet, but we can use it for logo fallbacks
  private getMetaMaskMetadata(address: string) {
    return contractMetadata[address.toLowerCase()] || null;
  }

  // Enhanced token info combining our Base tokens with MetaMask metadata
  getEnhancedTokenInfo(symbolOrAddress: string): EnhancedTokenInfo | null {
    // First check our Base tokens
    const baseToken = baseTokens[symbolOrAddress.toUpperCase()];
    if (baseToken) {
      return {
        ...baseToken,
        chainId: this.baseChainId,
        verified: true,
        isStablecoin: this.isStablecoin(baseToken.symbol),
        category: this.getTokenCategory(baseToken.symbol)
      };
    }

    // Check if it's an address and try MetaMask metadata
    if (symbolOrAddress.startsWith('0x')) {
      const metadata = this.getMetaMaskMetadata(symbolOrAddress);
      if (metadata) {
        return {
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          address: symbolOrAddress,
          logoURI: this.getLogoUrl(metadata.logo),
          chainId: 1, // MetaMask metadata is for mainnet
          verified: true,
          isStablecoin: this.isStablecoin(metadata.symbol),
          category: this.getTokenCategory(metadata.symbol)
        };
      }
    }

    return null;
  }

  // Get all supported tokens (Base + common mainnet for reference)
  getAllSupportedTokens(): EnhancedTokenInfo[] {
    const tokens: EnhancedTokenInfo[] = [];
    
    // Add our Base tokens
    Object.values(baseTokens).forEach(token => {
      tokens.push({
        ...token,
        chainId: this.baseChainId,
        verified: true,
        isStablecoin: this.isStablecoin(token.symbol),
        category: this.getTokenCategory(token.symbol)
      });
    });

    return tokens;
  }

  // Get logo URL from MetaMask metadata
  private getLogoUrl(logoFileName?: string): string | undefined {
    if (!logoFileName) return undefined;
    return `https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/${logoFileName}`;
  }

  // Determine if token is a stablecoin
  private isStablecoin(symbol: string): boolean {
    const stablecoins = ['USDC', 'USDT', 'DAI', 'FRAX', 'USDbC', 'BUSD', 'TUSD'];
    return stablecoins.includes(symbol.toUpperCase());
  }

  // Categorize tokens
  private getTokenCategory(symbol: string): string {
    const categories: Record<string, string> = {
      'ETH': 'native',
      'WETH': 'wrapped',
      'BTC': 'wrapped',
      'WBTC': 'wrapped',
      'cbBTC': 'wrapped',
      'cbETH': 'wrapped',
      'USDC': 'stablecoin',
      'USDT': 'stablecoin',
      'DAI': 'stablecoin',
      'FRAX': 'stablecoin',
      'USDbC': 'stablecoin'
    };
    
    return categories[symbol.toUpperCase()] || 'token';
  }

  // Search tokens by name or symbol
  searchTokens(query: string): EnhancedTokenInfo[] {
    const allTokens = this.getAllSupportedTokens();
    const lowercaseQuery = query.toLowerCase();
    
    return allTokens.filter(token => 
      token.name.toLowerCase().includes(lowercaseQuery) ||
      token.symbol.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Validate token address format
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Get token price category for biblical wisdom matching
  getBiblicalWisdomCategory(symbol: string): string {
    if (this.isStablecoin(symbol)) {
      return 'stability'; // "A good name is better than fine perfume" - Ecclesiastes 7:1
    }
    
    if (['BTC', 'WBTC', 'cbBTC'].includes(symbol.toUpperCase())) {
      return 'store_of_value'; // "Store up treasures in heaven" - Matthew 6:20
    }
    
    if (['ETH', 'WETH', 'cbETH'].includes(symbol.toUpperCase())) {
      return 'utility'; // "Whatever you do, work at it with all your heart" - Colossians 3:23
    }
    
    return 'general'; // "Be wise in the way you act toward outsiders" - Colossians 4:5
  }
}

export const tokenMetadataService = new TokenMetadataService();