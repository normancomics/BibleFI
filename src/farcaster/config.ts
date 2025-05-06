
// Configuration for Farcaster integration
export const FARCASTER_CONFIG = {
  domain: window.location.host,
  siweUri: `https://${window.location.host}/api/auth/callback`,
  rpcUrl: process.env.VITE_FARCASTER_RPC_URL || 'https://mainnet.optimism.io',
  relay: process.env.VITE_FARCASTER_RELAY_URL || 'https://relay.farcaster.xyz',
  version: 'vNext',
};

export const APP_CONFIG = {
  name: 'Bible.fi',
  description: 'Biblical wisdom for your financial journey',
  icon: '/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png',
  canonical: typeof window !== 'undefined' ? window.location.origin : 'https://bible.fi'
};
