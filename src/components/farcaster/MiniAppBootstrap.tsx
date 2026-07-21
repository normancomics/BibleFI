import { useFarcasterFrame } from '@/hooks/useFarcasterFrame';

/**
 * Renders nothing; mounts the Farcaster/Base App mini app handshake once at
 * the app root. Without the `sdk.actions.ready()` call this triggers, mini
 * app hosts never dismiss their splash screen.
 */
export function MiniAppBootstrap() {
  useFarcasterFrame();
  return null;
}
