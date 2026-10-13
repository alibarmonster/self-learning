import { fileURLToPath, URL } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  build: {
    // Never inline fonts as data: URIs — the CSP is font-src 'self'.
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined)
  }
});
