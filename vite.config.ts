
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
      // Alias ethers imports from Superfluid SDK to our compatibility shim
      'ethers': path.resolve(__dirname, './src/lib/ethers-shim.ts'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer'],
    exclude: ['@superfluid-finance/sdk-core'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}))
