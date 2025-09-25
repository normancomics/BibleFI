
import { Buffer } from 'buffer';
import process from 'process/browser';

// Make Buffer and process available globally
(globalThis as any).Buffer = Buffer;
(globalThis as any).process = process;

// Also add to window for compatibility
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).process = process;
}

// Define the global types for TypeScript
declare global {
  interface Window {
    Buffer: typeof Buffer;
    process: typeof process;
  }
  
  var Buffer: typeof Buffer;
  var process: typeof process;
}
