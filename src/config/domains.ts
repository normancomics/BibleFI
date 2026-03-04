// Domain configuration for BibleFi deployment
export const DOMAIN_CONFIG = {
  // Primary domains
  production: {
    primary: 'biblefi.base.eth',
    canonical: 'https://biblefi.base.eth',
    frame: 'https://biblefi.base.eth/frame.html',
    api: 'https://biblefi.base.eth/api',
  },
  
  // Alternative domains
  alternatives: {
    eth: 'biblefi.eth',
    legacy: 'biblefi.app',
  },
  
  // GitHub Pages configuration
  github: {
    username: 'biblefi', // Replace with actual GitHub username
    repository: 'biblefi-app',
    domain: 'biblefi.github.io',
    customDomain: 'biblefi.app', // Custom domain for GitHub Pages
    url: 'https://biblefi.github.io/biblefi-app',
  },
  
  // Development domains
  development: {
    lovable: 'fa7c5ef0-7079-46e3-a705-c9b6e519b067.lovableproject.com',
    local: 'localhost:5173',
  },
};

// Get current domain configuration
export function getCurrentDomainConfig() {
  if (typeof window === 'undefined') {
    return DOMAIN_CONFIG.production;
  }
  
  const hostname = window.location.hostname;
  
  if (hostname.includes('lovableproject.com')) {
    return {
      ...DOMAIN_CONFIG.development,
      current: hostname,
      canonical: window.location.origin,
      frame: `${window.location.origin}/frame.html`,
      api: `${window.location.origin}/api`,
    };
  }
  
  if (hostname.includes('github.io') || hostname === DOMAIN_CONFIG.github.customDomain) {
    return {
      ...DOMAIN_CONFIG.github,
      canonical: window.location.origin,
      frame: `${window.location.origin}/frame.html`,
      api: `${window.location.origin}/api`,
    };
  }
  
  // Default to production config
  return DOMAIN_CONFIG.production;
}

// ENS domain resolver
export async function resolveENSDomain(ensName: string): Promise<string | null> {
  try {
    // This would typically use an ENS resolver
    // For now, return mapped domains
    const ensMapping: Record<string, string> = {
      'biblefi.base.eth': 'https://biblefi.base.eth',
      'biblefi.eth': 'https://biblefi.eth',
    };
    
    return ensMapping[ensName] || null;
  } catch (error) {
    console.error('ENS resolution failed:', error);
    return null;
  }
}