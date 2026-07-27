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
    },
  },
}))
