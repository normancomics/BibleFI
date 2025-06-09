
// Configuration for Farcaster integration
export const FARCASTER_CONFIG = {
  domain: 'biblefi.base.eth',
  siweUri: 'https://biblefi.base.eth/api/auth/callback',
  rpcUrl: 'https://mainnet.base.org',
  relay: 'https://relay.farcaster.xyz',
  version: 'vNext',
  
  // For Farcaster Mini-App (Frames)
  frameConfig: {
    imageUrl: 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/generate-image?type=default',
    aspectRatio: '1.91:1',
    buttons: [
      {
        label: 'Biblical Wisdom',
        action: 'post'
      },
      {
        label: 'DeFi Swaps',
        action: 'post'
      },
      {
        label: 'Digital Tithing',
        action: 'post'
      },
      {
        label: 'Share Wisdom',
        action: 'post'
      }
    ],
    postUrl: 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/frame-handler'
  }
};

export const APP_CONFIG = {
  name: 'biblefi.base.eth',
  description: 'Biblical wisdom for your financial journey',
  icon: 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/generate-image?type=default',
  canonical: 'https://biblefi.base.eth',
  // Farcaster API key will be retrieved from Supabase secrets in server-side functions
  farcasterApi: {
    enabled: true,
    // API key now securely stored in Supabase secrets
  },
  // Base Chain configuration
  baseChain: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    iconUrl: '/lovable-uploads/922260ef-cba9-4437-9d77-07bcba6560aa.png'
  },
  // Treasury configuration for $BIBLE token
  treasury: {
    // This should be set to the actual biblefi.base.eth ENS address when deployed
    address: '0x0000000000000000000000000000000000000000', // Placeholder - needs actual ENS resolution
    ensName: 'biblefi.base.eth'
  },
  // Integration partners
  integrations: {
    superfluid: {
      enabled: true,
      appUrl: 'https://app.superfluid.finance'
    },
    odos: {
      enabled: true,
      appUrl: 'https://app.odos.xyz'
    },
    daimo: {
      enabled: true,
      appUrl: 'https://app.daimo.com'
    }
  }
};
