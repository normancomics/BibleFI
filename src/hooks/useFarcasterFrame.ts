import { useEffect, useState, useCallback } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';

type MiniAppContext = Awaited<typeof sdk.context>;

/**
 * Farcaster / Base App mini app bootstrap hook.
 *
 * Must be mounted once near the app root (see MiniAppBootstrap): it detects
 * the mini app host, signals `sdk.actions.ready()` so the host dismisses the
 * splash screen (without this the app hangs on the splash forever), exposes
 * the host context, and auto-connects the host's embedded wallet.
 */
export function useFarcasterFrame() {
  const [isInsideFrame, setIsInsideFrame] = useState(false);
  const [isFrameReady, setIsFrameReady] = useState(false);
  const [frameContext, setFrameContext] = useState<MiniAppContext | null>(null);
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  // Detect the mini app host and signal ready. Detection uses the SDK's own
  // handshake (not iframe heuristics); everything is a no-op in a plain browser.
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();
        if (cancelled) return;
        setIsInsideFrame(inMiniApp);
        if (!inMiniApp) return;

        try {
          const ctx = await sdk.context;
          if (!cancelled && ctx) {
            setFrameContext(ctx);
            console.log('[BibleFi] Farcaster mini app context:', ctx);
          }
        } catch {
          // context may not be available in all hosts
        }

        // Dismiss the host splash screen once the app has rendered.
        await sdk.actions.ready();
        if (!cancelled) {
          setIsFrameReady(true);
          console.log('[BibleFi] Farcaster mini app ready');
        }
      } catch (err) {
        console.warn('[BibleFi] Mini app SDK init failed (not in mini app?):', err);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-connect the host's embedded wallet once ready.
  useEffect(() => {
    if (!isFrameReady || isConnected) return;

    const farcasterConnector = connectors.find(
      (c) => c.id === 'farcaster' || c.id === 'farcasterFrame' || c.name === 'Farcaster'
    );

    if (farcasterConnector) {
      console.log('[BibleFi] Auto-connecting Farcaster wallet...');
      // Small delay to let wagmi fully initialize
      const timer = setTimeout(() => {
        connect({ connector: farcasterConnector });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFrameReady, isConnected, connectors, connect]);

  const closeFrame = useCallback(async () => {
    try {
      await sdk.actions.close();
    } catch {
      // Not in a mini app
    }
  }, []);

  return {
    isInsideFrame,
    isFrameReady,
    frameContext,
    closeFrame,
  };
}
