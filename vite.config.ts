import { fileURLToPath, URL } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, loadEnv } from 'vite';
import { devServer } from './server/dev.ts';

export default defineConfig(({ mode }) => ({
  // devServer runs the Vercel sign-in middleware and the /api functions in `bun run dev`.
  plugins: [svelte(), devServer(loadEnv(mode, process.cwd(), ''))],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  build: {
    // Never inline fonts as data: URIs — the CSP is font-src 'self'.
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined)
  }
}));
