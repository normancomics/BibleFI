
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;

// Define the global type for TypeScript
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}
