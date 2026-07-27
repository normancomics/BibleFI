import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from "lovable-tagger"
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mcpPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer', 'ethers'],
    // Restrict the dependency scan to the app's own entry. Without this, Vite
    // crawls stray HTML files under contracts_forge/lib (the vendored
    // Superfluid/OpenZeppelin Foundry deps) and aborts pre-bundling on their
    // unrelated imports.
    entries: ['index.html', 'src/**/*.{ts,tsx}'],
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
    rollupOptions: {
      shimMissingExports: true,
      output: {
        // Split heavy, rarely-changing vendor code out of the entry chunk so
        // the first mobile load (Farcaster / Base App) stays small and the
        // chunks cache independently across deploys.
        // Rolldown (Vite 8) requires the function form here.
        manualChunks(id: string) {
          const path = id.replace(/\\/g, '/');
          if (!path.includes('node_modules')) return undefined;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(path)) return 'vendor-react';
          if (/node_modules\/react-router/.test(path)) return 'vendor-react';
          if (/node_modules\/(ethers|viem|wagmi|@wagmi|@walletconnect|@reown)\//.test(path)) return 'vendor-web3';
          if (/node_modules\/(recharts|d3-[a-z]+)\//.test(path)) return 'vendor-charts';
          if (/node_modules\/three\//.test(path)) return 'vendor-3d';
          if (/node_modules\/framer-motion\//.test(path)) return 'vendor-motion';
          return undefined;
        },
      },
    },
  },
}))
