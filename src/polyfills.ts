import { Buffer } from 'buffer';

// Import BigNumber shim for ethers v5 compatibility
import { BigNumber } from './lib/ethers-shim';

// Make Buffer available globally
(globalThis as any).Buffer = Buffer;

// Make BigNumber available globally for Superfluid SDK
(globalThis as any).BigNumber = BigNumber;

// Create a minimal process polyfill
const processPolyfill = {
  env: {},
  browser: true,
  version: '',
  versions: {},
  nextTick: (fn: Function) => setTimeout(fn, 0),
  cwd: () => '/',
  platform: 'browser'
};

(globalThis as any).process = processPolyfill;

// Also add to window for compatibility
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).process = processPolyfill;
  (window as any).BigNumber = BigNumber;
}
