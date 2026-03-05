import { useEffect, useState, useCallback } from 'react';
import { useConnect, useAccount } from 'wagmi';

/**
 * Detects if the app is running inside a Farcaster frame/mini-app
 * and auto-connects the embedded wallet when available.
 */
export function useFarcasterFrame() {
  const [isInsideFrame, setIsInsideFrame] = useState(false);
  const [isFrameReady, setIsFrameReady] = useState(false);
  const [frameContext, setFrameContext] = useState<any>(null);
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  // Detect if we're inside a Farcaster frame
  useEffect(() => {
    const detectFrame = () => {
      // Check for Farcaster frame environment indicators
      const isFrame =
        typeof window !== 'undefined' &&
        (window.parent !== window || // inside an iframe
          (window as any).__FARCASTER_FRAME__ ||
          new URLSearchParams(window.location.search).has('fc_frame'));
      setIsInsideFrame(isFrame);
      return isFrame;
    };

    detectFrame();
  }, []);

  // Initialize Frame SDK and signal ready
  useEffect(() => {
    if (!isInsideFrame) return;

    let cancelled = false;

    const initFrameSDK = async () => {
      try {
        const frameSdk = await import('@farcaster/frame-sdk');
        const sdk = frameSdk.default || frameSdk.sdk;

        if (!sdk) {
          console.warn('[BibleFi] Frame SDK imported but no sdk export found');
          return;
        }

        // Get context (user info, etc.)
        if (sdk.context) {
          try {
            const ctx = await sdk.context;
            if (!cancelled) {
              setFrameContext(ctx);
              console.log('[BibleFi] Farcaster frame context:', ctx);
            }
          } catch {
            // context may not be available in all environments
          }
        }

        // Signal that the frame is ready to render
        if (sdk.actions?.ready) {
          await sdk.actions.ready();
        }

        if (!cancelled) {
          setIsFrameReady(true);
          console.log('[BibleFi] Farcaster Frame SDK ready');
        }
      } catch (err) {
        console.warn('[BibleFi] Frame SDK init failed (not in frame?):', err);
      }
    };

    initFrameSDK();

    return () => {
      cancelled = true;
    };
  }, [isInsideFrame]);

  // Auto-connect the Farcaster wallet connector when inside a frame
  useEffect(() => {
    if (!isFrameReady || isConnected) return;

    const farcasterConnector = connectors.find(
      (c) => c.id === 'farcasterFrame' || c.name === 'Farcaster' || c.id === 'farcaster'
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

  const closeFrame = useCallback(async (toastMessage?: string) => {
    try {
      const frameSdk = await import('@farcaster/frame-sdk');
      const sdk = frameSdk.default || frameSdk.sdk;
      if (sdk?.actions?.close) {
        if (toastMessage) {
          await (sdk.actions.close as any)({ toast: { message: toastMessage } });
        } else {
          await sdk.actions.close();
        }
      }
    } catch {
      // Not in frame
    }
  }, []);

  return {
    isInsideFrame,
    isFrameReady,
    frameContext,
    closeFrame,
  };
}
