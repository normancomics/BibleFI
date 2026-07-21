import React from 'react';
import {
  WalletMetamask,
  WalletRainbow,
  WalletCoinbase,
  WalletWalletConnect,
} from '@web3icons/react';

/**
 * Official Farcaster "arch" logomark (not shipped by @web3icons) — white glyph
 * on the brand purple (#855DCD) rounded tile, matching the other wallet tiles.
 */
export function FarcasterIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1000 1000" role="img" aria-label="Farcaster">
      <rect width="1000" height="1000" rx="200" fill="#855DCD" />
      <path
        d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z"
        fill="#fff"
      />
      <path
        d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"
        fill="#fff"
      />
      <path
        d="M871.111 253.333L842.222 351.111H817.778V746.667C830.051 746.667 840 756.616 840 768.889V795.556H844.444C856.717 795.556 866.667 805.505 866.667 817.778V844.444H617.778V817.778C617.778 805.505 627.727 795.556 640 795.556H644.444V768.889C644.444 756.616 654.394 746.667 666.667 746.667H693.333V253.333H871.111Z"
        fill="#fff"
      />
    </svg>
  );
}

/**
 * Brand icon for a wagmi connector, keyed by connector id (with a name
 * fallback for injected providers that announce their own names).
 */
export function WalletConnectorIcon({ connectorId, connectorName, size = 40 }: {
  connectorId: string;
  connectorName?: string;
  size?: number;
}) {
  const name = (connectorName ?? '').toLowerCase();

  if (connectorId === 'farcaster' || connectorId === 'farcasterFrame' || name.includes('farcaster')) {
    return <FarcasterIcon size={size} />;
  }
  if (connectorId === 'rainbow' || name.includes('rainbow')) {
    return <WalletRainbow size={size} variant="background" />;
  }
  if (connectorId === 'walletConnect' || name.includes('walletconnect')) {
    return <WalletWalletConnect size={size} variant="background" />;
  }
  if (connectorId === 'coinbaseWalletSDK' || name.includes('coinbase')) {
    return <WalletCoinbase size={size} variant="background" />;
  }
  if (connectorId === 'injected' || connectorId === 'metaMaskSDK' || name.includes('metamask') || name.includes('browser')) {
    return <WalletMetamask size={size} variant="background" />;
  }
  return <WalletWalletConnect size={size} variant="mono" />;
}
